import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs";

const plans = [
  {
    description: "For side projects and trying things out.",
    features: ["3 projects", "Community support", "1 GB storage"],
    price: "$0",
    value: "hobby",
  },
  {
    description: "For teams shipping to production every day.",
    features: ["Unlimited projects", "Email support", "100 GB storage"],
    price: "$24",
    value: "pro",
  },
  {
    description: "For organisations with security and scale needs.",
    features: ["SSO and audit logs", "Dedicated support", "Unlimited storage"],
    price: "Custom",
    value: "enterprise",
  },
];

export const TabsDemo = () => (
  <Tabs defaultValue="pro" className="w-full max-w-sm">
    <TabsList className="w-full">
      {plans.map((plan) => (
        <TabsTrigger key={plan.value} value={plan.value} className="capitalize">
          {plan.value}
        </TabsTrigger>
      ))}
    </TabsList>
    {plans.map((plan) => (
      <TabsContent
        key={plan.value}
        value={plan.value}
        className="bg-card text-card-foreground rounded-xl border p-5"
      >
        <p className="text-2xl font-semibold tracking-tight">
          {plan.price}
          {plan.price.startsWith("$") ? (
            <span className="text-muted-foreground text-sm font-normal">
              {" "}
              / month
            </span>
          ) : null}
        </p>
        <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
        <ul className="mt-4 space-y-1.5 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="bg-primary size-1.5 rounded-full" />
              {feature}
            </li>
          ))}
        </ul>
      </TabsContent>
    ))}
  </Tabs>
);
