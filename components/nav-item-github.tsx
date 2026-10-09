import { GitHubStars } from "@/components/github-stars";
import { useSiteData } from "@/components/site-data";

export const NavItemGithub = () => {
  const { stars } = useSiteData();

  return <GitHubStars stargazersCount={stars} />;
};
