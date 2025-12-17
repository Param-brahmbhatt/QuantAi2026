import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import { CheckCircle, ArrowForward } from "@mui/icons-material";
import Logo from "/assets/QuantAI.png";

const WelcomePage = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   const hasSeenWelcome = localStorage.getItem("hasSeenWelcomePage");
  //   if (hasSeenWelcome === "true") {
  //     navigate("/");
  //   }
  // }, [navigate]);

  // const handleGetStarted = () => {
  //   localStorage.setItem("hasSeenWelcomePage", "true");
  //   navigate("/");
  // };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8f9fb",
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box
          elevation={10}
          sx={{
            p: 6,
            borderRadius: 4,
            width: "100%",
            maxWidth: 900,
            mx: "auto",
            // backgroundColor: "#fff"
          }}
        >
          <Stack spacing={5} alignItems="center">
            <Box
              component="img"
              src={Logo}
              alt="QuantAI Logo"
              sx={{ width: 240, height: "auto" }}
            />

            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "#4CAF50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <CheckCircle sx={{ fontSize: 55, color: "#fff" }} />
            </Box>

            {/* Title & Subtitle */}
            <Box textAlign="center" sx={{ maxWidth: 650 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a202c", mb: 1 }}>
                Welcome to QuantAI
              </Typography>
              <Typography variant="body1" sx={{ color: "#4a5568", lineHeight: 1.8 }}>
                Hello,
                We’re happy to confirm that your email address has been successfully verified. You are now
                officially a member of the QuantAI community.
                To complete your onboarding, please click the button below and answer a few profiling
                questions. This helps us match you with surveys that fit your background and interests,
                allowing you to earn rewards that can be redeemed for cash or exclusive goodies from the
                QuantAI team.
              </Typography>
            </Box>

            <Divider sx={{ width: "100%", my: 2 }} />

            {/* Key Features */}
            <Box sx={{ width: "100%", maxWidth: 700 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#2d3748", mb: 2 }}
              >
                Key Features:
              </Typography>

              <Stack spacing={2}>
                {[
                  "Create and Customize surveys with our intuitive form builder",
                  "Collect responses and analyze data in real-time",
                  "Earn reward points for completing surveys",
                  "Manage your projects and track your progress",
                ].map((feature, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                  >
                    <CheckCircle
                      sx={{
                        color: "#5a67d8",
                        fontSize: 24,
                        mt: 0.4,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body1" sx={{ color: "#4a5568", lineHeight: 1.7 }}>
                      {feature}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* CTA */}
            <Link to='/welcome-details'><Button
              // onClick={handleGetStarted}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontSize: 13,
                background: "#fffbfbff",
                color: "#000",
                border: "1px solid black",
                width: 200
              }}
            >
              Get Started
            </Button></Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );

};

export default WelcomePage;