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
    art: "linear-gradient(135deg, #939393, #727272)",
    id: "brand",
    tags: ["Design"],
    title: "Brand refresh",
  },
  {
    art: "linear-gradient(135deg, #afafaf, #7b7b7b)",
    id: "api",
    tags: ["Engineering"],
    title: "Public API v2",
  },
  {
    art: "linear-gradient(135deg, #c1c1c1, #898989)",
    id: "pricing",
    tags: ["Product"],
    title: "Pricing page",
  },
  {
    art: "linear-gradient(135deg, #adadad, #767676)",
    id: "icons",
    tags: ["Design"],
    title: "Icon set",
  },
  {
    art: "linear-gradient(135deg, #919191, #414141)",
    id: "sync",
    tags: ["Engineering"],
    title: "Offline sync",
  },
  {
    art: "linear-gradient(135deg, #909090, #4a4a4a)",
    id: "onboarding",
    tags: ["Product", "Design"],
    title: "Onboarding flow",
  },
  {
    art: "linear-gradient(135deg, #cbcbcb, #7f7f7f)",
    id: "tokens",
    tags: ["Design", "Engineering"],
    title: "Design tokens",
  },
  {
    art: "linear-gradient(135deg, #a5a5a5, #6f6f6f)",
    id: "search",
    tags: ["Engineering"],
    title: "Search index",
  },
  {
    art: "linear-gradient(135deg, #c9c9c9, #b0b0b0)",
    id: "roadmap",
    tags: ["Product"],
    title: "Q3 roadmap",
  },
  {
    art: "linear-gradient(135deg, #999999, #717171)",
    id: "motion",
    tags: ["Design"],
    title: "Motion guide",
  },
  {
    art: "linear-gradient(135deg, #afafaf, #6d6d6d)",
    id: "ci",
    tags: ["Engineering"],
    title: "Faster CI",
  },
  {
    art: "linear-gradient(135deg, #c3c3c3, #535353)",
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
