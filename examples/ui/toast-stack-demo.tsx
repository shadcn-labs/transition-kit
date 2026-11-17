"use client";

import { Button } from "@/components/ui/button";
import {
  ToastProvider,
  ToastViewport,
  useToast,
} from "@/registry/ui/toast-stack";

const messages = [
  { description: "Production is live at v2.14.0.", title: "Deploy finished" },
  { description: "Invoice #1042 for $240.00.", title: "Payment received" },
  { description: "Priya joined the Acme workspace.", title: "New team member" },
  { description: "“Can we ship this behind a flag?”", title: "Jonas replied" },
];

const Controls = () => {
  const { dismiss, toast, toasts } = useToast();

  return (
    <div className="flex gap-2">
      <Button
        onClick={() =>
          toast(messages[Math.floor(Math.random() * messages.length)])
        }
      >
        Show toast
      </Button>
      <Button
        variant="outline"
        disabled={toasts.length === 0}
        onClick={() => dismiss()}
      >
        Clear all
      </Button>
    </div>
  );
};

export const ToastStackDemo = () => (
  <ToastProvider>
    <div className="flex h-80 w-full max-w-md flex-col items-center gap-4">
      <Controls />
      <ToastViewport className="mt-auto" />
    </div>
  </ToastProvider>
);
