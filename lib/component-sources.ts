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
