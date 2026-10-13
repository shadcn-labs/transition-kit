export interface ComponentSourceRequest {
  name?: string;
  src?: string;
  title?: string;
  language?: string;
}

export interface ComponentSourceData {
  code: string;
  highlightedCode: string;
  language: string;
}

export type ComponentSources = Record<string, ComponentSourceData | null>;

/**
 * Join build-time-highlighted sources into one block: raw code separated by a
 * blank line, highlighted `<code>` children spliced into the first `<pre>`.
 * Falls back to stacking full blocks when the shape is unexpected.
 */
export const mergeComponentSources = (
  parts: ComponentSourceData[]
): ComponentSourceData => {
  const [first, ...rest] = parts;
  if (rest.length === 0) {
    return first;
  }
  const code = `${parts.map((part) => part.code.replace(/\n+$/, "")).join("\n\n")}\n`;
  const open = /^<pre[^>]*><code[^>]*>/;
  const close = /<\/code><\/pre>\s*$/;
  const trailingBlankLine = /<span class="line"[^>]*><\/span>\s*$/;
  if (
    !open.test(first.highlightedCode) ||
    parts.some((part) => !close.test(part.highlightedCode))
  ) {
    return {
      code,
      highlightedCode: parts.map((part) => part.highlightedCode).join("\n"),
      language: first.language,
    };
  }
  const inner = (html: string) =>
    html.replace(open, "").replace(close, "").replace(trailingBlankLine, "");
  const highlightedCode = `${
    first.highlightedCode.replace(close, "").replace(trailingBlankLine, "") +
    rest
      .map(
        (part) =>
          `\n<span class="line" data-line=""></span>\n${inner(part.highlightedCode)}`
      )
      .join("")
  }</code></pre>`;
  return { code, highlightedCode, language: first.language };
};

/** Shows registry sources as installed: `@/registry/<group>/x` → `@/components/transitions/x`. */
export const toInstalledImports = (code: string) =>
  code.replaceAll(
    /@\/registry\/(?:theme|page|ui)\//g,
    "@/components/transitions/"
  );

export const componentSourceKey = ({
  name,
  src,
  title,
  language,
}: ComponentSourceRequest) => JSON.stringify([name, src, title, language]);
