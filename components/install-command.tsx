import { CodeBlockCommand } from "@/components/code-block-command";

/** `shadcn add` for one registry item, in every package manager. */
export const InstallCommand = ({ name }: { name: string }) => (
  <CodeBlockCommand
    __bun__={`bunx --bun shadcn@latest add @transition-kit/${name}`}
    __npm__={`npx shadcn@latest add @transition-kit/${name}`}
    __pnpm__={`pnpm dlx shadcn@latest add @transition-kit/${name}`}
    __yarn__={`yarn shadcn@latest add @transition-kit/${name}`}
  />
);
