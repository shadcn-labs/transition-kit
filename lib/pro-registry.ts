import { z } from "zod";

const itemSchema = z.object({
  files: z
    .array(
      z.object({
        content: z.string(),
        path: z.string(),
        target: z.string().optional(),
        type: z.string(),
      })
    )
    .min(1),
  name: z.string(),
  type: z.string(),
});

export class ProRegistryError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ProRegistryError";
  }
}

export type ProRegistryItem = z.infer<typeof itemSchema> &
  Record<string, unknown>;

const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/u;

export const getProRegistryItem = async (
  name: string
): Promise<ProRegistryItem> => {
  const token = process.env.TRANSITION_KIT_PRO_GITHUB_TOKEN;
  if (!token) {
    throw new ProRegistryError("Pro source is not configured.", 503);
  }
  if (!NAME.test(name)) {
    throw new ProRegistryError("Component not found.", 404);
  }
  const response = await fetch(
    `https://api.github.com/repos/AbdullahMukadam/transition-kit-pro/contents/r/${name}.json?ref=main`,
    {
      headers: {
        Accept: "application/vnd.github.raw+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "transition-kit",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      redirect: "error",
    }
  );
  if (response.status === 404) {
    throw new ProRegistryError("Component not found.", 404);
  }
  if (!response.ok) {
    throw new ProRegistryError("Pro source is temporarily unavailable.", 502);
  }
  try {
    const item = (await response.json()) as Record<string, unknown>;
    return { ...item, ...itemSchema.parse(item) };
  } catch {
    throw new ProRegistryError("Pro source is temporarily unavailable.", 502);
  }
};
