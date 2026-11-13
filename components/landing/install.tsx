import { AgentPrompt } from "@/components/agent-prompt";
import { CommandBox } from "@/components/command-box";
import { HomeThemeTry } from "@/components/home-theme-try";
import { SectionHeading } from "@/components/landing/section-heading";
export const Install = () => (
  <section className="rail">
    <SectionHeading
      title="One command, then it's yours."
      description="The shadcn CLI copies the code into your project. Then try it: each style below flips this whole site's theme."
    />
    <div className="flex flex-col items-center gap-6 px-4 py-12 md:py-16">
      <CommandBox className="ring-border w-full max-w-xl text-left ring-1" />
      <AgentPrompt />
      <HomeThemeTry />
    </div>
  </section>
);
