const rawDocs = import.meta.glob<string>("/content/docs/**/*.mdx", {
  eager: true,
  import: "default",
  query: "?raw",
});

export const getRawDoc = (path: string): string => {
  const content = rawDocs[`/content/docs/${path}`];
  if (content === undefined) {
    throw new Error(`Missing documentation source: ${path}`);
  }
  return content;
};
