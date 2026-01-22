import React from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Stack,
  IconButton,
  Paper,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";

export default function ComingSoon() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "radial-gradient(circle at 20% 30%, #f0f4f8 0%, #d9e2ec 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background element */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(25, 118, 210, 0.05)",
        }}
      />

      <Container maxWidth="md">
        <Box textAlign="center" sx={{ position: "relative", zIndex: 1 }}>
          <TimerIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          
          <Typography 
            variant="overline" 
            sx={{ letterSpacing: 3, fontWeight: "bold", color: "text.secondary" }}
          >
            Something New is Coming Soon
          </Typography>

          <Typography
            variant="h2"
            component="h1"
            fontWeight="800"
            gutterBottom
            sx={{
              color: "#102a43",
              fontSize: { xs: "2.5rem", md: "4rem" },
            }}
          >
            We're Building the Future.
          </Typography>

          <Typography
            variant="h6"
            sx={{ color: "text.secondary", mb: 5, maxWidth: "600px", mx: "auto", lineHeight: 1.6 }}
          >
            Our team is working hard to bring you a revolutionary experience. 
            Join our waitlist to get early access when we launch.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}