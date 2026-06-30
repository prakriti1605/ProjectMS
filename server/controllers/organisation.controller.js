import Organisation from "../models/organisation.model.js";
import {DEFAULT_PERMISSIONS} from "../config/rolePermission.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

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
      });

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
    const { memberId } = req.params;

    // Find member
    const member = req.org.members.id(memberId);

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    // Don't allow removing owner
    if (member.role === "owner") {
      return res.status(400).json({
        message: "Owner cannot be removed",
      });
    }

    // Remove member
    member.deleteOne();

    await req.org.save();

    return res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // 1. validate role
    const allowedRoles = ["member", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // 2. find member
    const member = req.org.members.find(
      (m) => m.user.toString() === userId
    );

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    // 3. prevent changing owner
    if (member.role === "owner") {
      return res.status(400).json({
        message: "Owner role cannot be changed",
      });
    }

    // 4. update role
    member.role = role;
    member.permissions = DEFAULT_PERMISSIONS[role] || [];

    await req.org.save();

    return res.json({
      message: "Role updated successfully",
      member,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const updateOrganisation = async (req, res) => {
  try {
    const { name, description } = req.body;

    // update only allowed fields
    if (name) req.org.name = name;
    if (description) req.org.description = description;

    await req.org.save();

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
    // req.org is already loaded by middleware
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

// export const updateMemberPermissions = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { permissions } = req.body;

//     // 1. find member
//     const member = req.org.members.find(
//       (m) => m.user.toString() === userId
//     );

//     if (!member) {
//       return res.status(404).json({
//         message: "Member not found",
//       });
//     }

//     // 2. validate input
//     if (!Array.isArray(permissions)) {
//       return res.status(400).json({
//         message: "Permissions must be an array",
//       });
//     }

//     // 3. update permissions (override system)
//     member.permissions = permissions;

//     await req.org.save();

//     return res.json({
//       message: "Permissions updated successfully",
//       member,
//     });

//   } catch (err) {
//     return res.status(500).json({
//       message: err.message,
//     });
//   }
// };