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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8f9fb",
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: { xs: 'auto', md: '100vh' },
          py: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: { xs: 2, sm: 3 },
            width: "100%",
            maxWidth: 700,
            maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 48px)', md: '85vh' },
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              width: '4px', // Decreased from 8px to 4px
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '10px',
              '&:hover': {
                background: '#555',
              },
            },
          }}
        >
          <Stack spacing={{ xs: 2.5, sm: 3, md: 4 }} alignItems="center">
            {/* Logo */}
            <Box
              component="img"
              src={Logo}
              alt="QuantAI Logo"
              sx={{
                width: { xs: 120, sm: 160, md: 200 },
                height: "auto",
                maxWidth: '100%',
              }}
            />

            {/* Success Icon */}
            <Box
              sx={{
                width: { xs: 60, sm: 70, md: 80 },
                height: { xs: 60, sm: 70, md: 80 },
                borderRadius: "50%",
                background: "#4CAF50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle
                sx={{
                  fontSize: { xs: 35, sm: 42, md: 48 },
                  color: "#fff"
                }}
              />
            </Box>

            {/* Title & Subtitle */}
            <Box
              textAlign="center"
              sx={{
                width: '100%',
                px: { xs: 0, sm: 1 }
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#1a202c",
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' }
                }}
              >
                Welcome to QuantAI
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#4a5568",
                  lineHeight: 1.7,
                  fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                  textAlign: 'left'
                }}
              >
                Hello,
                We're happy to confirm that your email address has been successfully verified. You are now
                officially a member of the QuantAI community.
                To complete your onboarding, please click the button below and answer a few profiling
                questions. This helps us match you with surveys that fit your background and interests,
                allowing you to earn rewards that can be redeemed for cash or exclusive goodies from the
                QuantAI team.
              </Typography>
            </Box>

            <Divider
              sx={{
                width: '100%',
                my: { xs: 1, sm: 1.5 }
              }}
            />

            {/* Key Features */}
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#2d3748",
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                }}
              >
                Key Features:
              </Typography>

              <Stack spacing={{ xs: 1.5, sm: 2 }}>
                {[
                  "Create and Customize surveys with our intuitive form builder",
                  "Collect responses and analyze data in real-time",
                  "Earn reward points for completing surveys",
                  "Manage your projects and track your progress",
                ].map((feature, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={{ xs: 1.5, sm: 2 }}
                    alignItems="flex-start"
                  >
                    <CheckCircle
                      sx={{
                        color: "#0e994dff",
                        fontSize: { xs: 20, sm: 22, md: 24 },
                        mt: 0.3,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#4a5568",
                        lineHeight: 1.6,
                        fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' }
                      }}
                    >
                      {feature}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* CTA Button */}
            <Link
              to='/welcome-details'
              style={{
                textDecoration: 'none',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              <Button
                fullWidth={isMobile}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: { xs: 14, sm: 15, md: 16 },
                  fontWeight: 600,
                  background: "#fffbfbff",
                  color: "#000",
                  border: "1px solid black",
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { sm: 200 },
                  py: { xs: 1.5, sm: 1.2 },
                  px: { xs: 3, sm: 4 },
                  mt: { xs: 1, sm: 0 },
                  '&:hover': {
                    background: "#f5f5f5",
                    borderColor: "#000",
                  }
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