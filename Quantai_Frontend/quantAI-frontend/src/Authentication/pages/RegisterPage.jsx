import React, { useState } from "react";
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    TextField,
    Checkbox,
    FormControlLabel,
    Button,
    Typography,
    Paper,
    Snackbar,
    Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Logo from "/assets/QuantAI.png";
import OtpBox from "./OTPDailogue";
import { SignUp, VerifyOTP } from "../../API/Services/services";

const steps = ["User Info", "Terms & Conditions", "Privacy Policy"];

const validationSchema = Yup.object({
    first_name: Yup.string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .required("First name is required"),
    last_name: Yup.string()
        .trim()
        .min(2, "Last name must be at least 2 characters")
        .required("Last name is required"),
    email: Yup.string().email("Enter a valid email").required("Email is required"),
    password: Yup.string()
        .min(8, "Password must be minimum 8 characters")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(/[!@#$%^&*]/, "Password must contain at least one special character")
        .required("Password is required"),
    re_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Please confirm your password"),
    is_terms_accepted: Yup.boolean().oneOf(
        [true],
        "You must accept the Terms & Conditions"
    ),
    is_pp_accepted: Yup.boolean().oneOf(
        [true],
        "You must accept the Privacy Policy"
    ),
});

export default function SignupUI() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [userEmail, setUserEmail] = useState("");

    const formik = useFormik({
        initialValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            re_password: "",
            is_terms_accepted: false,
            is_pp_accepted: false,
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const payload = {
                    first_name: values.first_name,
                    last_name: values.last_name,
                    email: values.email,
                    password: values.password,
                    confirm_password: values.re_password,
                };

                const res = await SignUp(payload);

                setUserEmail(values.email);
                setSnackbar({
                    open: true,
                    message: "OTP sent to your email. Please verify to complete signup.",
                    severity: "info",
                });

                setOtpOpen(true);
            } catch (err) {
                const errorMsg =
                    err?.response?.data?.detail || err?.response?.data?.message || "Something went wrong during signup.";
                setSnackbar({
                    open: true,
                    message: errorMsg,
                    severity: "error",
                });
            } finally {
                setLoading(false);
            }
        },
    });

    const handleNext = () => {
        if (activeStep === 0) {
            formik.validateForm().then((errors) => {
                if (
                    !errors.first_name &&
                    !errors.last_name &&
                    !errors.email &&
                    !errors.password &&
                    !errors.re_password
                ) {
                    setActiveStep((prev) => prev + 1);
                }
            });
        } else if (activeStep === 1 && formik.values.is_terms_accepted) {
            setActiveStep((prev) => prev + 1);
        } else if (activeStep === 2 && formik.values.is_pp_accepted) {
            formik.handleSubmit();
        }
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleOtpChange = (index, value) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otpValues];
            newOtp[index] = value;
            setOtpValues(newOtp);
        }
    };

    const handleOtpSubmit = async () => {
        const otp = otpValues.join("");
        if (otp.length !== 6) {
            setSnackbar({
                open: true,
                message: "Please enter a valid 6-digit OTP",
                severity: "error",
            });
            return;
        }

        try {
            setOtpLoading(true);
            const payload = {
                email: userEmail,
                code: otp,
                purpose: "signup",
            };

            const res = await VerifyOTP(payload);

            // Store token if received; normalize to plain access token string
            if (res?.token || res?.access_token) {
                const tokenObj = typeof res?.token === "object" ? res?.token : null;
                const tokenValue =
                    tokenObj?.access_token ||
                    tokenObj?.token ||
                    res?.access_token ||
                    res?.token;
                if (tokenValue) {
                    localStorage.setItem("access_token", tokenValue);
                }
            }

            setSnackbar({
                open: true,
                message: res?.detail || "OTP verified successfully!",
                severity: "success",
            });

            // Force showing welcome page after signup
            localStorage.removeItem("hasSeenWelcomePage");

            setOtpOpen(false);
            setActiveStep(0);
            formik.resetForm();
            
            // Redirect to welcome page after successful OTP verification
            setTimeout(() => {
                navigate("/welcome");
            }, 500);
            setOtpValues(["", "", "", "", "", ""]);
            setUserEmail("");
        } catch (err) {
            const errorMsg =
                err?.response?.data?.detail || err?.response?.data?.message || "Invalid OTP. Please try again.";
            setSnackbar({
                open: true,
                message: errorMsg,
                severity: "error",
            });
        } finally {
            setOtpLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box display="flex" flexDirection="column" gap={2}>
                        {["first_name", "last_name", "email", "password", "re_password"].map(
                            (field) => (
                                <TextField
                                    key={field}
                                    label={
                                        field === "first_name"
                                            ? "First Name"
                                            : field === "last_name"
                                                ? "Last Name"
                                                : field === "email"
                                                    ? "Email"
                                                    : field === "password"
                                                        ? "Password"
                                                        : "Confirm Password"
                                    }
                                    name={field}
                                    type={
                                        field === "password" || field === "re_password"
                                            ? "password"
                                            : "text"
                                    }
                                    value={formik.values[field]}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    fullWidth
                                    error={formik.touched[field] && Boolean(formik.errors[field])}
                                    helperText={formik.touched[field] && formik.errors[field]}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": { borderColor: "#F5F2F2" },
                                            "&:hover fieldset": { borderColor: "#F5F2F2" },
                                            "&.Mui-focused fieldset": { borderColor: "#EDEDED" },
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                                    }}
                                />
                            )
                        )}
                    </Box>
                );
            case 1:
                return (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Typography>Terms & Conditions text here.</Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="is_terms_accepted"
                                    checked={formik.values.is_terms_accepted}
                                    onChange={formik.handleChange}
                                />
                            }
                            label="I agree to the Terms & Conditions"
                        />
                        {formik.errors.is_terms_accepted && (
                            <Typography color="error" variant="body2">
                                {formik.errors.is_terms_accepted}
                            </Typography>
                        )}
                    </Box>
                );
            case 2:
                return (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Typography>Privacy Policy content goes here.</Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="is_pp_accepted"
                                    checked={formik.values.is_pp_accepted}
                                    onChange={formik.handleChange}
                                />
                            }
                            label="I agree to the Privacy Policy"
                        />
                        {formik.errors.is_pp_accepted && (
                            <Typography color="error" variant="body2">
                                {formik.errors.is_pp_accepted}
                            </Typography>
                        )}
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "#f5f7fa",
                    p: 2,
                }}
            >
                <Paper
                    elevation={4}
                    sx={{
                        p: 6,
                        maxWidth: 900,
                        width: "100%",
                        bgcolor: "white",
                        borderRadius: 3,
                    }}
                >
                    <Box display="flex" justifyContent="center" mb={4}>
                        <img src={Logo} alt="Logo" style={{ height: 100, marginRight: 30 }} />
                    </Box>

                    <Typography variant="h4" fontWeight="bold" mb={1} color="#344767">
                        Join Us Today
                    </Typography>
                    <Typography variant="body1" mb={3} color="#344767">
                        Create your account to get started
                    </Typography>

                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel
                                    sx={{ "& .MuiStepLabel-label": { color: "#344767 !important" } }}
                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {renderStepContent(activeStep)}

                    <Box display="flex" justifyContent="space-between" mt={4}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            variant="outlined"
                            sx={{
                                py: 1,
                                background: "white",
                                boxShadow: "0 4px 10px rgba(33, 150, 243, 0.4)",
                                borderRadius: "5px",
                                color: "black",
                            }}
                        >
                            Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1,
                                px: 4,
                                background: "linear-gradient(to right, #2196f3, #21cbf3)",
                                boxShadow: "0 4px 10px rgba(33, 150, 243, 0.4)",
                                borderRadius: "5px",
                            }}
                        >
                            {loading
                                ? "Creating..."
                                : activeStep === steps.length - 1
                                    ? "Sign Up"
                                    : "Next"}
                        </Button>
                    </Box>

                    <Typography mt={4} textAlign="center" variant="body2" color="#344767">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            style={{ textDecoration: "none", color: "#17c1e8" }}
                        >
                            Sign in
                        </Link>
                    </Typography>
                </Paper>
            </Box>

            {/* ✅ OTP Box */}
            <OtpBox
                open={otpOpen}
                otpValues={otpValues}
                handleOtpChange={handleOtpChange}
                handleOtpSubmit={handleOtpSubmit}
                onClose={() => setOtpOpen(false)}
                loading={otpLoading}
                email={userEmail}
            />

            {/* ✅ Snackbar for success/error messages */}
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
        </>
    );
}
