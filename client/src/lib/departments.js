/**
 * Collapse inconsistent department spellings from CSV / manual entry
 * into one canonical label for filters and display.
 */
export function normalizeDepartment(raw) {
  const original = String(raw || "").trim();
  if (!original) return "";

  const s = original
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Applied Mechanics / AMBE / CEM family
  if (
    s === "am" ||
    s === "cem" ||
    s.includes("applied mechanics") ||
    s.includes("ambe")
  ) {
    return "Applied Mechanics and Biomedical Engineering";
  }

  // Instrumentation & Biomedical (iBME) family
  if (
    s.includes("instrumentation") ||
    s.includes("ibme") ||
    s === "i bme"
  ) {
    return "Instrumentation and Biomedical Engineering";
  }

  // Known short codes / aliases used elsewhere in the app
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

  // Preserve known proper names; only collapse whitespace for unknown labels
  return original.replace(/\s+/g, " ").trim();
}
