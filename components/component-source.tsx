import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import { CodeCollapsibleWrapper } from "@/components/code-collapsible-wrapper";
import { CopyButton } from "@/components/copy-button";
import { getIconForLanguageExtension } from "@/components/icons";
import type { ComponentSources } from "@/lib/component-sources";
import { componentSourceKey } from "@/lib/component-sources";
import { cn } from "@/lib/utils";

const ComponentSourcesContext = createContext<ComponentSources>({});

export const ComponentSourceProvider = ({
  sources,
  children,
}: {
  sources: ComponentSources;
  children: ReactNode;
}) => (
  <ComponentSourcesContext.Provider value={sources}>
    {children}
  </ComponentSourcesContext.Provider>
);

const ComponentCode = ({
  code,
  highlightedCode,
  language,
  title,
}: {
  code: string;
  highlightedCode: string;
  language: string;
  title: string | undefined;
}) => (
  <figure data-rehype-pretty-code-figure="" className="[&>pre]:max-h-96">
    {title ? (
      <figcaption
        className="text-code-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:opacity-70"
        data-language={language}
        data-rehype-pretty-code-title=""
      >
        {getIconForLanguageExtension(language)}
        {title}
      </figcaption>
    ) : null}
    <CopyButton value={code} />
    <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
  </figure>
);

export const ComponentSource = ({
  name,
  src,
  title,
  collapsible = true,
  className,
  language,
}: {
  name?: string;
  src?: string;
  title?: string;
  collapsible?: boolean;
  className?: string;
  language?: string;
}) => {
  const sources = useContext(ComponentSourcesContext);
  const source = sources[componentSourceKey({ language, name, src, title })];
  if (!source) {
    return null;
  }
  const { code, highlightedCode, language: lang } = source;

  if (!collapsible) {
    return (
      <div className={cn("relative", className)}>
        <ComponentCode
          code={code}
          highlightedCode={highlightedCode}
          language={lang}
          title={title}
        />
      </div>
    );
  }

  return (
    <CodeCollapsibleWrapper
      className={className}
      navTriggerClassName={cn(!title && "top-3")}
    >
      <ComponentCode
        code={code}
        highlightedCode={highlightedCode}
        language={lang}
        title={title}
      />
    </CodeCollapsibleWrapper>
  );
};
