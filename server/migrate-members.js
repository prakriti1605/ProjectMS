// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// import OrganisationMember from "./models/organisationMember.model.js";

// // Ensure .env is loaded properly regardless of execution directory
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.join(__dirname, ".env") });

// const migrateData = async () => {
//   try {
//     const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

//     if (!MONGODB_URI) {
//       throw new Error("MongoDB URI is not defined in environment variables.");
//     }

//     await mongoose.connect(MONGODB_URI);
//     console.log("Connected to MongoDB...");

//     // Get raw access to organisations collection before schema change
//     const db = mongoose.connection.db;
//     const oldOrgs = await db.collection("organisations").find({}).toArray();

//     console.log(`Found ${oldOrgs.length} organisations to migrate...`);

//     let migratedCount = 0;

//     for (const org of oldOrgs) {
//       if (org.members && Array.isArray(org.members)) {
//         for (const m of org.members) {
//           if (!m.user) continue;

//           // Upsert into OrganisationMember collection
//           await OrganisationMember.updateOne(
//             { organisation: org._id, user: m.user },
//             {
//               $setOnInsert: {
//                 organisation: org._id,
//                 user: m.user,
//                 role: m.role || "member",
//                 permissions: m.permissions || [],
//               },
//             },
//             { upsert: true }
//           );
//           migratedCount++;
//         }

//         // Unset old embedded members array from Organisation
//         await db.collection("organisations").updateOne(
//           { _id: org._id },
//           { $unset: { members: "" } }
//         );
//       }
//     }

//     console.log(`Successfully migrated ${migratedCount} membership records!`);
//     process.exit(0);
//   } catch (error) {
//     console.error("Migration failed:", error);
//     process.exit(1);
//   }
// };

// migrateData();