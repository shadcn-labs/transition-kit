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

export const componentSourceKey = ({
  name,
  src,
  title,
  language,
}: ComponentSourceRequest) => JSON.stringify([name, src, title, language]);
