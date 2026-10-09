import { SITE } from "@/constants/site";
import { getLLMText, source } from "@/lib/source";

export const GET = async () => {
  const pages = await Promise.all(source.getPages().map(getLLMText));

  return new Response(
    [`# ${SITE.NAME}\n\n> ${SITE.DESCRIPTION.LONG}`, ...pages].join("\n\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
};
