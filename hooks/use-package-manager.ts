import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

/** Command prefix that runs a package binary without installing it. */
export const PACKAGE_RUNNERS: Record<PackageManager, string> = {
  bun: "bunx --bun",
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn",
};

export type CommandTab = PackageManager | "shadcn" | "prompt";

const packageManagerAtom = atomWithStorage<{
  packageManager: PackageManager;
  commandTab: CommandTab;
}>("command-preferences", {
  commandTab: "pnpm",
  packageManager: "pnpm",
});

export const usePackageManager = () => useAtom(packageManagerAtom);
