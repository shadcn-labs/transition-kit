import { SITE } from "@/constants/site";

export const PRO_API_KEY_ENV = "TRANSITION_KIT_API_KEY";

export const proInstallCommand = (name: string) =>
  `npx shadcn@latest add @transition-kit/${name}`;

export const proRegistryConfig = () =>
  JSON.stringify(
    {
      registries: {
        "@transition-kit": {
          headers: { Authorization: `Bearer \${${PRO_API_KEY_ENV}}` },
          url: `${SITE.REGISTRY}/{name}.json`,
        },
      },
    },
    null,
    2
  );
