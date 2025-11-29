// scripts/migratePropertyStatus.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Property from "../models/Property.js";

dotenv.config();

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in environment. Set it in .env or export it before running.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // 1) Set missing status -> active (assume existing visible properties should stay live)
    const r1 = await Property.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active", publishedAt: new Date() } }
    );

    // 2) Ensure pending items have submittedAt
    const r2 = await Property.updateMany(
      { status: "pending", submittedAt: { $exists: false } },
      { $set: { submittedAt: new Date() } }
    );

    console.log("Migration results:");
    console.log(" - Properties updated to add missing status:", r1.modifiedCount ?? r1.nModified ?? r1.matchedCount);
    console.log(" - Pending properties updated with submittedAt:", r2.modifiedCount ?? r2.nModified ?? r2.matchedCount);
    console.log("Done.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
