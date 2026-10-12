"use client";

import { Info, Mail, MessageCircle, Phone, SendHorizontal } from "lucide-react";
import * as React from "react";

import {
  StackNavigator,
  StackScreen,
  useStack,
} from "@/registry/ui/stack-navigator";
import type { StackParams } from "@/registry/ui/stack-navigator";

interface Chat {
  id: string;
  name: string;
  initials: string;
  gradient: string;
  time: string;
  phone: string;
  email: string;
  messages: { from: "me" | "them"; text: string }[];
}

const chats: Chat[] = [
  {
    email: "ava@northwind.dev",
    gradient: "from-rose-400 to-orange-300",
    id: "ava",
    initials: "AC",
    messages: [
      { from: "them", text: "Did the staging deploy go out?" },
      { from: "me", text: "Yes, about ten minutes ago." },
      { from: "them", text: "Perfect, I'll run the smoke tests now." },
    ],
    name: "Ava Chen",
    phone: "+1 415 555 0142",
    time: "9:41",
  },
  {
    email: "marcus@northwind.dev",
    gradient: "from-sky-400 to-indigo-400",
    id: "marcus",
    initials: "MO",
    messages: [
      { from: "me", text: "Lunch on Thursday?" },
      { from: "them", text: "Can't, I'm at the offsite. Friday works." },
      { from: "them", text: "Friday at noon then?" },
    ],
    name: "Marcus Okafor",
    phone: "+1 628 555 0199",
    time: "Yesterday",
  },
  {
    email: "lena@northwind.dev",
    gradient: "from-emerald-400 to-teal-300",
    id: "lena",
    initials: "LV",
    messages: [
      { from: "them", text: "The new onboarding copy is in Figma." },
      { from: "me", text: "Reading it now, looks great so far." },
    ],
    name: "Lena Vogel",
    phone: "+49 30 555 0117",
    time: "Mon",
  },
  {
    email: "priya@northwind.dev",
    gradient: "from-violet-400 to-fuchsia-300",
    id: "priya",
    initials: "PS",
    messages: [
      { from: "them", text: "Invoice for September attached." },
      { from: "me", text: "Thanks, paid it this morning." },
    ],
    name: "Priya Shah",
    phone: "+44 20 5550 0168",
    time: "Sun",
  },
  {
    email: "tom@northwind.dev",
    gradient: "from-amber-400 to-yellow-300",
    id: "tom",
    initials: "TB",
    messages: [{ from: "them", text: "Board game night at mine, 7pm?" }],
    name: "Tom Becker",
    phone: "+1 312 555 0103",
    time: "Sat",
  },
];

interface ChatParams extends StackParams {
  id: string;
}

const chatById = (id: string) =>
  chats.find((chat) => chat.id === id) ?? chats[0];

const Avatar = ({ chat, className }: { chat: Chat; className: string }) => (
  <span
    aria-hidden
    className={`grid shrink-0 place-items-center rounded-full bg-linear-to-br font-semibold text-white ${chat.gradient} ${className}`}
  >
    {chat.initials}
  </span>
);

const Inbox = () => {
  const { push } = useStack();
  return (
    <ul className="divide-y">
      {chats.map((chat) => (
        <li key={chat.id}>
          <button
            type="button"
            onClick={() => push("chat", { id: chat.id })}
            className="hover:bg-muted/50 focus-visible:bg-muted/50 flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors outline-none"
          >
            <Avatar chat={chat} className="size-9 text-xs" />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium">{chat.name}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {chat.time}
                </span>
              </span>
              <span className="text-muted-foreground block truncate">
                {chat.messages.at(-1)?.text}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};

const Conversation = ({ chat }: { chat: Chat }) => {
  // Kept while the contact screen is open: lower screens stay mounted.
  const [draft, setDraft] = React.useState("");
  const [sent, setSent] = React.useState<string[]>([]);

  const send = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (draft.trim()) {
      setSent((messages) => [...messages, draft.trim()]);
      setDraft("");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-y-auto p-3">
        {[...chat.messages, ...sent.map((text) => ({ from: "me", text }))].map(
          (message, index) => (
            <p
              // oxlint-disable-next-line no-array-index-key
              key={index}
              className={
                message.from === "me"
                  ? "bg-primary text-primary-foreground max-w-[80%] self-end rounded-2xl rounded-br-md px-3 py-1.5"
                  : "bg-muted max-w-[80%] self-start rounded-2xl rounded-bl-md px-3 py-1.5"
              }
            >
              {message.text}
            </p>
          )
        )}
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t p-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message"
          aria-label={`Message ${chat.name}`}
          className="bg-muted placeholder:text-muted-foreground focus-visible:ring-ring/50 h-8 min-w-0 flex-1 rounded-full px-3 outline-none focus-visible:ring-[3px]"
        />
        <button
          type="submit"
          aria-label="Send"
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 grid size-8 shrink-0 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-[3px]"
        >
          <SendHorizontal className="size-4" />
        </button>
      </form>
    </div>
  );
};

const ContactButton = ({ chat }: { chat: Chat }) => {
  const { push } = useStack();
  return (
    <button
      type="button"
      aria-label={`${chat.name} contact details`}
      onClick={() => push("contact", { id: chat.id })}
      className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 grid size-8 cursor-pointer place-items-center rounded-md transition-colors outline-none focus-visible:ring-[3px]"
    >
      <Info className="size-4" />
    </button>
  );
};

const Contact = ({ chat }: { chat: Chat }) => {
  const { pop, popToRoot } = useStack();
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <Avatar chat={chat} className="size-14 text-lg" />
      <div className="text-center">
        <p className="text-base font-semibold">{chat.name}</p>
        <p className="text-muted-foreground text-xs">Northwind · Product</p>
      </div>
      <dl className="w-full divide-y rounded-lg border">
        <div className="flex items-center gap-3 px-3 py-2">
          <Phone aria-hidden className="text-muted-foreground size-4" />
          <dt className="sr-only">Phone</dt>
          <dd>{chat.phone}</dd>
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <Mail aria-hidden className="text-muted-foreground size-4" />
          <dt className="sr-only">Email</dt>
          <dd className="truncate">{chat.email}</dd>
        </div>
      </dl>
      <div className="grid w-full grid-cols-2 gap-2">
        <button
          type="button"
          onClick={pop}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium outline-none focus-visible:ring-[3px]"
        >
          <MessageCircle aria-hidden className="size-4" />
          Message
        </button>
        <button
          type="button"
          onClick={popToRoot}
          className="hover:bg-muted focus-visible:ring-ring/50 inline-flex h-8 cursor-pointer items-center justify-center rounded-md border font-medium outline-none focus-visible:ring-[3px]"
        >
          All messages
        </button>
      </div>
    </div>
  );
};

export const StackNavigatorDemo = () => (
  <StackNavigator initialScreen="inbox" className="h-76 max-w-[22rem]">
    <StackScreen name="inbox" title="Messages" render={() => <Inbox />} />
    <StackScreen<ChatParams>
      name="chat"
      title={({ id }) => chatById(id).name}
      actions={({ id }) => <ContactButton chat={chatById(id)} />}
      render={({ id }) => <Conversation chat={chatById(id)} />}
    />
    <StackScreen<ChatParams>
      name="contact"
      title="Contact"
      render={({ id }) => <Contact chat={chatById(id)} />}
    />
  </StackNavigator>
);
