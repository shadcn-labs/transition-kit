import { DocsSidebar } from "@/components/docs-sidebar";
import { useSiteData } from "@/components/site-data";
import { SidebarProvider } from "@/components/ui/sidebar";
export const DocsLayout = ({ children }: { children: React.ReactNode }) => {
  const { tree } = useSiteData();
  return (
    <div className="rail-wide flex flex-1 flex-col">
      <SidebarProvider className="min-h-min flex-1 items-stretch [--sidebar-width:240px] [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]">
        <div className="hidden border-r lg:block">
          <DocsSidebar tree={tree} />
        </div>
        <div className="h-full w-full min-w-0">{children}</div>
      </SidebarProvider>
    </div>
  );
};
