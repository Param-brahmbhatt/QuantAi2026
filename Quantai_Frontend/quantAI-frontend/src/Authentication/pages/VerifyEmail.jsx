import React, { useEffect } from "react";
import {
    Box,
    Container,
    Paper,
    Typography,
    Avatar,
    CircularProgress,
    Button,
} from "@mui/material";
import { Email, CheckCircle } from "@mui/icons-material";
import { Link } from "react-router-dom";

const EmailVerificationPage = () => {

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "grey.50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={6}
                    sx={{
                        p: 6,
                        borderRadius: 3,
                        textAlign: "center",
                    }}
                >
                    {/* Logo */}
                    <Box
                        sx={{
                            width: 350,
                            height: 95,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 6.5,
                            marginRight: '18%'
                        }}
                    >
                        <img src="/assets/QuantAI.png" alt="Logo" style={{ width: "100%", height: "100%" }} />
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        gutterBottom
                        sx={{ color: "#344767" }}
                    >
                        "Attention is the new currency"
                    </Typography>

                    {/* Description */}
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ maxWidth: 420, mx: "auto", mb: 4 }}
                    >
                        The more effortless the writing looks, the more effort the writer
                        actually put into the process.
                    </Typography>

                    {/* Success State */}

                    <Box sx={{ textAlign: "center", my: 3 }}>
                        <CheckCircle color="success" sx={{ fontSize: 40, mb: 2 }} />
                        <Typography color="success.main" mb={2}>
                            Your email has been verified successfully!
                        </Typography>
                        <Button
                            variant="contained"
                            component={Link}
                            // to={getIndexPage()}
                            sx={{
                                mt: 1.5,
                                mb: 1.5,
                                py: 1,
                                background:
                                    "linear-gradient(to right, #2196f3, #21cbf3)",
                                boxShadow:
                                    "0 4px 10px rgba(33, 150, 243, 0.4)",
                                "&:hover": {
                                    background:
                                        "linear-gradient(to right, #1976d2, #00b0ff)",
                                    boxShadow:
                                        "0 6px 15px rgba(33, 150, 243, 0.5)",
                                },
                                borderRadius: "10px",
                            }}
                        >
                            Go to Dashboard
                        </Button>
                    </Box>

                </Paper>
            </Container>
        </Box>
    );
};

export default EmailVerificationPage;
