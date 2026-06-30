import mongoose, { Schema } from "mongoose";

const Organisation = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    members: [
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        role: {
            type: String,
            enum: ["owner", "admin", "member"],
            default: "member"
        },

        permissions: [
            {
                type: String
            }
        ]
    }
  ]
  },
  { timestamps: true }
);

export default mongoose.model("Organisation", Organisation
);