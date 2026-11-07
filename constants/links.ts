export const GITHUB = {
  branch: "main",
  org: "shadcn-labs",
  repo: "transition-kit",
  user: "AbdullahMukadam",
} as const;

const githubUrl = `https://github.com/${GITHUB.org}/${GITHUB.repo}`;

export const LINK = {
  DISCORD: "https://discord.gg/N6G36KhYK4",
  GITHUB: githubUrl,
  LICENSE: `${githubUrl}/blob/${GITHUB.branch}/LICENSE`,
  PORTFOLIO: `https://github.com/${GITHUB.user}`,
  SHADCN_LABS: "https://shadcn-labs.com",
  SHADCN_MCP_DOCS: "https://ui.shadcn.com/docs/mcp",
  X_SHADCN_LABS: "https://x.com/shadcnlabs",
} as const;

export const MAINTAINERS = [
  { login: "Aniket-508", name: "Aniket Pawar" },
  { login: "AbdullahMukadam", name: "Abdullah Mukadam" },
].map((maintainer) => ({
  ...maintainer,
  avatar: `https://avatars.githubusercontent.com/${maintainer.login}?s=80`,
  sponsor: `https://github.com/sponsors/${maintainer.login}`,
}));
