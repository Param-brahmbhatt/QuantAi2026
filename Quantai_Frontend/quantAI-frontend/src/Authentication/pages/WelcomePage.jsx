import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { CheckCircle, ArrowForward } from "@mui/icons-material";
import Logo from "/assets/QuantAI.png";

const WelcomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already seen the welcome page
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcomePage");
    
    if (hasSeenWelcome === "true") {
      // If already seen, redirect to dashboard
      navigate("/");
    }
  }, [navigate]);

  const handleGetStarted = () => {
    // Mark that user has seen the welcome page
    localStorage.setItem("hasSeenWelcomePage", "true");
    // Redirect to dashboard
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 6,
            borderRadius: 4,
            textAlign: "center",
            background: "#fff",
          }}
        >
          <Stack spacing={4} alignItems="center">
            {/* Logo */}
            <Box
              component="img"
              src={Logo}
              alt="QuantAI Logo"
              sx={{
                width: 120,
                height: "auto",
                mb: 2,
              }}
            />

            {/* Success Icon */}
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
              }}
            >
              <CheckCircle sx={{ fontSize: 60, color: "#fff" }} />
            </Box>

            {/* Welcome Message */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "#1a202c",
                  mb: 2,
                }}
              >
                Welcome to QuantAI!
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#718096",
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Your account has been successfully created. You're all set to
                start creating amazing surveys and collecting valuable insights!
              </Typography>
            </Box>

            {/* Features List */}
            <Box sx={{ width: "100%", textAlign: "left" }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#2d3748", mb: 2 }}
              >
                What you can do:
              </Typography>
              <Stack spacing={2}>
                {[
                  "Create and customize surveys with our intuitive form builder",
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
                        color: "#667eea",
                        fontSize: 24,
                        mt: 0.5,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{ color: "#4a5568", lineHeight: 1.6 }}
                    >
                      {feature}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* Get Started Button */}
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={handleGetStarted}
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontSize: 16,
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)",
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default WelcomePage;

