import Organisation from "../models/organisation.model.js";
import OrganisationMember from "../models/organisationMember.model.js";
import User from "../models/user.model.js";
import { DEFAULT_PERMISSIONS } from "../config/rolePermission.js";
import crypto from "crypto";
import { logActivity } from "../utils/actvityLogger.js";

// 1. CREATE ORGANISATION
export const createOrg = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Organisation name is required" });
    }

    // Strict access to req.user._id
    const userId = req.user._id;

    const org = await Organisation.create({ name });

    const member = await OrganisationMember.create({
      organisation: org._id,
      user: userId,
      role: "owner",
      permissions: [...DEFAULT_PERMISSIONS.owner],
    });

    return res.status(201).json({
      message: "Organisation created successfully",
      org,
      member,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. GET ALL ORGANISATIONS FOR CURRENT USER
export const getMyOrgs = async (req, res) => {
  try {
    // 1. Fetch user's memberships and populate organisation (Your original logic)
    const memberships = await OrganisationMember.find({ user: req.user._id })
      .populate("organisation"); // [cite: 723, 732]

    const rawOrgs = memberships.map((m) => m.organisation).filter(Boolean); // [cite: 724, 735, 736]

    // 2. Safely attach memberCount and ownerName to each org document
    const orgs = await Promise.all(
      rawOrgs.map(async (org) => {
        const orgObj = org.toObject ? org.toObject() : { ...org };

        // Count total members in this organisation
        const memberCount = await OrganisationMember.countDocuments({ 
          organisation: org._id 
        });

        // Find the owner record and populate the username
        const ownerMembership = await OrganisationMember.findOne({
          organisation: org._id,
          role: "owner",
        }).populate("user", "username");

        return {
          ...orgObj,
          memberCount: memberCount || 0,
          ownerName: ownerMembership?.user?.username || "Owner Unassigned",
        };
      })
    );

    // 3. Return the exact same response structure as before
    return res.status(200).json({ organisations: orgs }); // [cite: 724, 738]
  } catch (error) {
    return res.status(500).json({ message: error.message }); // [cite: 724, 739]
  }
};

// 3. GET SINGLE ORGANISATION
export const getOrgById = (req, res) => {
  return res.json({
    org: req.org,
    member: req.member,
  });
};

// 4. ADD MEMBER
export const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const targetUser = await User.findOne({ email });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingMember = await OrganisationMember.findOne({
      organisation: req.org._id,
      user: targetUser._id,
    });

    if (existingMember) {
      return res.status(400).json({ message: "Already a member" });
    }

    const assignedRole = role || "member";
    const newMember = await OrganisationMember.create({
      organisation: req.org._id,
      user: targetUser._id,
      role: assignedRole,
      permissions: [...DEFAULT_PERMISSIONS[assignedRole]],
    });

    return res.json({
      message: "Member added successfully",
      member: newMember,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 5. REMOVE MEMBER
export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const member = await OrganisationMember.findOne({
      organisation: req.org._id,
      user: userId,
    }).populate("user", "username");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.role === "owner") {
      return res.status(400).json({ message: "Owner cannot be removed" });
    }

    await member.deleteOne();

    await logActivity({
      organisation: req.org._id,
      actor: req.user._id,
      action: "MEMBER_REMOVED",
      message: `${req.user.username} removed ${member.user?.username || "a user"} from organisation "${req.org.name}"`,
    });

    return res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 6. UPDATE MEMBER ROLE
export const updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const allowedRoles = ["member", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const member = await OrganisationMember.findOne({
      organisation: req.org._id,
      user: userId,
    }).populate("user", "username");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.role === "owner") {
      return res.status(400).json({ message: "Owner role cannot be changed" });
    }

    member.role = role;
    member.permissions = [...(DEFAULT_PERMISSIONS[role] || [])];
    await member.save();

    await logActivity({
      organisation: req.org._id,
      actor: req.user._id,
      action: "MEMBER_ROLE_CHANGED",
      message: `${req.user.username} changed ${member.user?.username}'s role to "${role}"`,
    });

    return res.status(200).json({
      message: "Role updated successfully",
      member,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 7. GET ALL ORGANISATION MEMBERS

export const getOrgMembers = async (req, res) => {
  console.log("=== DEBUG: getOrgMembers hit ===");
  console.log("req.params:", req.params);

  try {
    const { orgId } = req.params;

    // Correct Model: OrganisationMember
    const members = await OrganisationMember.find({ organisation: orgId })
      .populate("user", "username email")
      .select("user role permissions createdAt")
      .lean();

    console.log("Successfully fetched members count:", members ? members.length : 0);

    return res.status(200).json({
      success: true,
      members: members || [],
    });
  } catch (err) {
    console.error("🔥 ERROR STACK IN getOrgMembers 🔥", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 8. UPDATE ORGANISATION DETAILS
export const updateOrganisation = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { name, description } = req.body;

    // 1. Build dynamic update payload (only include fields passed in req.body)
    const updateFields = {};
    if (name !== undefined && name.trim() !== "") {
      updateFields.name = name.trim();
    }
    if (description !== undefined) {
      updateFields.description = description.trim();
    }

    // 2. Safeguard: ensure at least one field is being updated
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ 
        message: "Please provide at least one field (name or description) to update." 
      });
    }

    // 3. Atomically update only supplied fields
    const updatedOrg = await Organisation.findByIdAndUpdate(
      orgId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    return res.status(200).json({
      message: "Organisation updated successfully",
      organisation: updatedOrg,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 9. DELETE ORGANISATION
export const deleteOrganisation = async (req, res) => {
  try {
    await OrganisationMember.deleteMany({ organisation: req.org._id });
    await req.org.deleteOne();

    return res.json({ message: "Organisation deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 10. GENERATE JOIN CODE
const createJoinCode = () => {
  return `TRK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

export const generateJoinCode = async (req, res) => {
  try {
    const newCode = createJoinCode();
    const expiresAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    // Atomic update avoids Mongoose doc validation/locking issues
    const updatedOrg = await Organisation.findByIdAndUpdate(
      req.org._id,
      {
        $set: {
          joinCode: newCode,
          joinCodeExpiresAt: expiresAt,
        },
      },
      { new: true, runValidators: false }
    );

    if (!updatedOrg) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    await logActivity({
      organisation: req.org._id,
      actor: req.user._id,
      action: "JOIN_CODE_GENERATED",
      message: `${req.user.username} generated a new join code for organisation "${updatedOrg.name}"`,
    });

    return res.status(200).json({
      message: "Join code generated successfully",
      joinCode: updatedOrg.joinCode,
      expiresAt: updatedOrg.joinCodeExpiresAt,
    });
  } catch (error) {
    console.error("GENERATE JOIN CODE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 11. JOIN ORGANISATION BY CODE
export const joinOrganisationByCode = async (req, res) => {
  try {
    const { joinCode } = req.body;
    if (!joinCode) {
      return res.status(400).json({ message: "Join code is required" });
    }

    const organisation = await Organisation.findOne({
      joinCode: joinCode.trim().toUpperCase(),
    });

    if (!organisation) {
      return res.status(404).json({ message: "Invalid join code" });
    }

    if (!organisation.joinCodeExpiresAt || organisation.joinCodeExpiresAt < new Date()) {
      return res.status(400).json({ message: "Join code has expired" });
    }

    const existingMember = await OrganisationMember.findOne({
      organisation: organisation._id,
      user: req.user._id,
    });

    if (existingMember) {
      return res.status(400).json({ message: "You are already a member of this organisation" });
    }

    const newMember = await OrganisationMember.create({
      organisation: organisation._id,
      user: req.user._id,
      role: "member",
      permissions: [...DEFAULT_PERMISSIONS.member],
    });

    return res.status(200).json({
      message: "Successfully joined organisation",
      organisation,
      member: newMember,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};