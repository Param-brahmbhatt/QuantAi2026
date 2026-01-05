import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function FAQ() {
  const faqs = [
    {
      q: "What is QuantAI and how does it work?",
      a: "QuantAI rewards users with points for completing surveys. Surveys are matched based on your profile and demographics.",
    },
    {
      q: "How do I earn points?",
      a: "Complete surveys, participate in tasks, and refer friends. Each survey shows the points you'll earn before you start.",
    },
    {
      q: "When do I get my points?",
      a: "Points are usually credited within 24–72 hours after successful completion and validation of a survey.",
    },
    {
      q: "How can I redeem my points?",
      a: "Go to the Rewards section in the app to see available goodies and vouchers. Select an item and follow redemption steps.",
    },
    {
      q: "Are there eligibility requirements?",
      a: "Some surveys have demographic or screening requirements; you must meet those to participate.",
    },
    {
      q: "What if I don't receive points for a completed survey?",
      a: "If points don't appear after the stated processing time, contact support with the survey ID and screenshots.",
    },
  ];

  return (
    <Box sx={{ p: 4, minHeight: "100vh" }}>
      <Typography variant="h5" sx={{ mb: 2, color: "rgb(52,71,103)", fontWeight: 700 }}>
        Frequently Asked Questions
      </Typography>

      {faqs.map((item, idx) => (
        <Accordion key={idx} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ color: "rgb(103,116,142)" }}>{item.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
