import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

const Logo = "/assets/QuantAI.png";

const WelcomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8f9fb",
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 900,            // 🔥 broader box
            bgcolor: "#fff",
            borderRadius: 3,
            px: { xs: 3, sm: 5 },     // less vertical padding
            py: { xs: 2.5, sm: 3 },   // 🔽 reduced height
          }}
        >
          <Stack spacing={{ xs: 2, sm: 2.5 }} alignItems="center">
            {/* Logo */}
            <Box
              component="img"
              src={Logo}
              alt="QuantAI Logo"
              sx={{
                width: { xs: 120, sm: 160 },
              }}
            />

            {/* Content */}
            <Box sx={{ width: "100%" }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  textAlign: "center",
                  mb: 1,
                  fontSize: { xs: "1.5rem", sm: "1.9rem" },
                }}
              >
                Welcome to QuantAI
              </Typography>

              <Typography
                sx={{
                  color: "#4a5568",
                  lineHeight: 1.6,
                  fontSize: "0.95rem",
                }}
              >
                Hello,<br />
                We’re happy to confirm that your email address has been
                successfully verified. You are now officially a member of the
                QuantAI community.  
                To complete your onboarding, please answer a few profiling
                questions so we can match you with relevant surveys and rewards.
              </Typography>
            </Box>

            <Divider />

            {/* Features */}
            <Stack spacing={1.3} sx={{ width: "100%" }}>
              {[
                "Create and customize surveys easily",
                "Analyze responses in real time",
                "Earn rewards for participation",
                "Track projects and progress",
              ].map((item, index) => (
                <Stack key={index} direction="row" spacing={1.5}>
                  <CheckCircle sx={{ color: "#0e994d", fontSize: 20 }} />
                  <Typography sx={{ fontSize: "0.95rem", color: "#4a5568" }}>
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {/* CTA */}
            <Link to="/welcome-details" style={{ textDecoration: "none" }}>
              <Button
                fullWidth={isMobile}
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  px: 5,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 600,
                  border: "1px solid black",
                  background: "#fff",
                  color: "#000",
                  "&:hover": {
                    background: "#f5f5f5",
                  },
                }}
              >
                Get Started
              </Button>
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default WelcomePage;