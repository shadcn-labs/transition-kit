import { HomeCtas } from "@/components/home-ctas";
import { HeroBadge } from "@/components/landing/hero-badge";
import { Accent } from "@/components/landing/section-heading";
export const Hero = () => (
  <section className="rail flex items-center justify-center px-4 py-20">
    <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
      <div className="rise">
        <HeroBadge />
      </div>

      <h1 className="rise text-3xl font-normal tracking-tight [--i:1] sm:text-5xl md:text-6xl">
        <Accent>Smooth</Accent> Transitions for Every <Accent>React</Accent>{" "}
        Change.
      </h1>

      <p className="rise text-muted-foreground max-w-2xl text-base leading-relaxed [--i:2] sm:text-lg">
        Theme, page and UI transitions built on{" "}
        <code className="font-mono text-[0.9em]">&lt;ViewTransition&gt;</code>.
        One shadcn command each, no animation library.
      </p>

      <HomeCtas className="rise mt-2 w-full max-w-xs flex-col gap-2 [--i:3] *:w-full sm:max-w-none sm:flex-row sm:gap-4 sm:*:w-auto" />
    </div>
  </section>
);
