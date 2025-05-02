// utils/slugify.ts

export const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove non-word characters
      .replace(/\s+/g, "-"); // replace spaces with hyphens
  