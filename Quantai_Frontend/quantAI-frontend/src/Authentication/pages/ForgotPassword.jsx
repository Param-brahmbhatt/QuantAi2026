import React, { useState } from "react";
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Avatar,
    LinearProgress,
    Link,
    Alert,
    useTheme,
} from "@mui/material";
import { LockReset, Email, CheckCircle } from "@mui/icons-material";

const PasswordResetPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const theme = useTheme();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setCountdown(30);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setLoading(false);
                    setSubmitted(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSignIn = () => {
        console.log("Navigate to sign in");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                // bgcolor: theme.palette.grey[50],
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
                        p: 5,
                        borderRadius: 3,
                        textAlign: "center",
                    }}
                >
                    <Box sx={{ maxWidth: 500, mx: "auto" }}>
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
                                marginRight:'18%'
                            }}
                        >
                            <img src="/assets/QuantAI.png" alt="Logo" style={{ width: "100%", height: "100%" }} />
                        </Box>

                        {/* Title */}
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            gutterBottom
                            sx={{ color: "#344767", marginRight: "50%" }}
                        >
                            Forgot Password
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={3}
                            sx={{ marginRight: "24%", fontSize: '14px' }}
                        >
                            {countdown > 0
                                ? `Check your email. Sending instructions... (${countdown}s)`
                                : submitted
                                    ? "Password reset instructions have been sent to your email."
                                    : "You will receive an e-mail in maximum 60 seconds"}
                        </Typography>

                        {/* Progress Bar */}
                        {countdown > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={((30 - countdown) / 30) * 100}
                                    sx={{ height: 6, borderRadius: 3 }}
                                />
                            </Box>
                        )}

                        {/* Success Alert */}
                        {submitted && (
                            <Alert
                                icon={<CheckCircle />}
                                severity="success"
                                sx={{ mb: 3, borderRadius: 2 }}
                            >
                                Email sent successfully!
                            </Alert>
                        )}

                        {/* Form */}
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading || submitted}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#F5F2F2',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#F5F2F2',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#d6d2d2ff',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#000',
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <Email fontSize="small" sx={{ mr: 1 }} />
                                    ),
                                }}
                                placeholder="Enter your email"
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
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
                                    borderRadius: "15px",
                                }}
                            >
                                Submit
                            </Button>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Already have a reset token? {" "}
                                <Link href="/reset-password" color="#17c1e8" sx={{ textDecoration: "none" }}>
                                    Reset Password
                                </Link>
                            </Typography>
                        </Box>

                        {/* Sign In Redirect */}
                        <Typography variant="body2" color="text.secondary">
                            Remember your password?{" "}
                            <Link
                                href="#"
                                color="#17c1e8"
                                sx={{ textDecoration: "none" }}
                                onClick={handleSignIn}
                            >
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PasswordResetPage;
