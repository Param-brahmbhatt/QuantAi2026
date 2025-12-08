import React, { useState } from "react";
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
} from "@mui/material";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            setError("Please fill all fields");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        setSubmitting(true);
        console.log("Reset password submit", { password });
        setTimeout(() => {
            setSubmitting(false);
            setSuccess(true);
        }, 800);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={6} sx={{ p: 5, borderRadius: 3 }}>
                    <Box sx={{ width: 350, height: 95, mx: "auto", mb: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src="/assets/QuantAI.png" alt="Logo" style={{ width: "100%", height: "100%" }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: "#344767", mb: 2 }}>
                        Reset Password
                    </Typography>
                    {success ? (
                        <Alert severity="success">Password updated successfully. You can now sign in.</Alert>
                    ) : (
                        <Box component="form" onSubmit={handleSubmit}>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            <TextField
                                fullWidth
                                margin="dense"
                                label="New Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                            borderColor: '#d6d2d2ff',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#000',
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                            borderColor: '#d6d2d2ff',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#000',
                                    },
                                }}
                            />
                            <Button
                                fullWidth
                                type="submit"
                                disabled={submitting}
                                variant="contained"
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
                                Update Password
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default ResetPassword;
