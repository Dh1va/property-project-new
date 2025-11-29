// src/utils/slug.js
export const slugify = (str) =>
  String(str)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")      // remove non-word chars
    .replace(/\s+/g, "-")          // spaces => dashes
    .replace(/-+/g, "-");          // collapse multiple dashes
