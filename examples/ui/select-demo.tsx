"use client";

import { Globe, Lock, Users } from "lucide-react";
import * as React from "react";

import { Select } from "@/registry/ui/select";

const visibility = [
  { icon: <Lock />, label: "Only me", value: "private" },
  { icon: <Users />, label: "My team", value: "team" },
  { icon: <Globe />, label: "Anyone with the link", value: "public" },
];

const regions = [
  { label: "Frankfurt", value: "fra" },
  { label: "London", value: "lhr" },
  { label: "Mumbai", value: "bom" },
  { label: "Singapore", value: "sin" },
  { disabled: true, label: "São Paulo", value: "gru" },
  { label: "Virginia", value: "iad" },
];

export const SelectDemo = () => {
  const [access, setAccess] = React.useState("team");

  return (
    <div className="bg-card text-card-foreground grid w-full max-w-sm gap-4 rounded-xl border p-4">
      <div className="grid gap-1.5">
        <p id="select-demo-access" className="text-sm font-medium">
          Who can view
        </p>
        <Select
          aria-labelledby="select-demo-access"
          options={visibility}
          value={access}
          onValueChange={setAccess}
          className="w-full"
        />
      </div>
      <div className="grid gap-1.5">
        <p id="select-demo-region" className="text-sm font-medium">
          Region
        </p>
        <Select
          aria-labelledby="select-demo-region"
          options={regions}
          placeholder="Choose a region"
          className="w-full"
        />
      </div>
    </div>
  );
};
