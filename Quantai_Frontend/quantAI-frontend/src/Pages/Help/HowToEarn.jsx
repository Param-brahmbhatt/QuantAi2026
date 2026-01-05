import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Paper } from "@mui/material";

export default function HowToEarn() {
  const tips = [
    {
      title: "Complete Surveys",
      desc: "Open available surveys and complete them carefully. Each survey shows estimated points and time required.",
    },
    {
      title: "Keep Your Profile Updated",
      desc: "A complete profile helps match you to more surveys and increases qualification chances.",
    },
    {
      title: "Check Often",
      desc: "New surveys appear regularly — checking the app often gives you first access.",
    },
    {
      title: "Invite Friends",
      desc: "Refer friends to earn bonus points when they sign up and complete qualifying surveys.",
    },
    {
      title: "Quality Responses",
      desc: "Provide honest, consistent answers. Low-quality or random responses may be disqualified.",
    },
  ];

  return (
    <Box sx={{ p: 4, minHeight: "100vh" }}>
      <Typography variant="h5" sx={{ mb: 2, color: "rgb(52,71,103)", fontWeight: 700 }}>
        How to Earn Points
      </Typography>

      <Paper elevation={0} sx={{ p: 2, maxWidth: 900 }}>
        <Typography sx={{ mb: 1, color: "rgb(103,116,142)" }}>
          Follow these best practices to maximise your earnings on QuantAI.
        </Typography>

        <List>
          {tips.map((t, i) => (
            <ListItem key={i} sx={{ alignItems: "flex-start" }}>
              <ListItemText
                primary={<Typography sx={{ fontWeight: 600 }}>{t.title}</Typography>}
                secondary={<Typography sx={{ color: "rgb(103,116,142)" }}>{t.desc}</Typography>}
              />
            </ListItem>
          ))}
        </List>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
          Redeeming Points
        </Typography>
        <Typography sx={{ color: "rgb(103,116,142)", mb: 1 }}>
          Visit the Rewards page to view items you can redeem. Note the minimum redemption threshold and processing times.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
          Support
        </Typography>
        <Typography sx={{ color: "rgb(103,116,142)" }}>
          If you have questions about a survey or missing points, contact support via the Help section with relevant details.
        </Typography>
      </Paper>
    </Box>
  );
}
