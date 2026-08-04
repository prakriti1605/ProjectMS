import mongoose from "mongoose";

const organisationMemberSchema = new mongoose.Schema(
  {
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    permissions: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Compound Index: Ensures a user can only be added to an organization ONCE
// and enables ultra-fast O(1) permission lookups.
organisationMemberSchema.index({ organisation: 1, user: 1 }, { unique: true });

export default mongoose.model("OrganisationMember", organisationMemberSchema);