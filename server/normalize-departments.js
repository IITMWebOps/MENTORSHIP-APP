/**
 * One-off: normalize messy department strings in users collection.
 * Run: node normalize-departments.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

function normalizeDepartment(raw) {
  const original = String(raw || "").trim();
  if (!original) return "";

  const s = original
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    s === "am" ||
    s === "cem" ||
    s.includes("applied mechanics") ||
    s.includes("ambe")
  ) {
    return "Applied Mechanics and Biomedical Engineering";
  }

  if (s.includes("instrumentation") || s.includes("ibme") || s === "i bme") {
    return "Instrumentation and Biomedical Engineering";
  }

  if (
    s === "da" ||
    s === "data science" ||
    s === "data science and ai" ||
    s === "data science and artificial intelligence"
  ) {
    return "Data Science and Artificial Intelligence";
  }

  const aliases = {
    ae: "Aerospace Engineering",
    aerospace: "Aerospace Engineering",
    be: "Biological Engineering",
    bs: "Biological Sciences",
    bt: "Biotechnology",
    biotech: "Biotechnology",
    ch: "Chemical Engineering",
    chemical: "Chemical Engineering",
    ce: "Civil Engineering",
    civil: "Civil Engineering",
    cs: "Computer Science and Engineering",
    cse: "Computer Science and Engineering",
    cy: "Chemistry",
    ee: "Electrical Engineering",
    electrical: "Electrical Engineering",
    ed: "Engineering Design",
    ep: "Engineering Physics",
    hs: "Humanities and Social Sciences",
    me: "Mechanical Engineering",
    mechanical: "Mechanical Engineering",
    mm: "Metallurgical and Materials Engineering",
    md: "Medical Sciences and Technology",
    mst: "Medical Sciences and Technology",
    na: "Naval Architecture and Ocean Engineering",
    ph: "Physics",
    maths: "Mathematics",
    mathematics: "Mathematics",
  };

  if (aliases[s]) return aliases[s];

  return original.replace(/\s+/g, " ").trim();
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.db.collection("users");
  const users = await col.find({}, { projection: { department: 1, rollNo: 1 } }).toArray();

  let updated = 0;
  const changes = {};

  for (const u of users) {
    const before = u.department || "";
    const after = normalizeDepartment(before);
    if (before !== after) {
      await col.updateOne({ _id: u._id }, { $set: { department: after } });
      updated += 1;
      const key = `${before} => ${after}`;
      changes[key] = (changes[key] || 0) + 1;
    }
  }

  const deps = await col
    .aggregate([
      { $group: { _id: "$department", n: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  console.log(JSON.stringify({ updated, changes, departmentsAfter: deps }, null, 2));
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
