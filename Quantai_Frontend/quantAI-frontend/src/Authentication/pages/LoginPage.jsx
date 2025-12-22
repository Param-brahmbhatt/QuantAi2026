import React, { useState } from "react";
import {
    Box, Button, Link, Paper, TextField, Typography,
    IconButton, Snackbar, Alert, Divider, useTheme, useMediaQuery
} from "@mui/material";

import { Google, Twitter, Instagram, Apple } from "@mui/icons-material";

import OtpBox from "./OTPDailogue";
import { UserLogin, RequestOTPLogin, LoginWithOTP } from "../../API/Services/services";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    const [useOtp, setUseOtp] = useState(false);
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (useOtp) {
            await handleRequestOtp();
            return;
        }

        try {
            setLoading(true);

            const payload = {
                email: formData.email,
                password: formData.password,
            };

            const res = await UserLogin(payload);

            // Check if verification is required
            if (res?.requires_verification) {
                setSnackbar({
                    open: true,
                    message: res?.detail || "Email not verified. OTP sent to your email.",
                    severity: "info",
                });
                setOtpOpen(true);
                return;
            }

            // Store token and update auth context
            if (res?.access_token) {
                await login({ email: formData.email }, res.access_token);
            } else {
                // If no token in response, still try to login (token might be in localStorage)
                await login({ email: formData.email });
            }

            setSnackbar({
                open: true,
                message: res?.detail || "Login successful!",
                severity: "success",
            });

            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);

        } catch (err) {
            const errorMsg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                "Invalid credentials.";

            setSnackbar({
                open: true,
                message: errorMsg,
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // --- OTP Request ---
    const handleRequestOtp = async () => {
        if (!formData.email) {
            return setSnackbar({
                open: true,
                message: "Enter email first",
                severity: "error",
            });
        }

        try {
            setLoading(true);
            const res = await RequestOTPLogin({ email: formData.email });

            setSnackbar({
                open: true,
                message: res?.detail || "OTP sent",
                severity: "success",
            });

            setOtpOpen(true);

        } catch (err) {
            setSnackbar({
                open: true,
                message: "OTP request failed",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // --- chnage otp --- //
    const handleOtpChange = (index, value) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otpValues];
            newOtp[index] = value;
            setOtpValues(newOtp);
        }
    };

    // --- OTP Submit ---
    const handleOtpSubmit = async () => {
        const otp = otpValues.join("");

        if (otp.length !== 6) {
            return setSnackbar({
                open: true,
                message: "Enter 6-digit OTP",
                severity: "error",
            });
        }

        try {
            setOtpLoading(true);

            const payload = {
                email: formData.email,
                code: otp,
                purpose: "login",
                client_id: "Rkzsy8StAaD4ChLpxJvYQozOawmMkzG8bRwhD7aU", // Internal OAuth2 client ID
            };

            const res = await LoginWithOTP(payload);

            // Store token and update auth context
            if (res?.access_token) {
                await login({ email: formData.email }, res.access_token);
            } else {
                // If no token in response, still try to login (token might be in localStorage)
                await login({ email: formData.email });
            }

            setSnackbar({
                open: true,
                message: res?.detail || "Logged in!",
                severity: "success",
            });

            setOtpOpen(false);

            setTimeout(() => {
                navigate("/");
            }, 1500);

        } catch (err) {
            setSnackbar({
                open: true,
                message: "Invalid OTP",
                severity: "error",
            });
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "95vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: isMobile ? 2 : 0,
            }}
        >
            <Paper
                elevation={10}
                sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    width: isMobile ? "100%" : "85%",
                    maxWidth: 1150,
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)",
                }}
            >
                {/* Left Side - Login Form */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 3,
                        backgroundColor: "white",
                    }}
                >
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Box
                            sx={{
                                width: 400,
                                height: 110,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mx: "auto",
                                mb: 1.5,
                            }}
                        >
                            <img src="/assets/QuantAI.png" alt="Logo" style={{ width: "100%", height: "100%" }} />
                        </Box>

                        <Typography variant="h5" sx={{ marginRight: "60%", marginTop: "20px" }}>
                            Welcome back
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 400 }}>
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#F5F2F2',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#F5F2F2',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#EDEDED',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'black',
                                },
                            }}
                        />
                        {!useOtp && (
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#F5F2F2',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#F5F2F2',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#EDEDED',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            />)}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5, mb: 1 }}>
                            {!useOtp && (
                                <Link href="/forgot-password" variant="body2" color="#67748e" sx={{ textDecoration: 'none' }}>
                                    Forgot Password?
                                </Link>
                            )}
                        </Box>
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 1.5,
                                mb: 1.5,
                                py: 1,
                                background: "linear-gradient(to right, #2196f3, #21cbf3)",
                                boxShadow: "0 4px 10px rgba(33, 150, 243, 0.4)",
                                '&:hover': {
                                    background: "linear-gradient(to right, #1976d2, #00b0ff)",
                                    boxShadow: "0 6px 15px rgba(33, 150, 243, 0.5)",
                                },
                                borderRadius: '15px'
                            }}
                        >
                            {loading ? 'Processing...' : useOtp ? 'Sign In with OTP' : 'Sign In'}
                        </Button>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Link href="#" onClick={(e) => { e.preventDefault(); setUseOtp(!useOtp); }} color="#17c1e8" sx={{ textDecoration: 'none', fontSize: 14 }}>
                                {useOtp ? 'Use Email & Password instead' : 'Use OTP instead'}
                            </Link>
                        </Box>

                        <Divider sx={{ color: '#7f8c8d', my: 1.5 }}>Or continue with</Divider>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 1.5,
                                gap: 1.5,
                            }}
                        >
                            <IconButton
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                    '&:hover': { backgroundColor: '#ffebee' },
                                    height: '40px',
                                    width: '40px'
                                }}
                            >
                                <img src="/assets/google.svg" alt="" sx={{ height: '100%', width: '100%' }} />
                            </IconButton>
                            <IconButton
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                    '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                            >
                                <Twitter color="primary" />
                            </IconButton>
                            <IconButton
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                    '&:hover': { backgroundColor: '#fce4ec' }
                                }}
                            >
                                <Instagram color="secondary" />
                            </IconButton>
                            <IconButton
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                    '&:hover': { backgroundColor: '#e8f5e9' }
                                }}
                            >
                                <Apple sx={{ color: 'black' }} />
                            </IconButton>
                        </Box>

                        <Typography
                            variant="caption"
                            display="block"
                            align="center"
                            sx={{ mt: 1.5 }}
                            color="text.secondary"
                        >
                            Signing up via Social Media, implies acceptance of QuantAi terms & conditions & privacy policy.
                        </Typography>

                        <Box sx={{ textAlign: "center", mt: 1.5 }}>
                            <Typography variant="body2" sx={{ color: '#67748e' }}>
                                Don't have an account?{" "}
                                <Link href="/register" color="#17c1e8" sx={{ textDecoration: 'none' }}>
                                    Sign up
                                </Link>
                            </Typography>
                            {/* bottom links removed per request */}
                        </Box>
                    </Box>
                </Box>

                {/* Right Side - Info Panel */}
                <Box
                    sx={{
                        flex: 1,
                        background: "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)",
                        color: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        p: 3,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                        Monetize Your Opinions.
                    </Typography>
                    <Box
                        sx={{
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: 2,
                            p: 2,
                            width: "80%",
                            maxWidth: 300,
                            mb: 2,
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                                transform: "translateY(-5px)",
                                boxShadow: "0 12px 25px rgba(0, 0, 0, 0.2)",
                            }
                        }}
                    >
                        <Typography variant="h6" fontWeight="medium">Answer questions</Typography>
                    </Box>
                    <Box
                        sx={{
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: 2,
                            p: 2,
                            width: "80%",
                            maxWidth: 300,
                            mb: 2,
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                                transform: "translateY(-5px)",
                                boxShadow: "0 12px 25px rgba(0, 0, 0, 0.2)",
                            }
                        }}
                    >
                        <Typography variant="h6" fontWeight="medium">Earn Quants</Typography>
                    </Box>
                    <Box
                        sx={{
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: 2,
                            p: 2,
                            width: "80%",
                            maxWidth: 300,
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                                transform: "translateY(-5px)",
                                boxShadow: "0 12px 25px rgba(0, 0, 0, 0.2)",
                            }
                        }}
                    >
                        <Typography variant="h6" fontWeight="medium">
                            Redeem Quants for Gift Cards, Vouchers, Crypto and more!
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* OTP Dialogue */}
            <OtpBox
                open={otpOpen}
                otpValues={otpValues}
                handleOtpChange={handleOtpChange}
                handleOtpSubmit={handleOtpSubmit}
                onClose={() => setOtpOpen(false)}
                loading={otpLoading}
                email={formData.email}
            />

            {/* Snackbar for success/error messages */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}