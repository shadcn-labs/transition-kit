import { markdownResponse } from "@/lib/api";
import { getLLMText, source } from "@/lib/source";

export const docsMarkdown = async (
  slug: string | undefined,
  includeBody: boolean
) => {
  const segments = slug?.split("/");
  const page = source.getPage(segments?.slice(0, -1));
  if (!page) {
    return new Response(includeBody ? "Not Found" : null, { status: 404 });
  }

  return markdownResponse(await getLLMText(page), includeBody);
};
