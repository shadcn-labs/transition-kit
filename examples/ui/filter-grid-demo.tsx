import {
  FILTER_ALL,
  FilterGrid,
  FilterGridFilter,
  FilterGridFilters,
  FilterGridItems,
  FilterGridSearch,
} from "@/registry/ui/filter-grid";

interface Project {
  id: string;
  title: string;
  tags: string[];
  art: string;
}

const projects: Project[] = [
  {
    art: "linear-gradient(135deg, #f472b6, #a855f7)",
    id: "brand",
    tags: ["Design"],
    title: "Brand refresh",
  },
  {
    art: "linear-gradient(135deg, #22d3ee, #3b82f6)",
    id: "api",
    tags: ["Engineering"],
    title: "Public API v2",
  },
  {
    art: "linear-gradient(135deg, #fbbf24, #f97316)",
    id: "pricing",
    tags: ["Product"],
    title: "Pricing page",
  },
  {
    art: "linear-gradient(135deg, #34d399, #0d9488)",
    id: "icons",
    tags: ["Design"],
    title: "Icon set",
  },
  {
    art: "linear-gradient(135deg, #818cf8, #1e40af)",
    id: "sync",
    tags: ["Engineering"],
    title: "Offline sync",
  },
  {
    art: "linear-gradient(135deg, #fb7185, #e11d48)",
    id: "onboarding",
    tags: ["Product", "Design"],
    title: "Onboarding flow",
  },
  {
    art: "linear-gradient(135deg, #a3e635, #16a34a)",
    id: "tokens",
    tags: ["Design", "Engineering"],
    title: "Design tokens",
  },
  {
    art: "linear-gradient(135deg, #38bdf8, #6366f1)",
    id: "search",
    tags: ["Engineering"],
    title: "Search index",
  },
  {
    art: "linear-gradient(135deg, #facc15, #84cc16)",
    id: "roadmap",
    tags: ["Product"],
    title: "Q3 roadmap",
  },
  {
    art: "linear-gradient(135deg, #c084fc, #ec4899)",
    id: "motion",
    tags: ["Design"],
    title: "Motion guide",
  },
  {
    art: "linear-gradient(135deg, #2dd4bf, #0284c7)",
    id: "ci",
    tags: ["Engineering"],
    title: "Faster CI",
  },
  {
    art: "linear-gradient(135deg, #fdba74, #db2777)",
    id: "interviews",
    tags: ["Product"],
    title: "User interviews",
  },
];

const tags = ["Design", "Engineering", "Product"];

export const FilterGridDemo = () => (
  <FilterGrid items={projects} className="max-w-xl">
    <div className="flex flex-col gap-2 @lg:flex-row @lg:items-center @lg:justify-between">
      <FilterGridFilters aria-label="Team">
        <FilterGridFilter value={FILTER_ALL}>All</FilterGridFilter>
        {tags.map((tag) => (
          <FilterGridFilter key={tag} value={tag}>
            {tag}
          </FilterGridFilter>
        ))}
      </FilterGridFilters>
      <FilterGridSearch placeholder="Search projects…" />
    </div>
    <FilterGridItems<Project>
      className="gap-2"
      empty="No projects match. Try another team or search."
    >
      {(project) => (
        <article
          className="relative flex h-20 flex-col justify-end overflow-hidden rounded-lg p-2.5 text-white"
          style={{ background: project.art }}
        >
          <svg
            aria-hidden
            viewBox="0 0 100 60"
            className="absolute inset-0 size-full opacity-40"
            preserveAspectRatio="xMidYMid slice"
          >
            <circle cx="82" cy="10" r="22" fill="white" fillOpacity="0.35" />
            <circle cx="70" cy="48" r="10" fill="white" fillOpacity="0.25" />
          </svg>
          <h3 className="relative truncate text-sm leading-tight font-semibold">
            {project.title}
          </h3>
          <p className="relative truncate text-[11px] text-white/80">
            {project.tags.join(" · ")}
          </p>
        </article>
      )}
    </FilterGridItems>
  </FilterGrid>
);
