/**
 * The page surface. Docs navigations started with
 * `viewTransition={{ types: ["nav-forward" | "nav-back"] }}` name it `page`
 * (styles/globals.css) so it slides like pdfcn; other navigations swap instantly.
 */
export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <div data-slot="page" className="flex min-w-0 flex-1 flex-col">
    {children}
  </div>
);
