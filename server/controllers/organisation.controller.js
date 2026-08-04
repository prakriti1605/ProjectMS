import Organisation from "../models/organisation.model.js";
import {DEFAULT_PERMISSIONS} from "../config/rolePermission.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import crypto from "crypto";
import { logActivity } from "../utils/actvityLogger.js";

export const createOrg = async (req, res) => {
  try{
    const {name} = req.body;
    if(!name){
      return res.status(400).
      json({message:"Organisation name is required"});
    }

    const existingOrg = await Organisation.findOne({
    name,
    "members.user": req.user._id,
    "members.role": "owner"
    });

    if (existingOrg) {
        return res.status(409).json({
            message: "You already own an organisation with this name."
        });
    }

    const org = await Organisation.create({
      name,
      members:[
        {
          user:req.user._id,
          role:"owner",
          permissions:[...DEFAULT_PERMISSIONS.owner],
        },
      ],
    });
    return res.status(201).json({
      message:"Organisation created successfully",
      org,
    });
  }catch(error){
    console.log(error);
    return res.status(500).json({message:error.message});
  }
}
export const getMyOrgs = async (req, res) => {
    try {
      console.log("USER OBJECT:", req.user);
      console.log("USER ID:", req.user?._id);
      
      const orgs = await Organisation.find({
      "members.user": req.user._id
      }).populate("members.user", "username email");

        return res.status(200).json({
            organisations: orgs
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};

export const getOrgById = (req, res) => {
  return res.json(req.org);
};

export const addMember = async (req, res) => {
  console.log("Entered addMember controller");
  try {
    const { email, role } = req.body;
    // 1. find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // 2. check duplicate
    const exists = req.org.members.some(
      (m) => m.user.toString() === user._id.toString()
    );
    if (exists) {
      return res.status(400).json({ message: "Already a member" });
    }
    // 3. push member
    req.org.members.push({
      user: user._id,
      role: role || "member",
      permissions: DEFAULT_PERMISSIONS[role || "member"]
    });
    await req.org.save();
    return res.json({
      message: "Member added",
      org: req.org
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const member = req.org.members.find(
      (member) =>
        member.user._id.toString() === userId
    );

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    if (member.role === "owner") {
      return res.status(400).json({
        message: "Owner cannot be removed",
      });
    }

    const removedUser = member.user;

    const removedUsername = member.user.username || "Unknown user";
    member.deleteOne();
    await req.org.save();
    await logActivity({
      organisation: req.org._id,
      actor: req.user._id,
      action: "MEMBER_REMOVED",
      message: `${req.user.username} removed ${removedUsername} from organisation "${req.org.name}"`,
    });

    return res.status(200).json({
      message: "Member removed successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const updateOrganisation = async (req, res) => {
  try {
    const { name, description } = req.body;

    // update only allowed fields
    if (name !== undefined) {
      req.org.name = name.trim();
    }

    if (description !== undefined) {
      req.org.description = description.trim();
    }

    await req.org.save();
    await logActivity({
    organisation: req.org._id,
    actor: req.user._id,
    action: "ORG_UPDATED",
    message: `${req.user.username} updated organisation "${req.org.name}"`,
  });

    return res.json({
      message: "Organisation updated successfully",
      org: req.org,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteOrganisation = async (req, res) => {
  try {
    const organisationName = req.org.name;

    await logActivity({
      organisation: req.org._id,
      actor: req.user._id,
      action: "ORG_DELETED",
      message: `${req.user.username} deleted organisation "${organisationName}"`,
    });

    await req.org.deleteOne();

    return res.json({
      message: "Organisation deleted successfully",
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getOrganisationMembers = async (req, res) => {

    const members = await Organisation.find({
        organisation: req.params.orgId
    })
    .populate("user", "username email");

    return res.json({
        members
    });

};

export const updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // 1. Validate role
    const allowedRoles = ["member", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // 2. Find member
    // checkOrganisationAccess populates members.user,
    // so use m.user._id here.
    const member = req.org.members.find(
      (m) => m.user?._id?.toString() === userId
    );

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    // 3. Prevent changing owner's role
    if (member.role === "owner") {
      return res.status(400).json({
        message: "Owner role cannot be changed",
      });
    }

    // 4. Update role
    member.role = role;

    // 5. Reset permissions according to new role
    member.permissions = [
      ...(DEFAULT_PERMISSIONS[role] || []),
    ];

    // 6. Save organisation
    await req.org.save();

    await logActivity({
    organisation: req.org._id,
    actor: req.user._id,
    action: "MEMBER_ROLE_CHANGED",
    message: `${req.user.username} changed ${member.user.username}'s role to "${role}"`,
  });

    return res.status(200).json({
      message: "Role updated successfully",
      member,
    });

  } catch (error) {
    console.error("UPDATE MEMBER ROLE ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

const createJoinCode  = () => {
  return `TRK-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
};
export const generateJoinCode = async (req, res) => {
  try {
    const newCode = createJoinCode ();

    const expiresAt = new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    );

    req.org.joinCode = newCode;
    req.org.joinCodeExpiresAt = expiresAt;

    await req.org.save();

    await logActivity({
    organisation: req.org._id,
    actor: req.user._id,
    action: "JOIN_CODE_GENERATED",
    message: `${req.user.username} generated a new join code for organisation "${req.org.name}"`,
  });

    return res.status(200).json({
      message: "Join code generated successfully",
      joinCode: req.org.joinCode,
      expiresAt: req.org.joinCodeExpiresAt,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const joinOrganisationByCode = async (req, res) => {
  try {
    const { joinCode } = req.body;

    if (!joinCode) {
      return res.status(400).json({
        message: "Join code is required",
      });
    }

    const organisation = await Organisation.findOne({
      joinCode: joinCode.trim().toUpperCase(),
    });

    if (!organisation) {
      return res.status(404).json({
        message: "Invalid join code",
      });
    }

    if (
      !organisation.joinCodeExpiresAt ||
      organisation.joinCodeExpiresAt < new Date()
    ) {
      return res.status(400).json({
        message: "Join code has expired",
      });
    }

    const alreadyMember = organisation.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "You are already a member of this organisation",
      });
    }

    organisation.members.push({
      user: req.user._id,
      role: "member",
      permissions: [
        ...DEFAULT_PERMISSIONS.member,
      ],
    });

    await organisation.save();

    await logActivity({
    organisation: organisation._id,
    actor: req.user._id,
    action: "MEMBER_JOINED",
    message: `${req.user.username} joined organisation "${organisation.name}"`,
  });

    return res.status(200).json({
      message: "Successfully joined organisation",
      organisation,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateMemberPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body; // Array of permission strings, e.g. ["PROJECT_CREATE", "TASK_CREATE"]

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array" });
    }

    // Find member
    const member = req.org.members.find(
      (m) => m.user?._id?.toString() === userId || m.user?.toString() === userId
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Protect Owner permissions from being downgraded
    if (member.role === "owner") {
      return res.status(400).json({ message: "Owner permissions cannot be altered" });
    }

    // Update permissions array
    member.permissions = permissions;

    await req.org.save();

    await logActivity({
      organisation: req.org._id,
      actor: req.user._id,
      action: "MEMBER_PERMISSIONS_UPDATED",
      message: `${req.user.username} updated permissions for ${member.user.username || "member"}`,
    });

    return res.status(200).json({
      message: "Member permissions updated successfully",
      member,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};