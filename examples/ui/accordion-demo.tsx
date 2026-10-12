import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/ui/accordion";

const faqs = [
  {
    answer:
      "Yes. Cancel from Billing at any time and you keep access until the end of the period you already paid for. Nothing is deleted for 30 days.",
    question: "Can I cancel my plan whenever I want?",
    value: "cancel",
  },
  {
    answer:
      "We take all major cards, Apple Pay and Google Pay. Annual plans can also be paid by bank transfer against an invoice.",
    question: "Which payment methods do you accept?",
    value: "payment",
  },
  {
    answer:
      "Invite as many teammates as you like. Viewers are free; you only pay for members who can edit.",
    question: "How many people can join my workspace?",
    value: "seats",
  },
  {
    answer:
      "Export every project as JSON or CSV from Settings, then Export. The download includes comments and version history.",
    question: "How do I get my data out?",
    value: "export",
  },
];

export const AccordionDemo = () => (
  // Fixed height with the list at the top, so opening an answer never
  // re-centres the preview or pushes anything outside the accordion.
  <div className="h-80 w-full max-w-md">
    <Accordion type="single" collapsible defaultValue="cancel">
      {faqs.map((faq) => (
        <AccordionItem key={faq.value} value={faq.value}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);
