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
    useMediaQuery,
    useTheme,
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery('(max-width:375px)');
    
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

            localStorage.removeItem("hasSeenWelcomePage");

            setOtpOpen(false);
            setActiveStep(0);
            formik.resetForm();
            
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
                    <Box display="flex" flexDirection="column" gap={{ xs: 1.5, sm: 2 }}>
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
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": { borderColor: "#dadada" },
                                            "&:hover fieldset": { borderColor: "#F5F2F2" },
                                            "&.Mui-focused fieldset": { borderColor: "#EDEDED" },
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                                        "& .MuiInputLabel-root": {
                                            fontSize: { xs: '0.9rem', sm: '1rem' }
                                        },
                                    }}
                                />
                            )
                        )}
                    </Box>
                );
            case 1:
                return (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Typography 
                            variant={isMobile ? "body2" : "body1"}
                            sx={{ 
                                maxHeight: { xs: '200px', sm: '300px' },
                                overflowY: 'auto',
                                pr: 1
                            }}
                        >
                            Terms & Conditions text here.
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="is_terms_accepted"
                                    checked={formik.values.is_terms_accepted}
                                    onChange={formik.handleChange}
                                    size={isMobile ? "small" : "medium"}
                                />
                            }
                            label={
                                <Typography variant={isMobile ? "body2" : "body1"}>
                                    I agree to the Terms & Conditions
                                </Typography>
                            }
                        />
                        {formik.errors.is_terms_accepted && (
                            <Typography color="error" variant="body2" fontSize={isSmallMobile ? '0.7rem' : '0.875rem'}>
                                {formik.errors.is_terms_accepted}
                            </Typography>
                        )}
                    </Box>
                );
            case 2:
                return (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Typography 
                            variant={isMobile ? "body2" : "body1"}
                            sx={{ 
                                maxHeight: { xs: '200px', sm: '300px' },
                                overflowY: 'auto',
                                pr: 1
                            }}
                        >
                            Privacy Policy content goes here.
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="is_pp_accepted"
                                    checked={formik.values.is_pp_accepted}
                                    onChange={formik.handleChange}
                                    size={isMobile ? "small" : "medium"}
                                />
                            }
                            label={
                                <Typography variant={isMobile ? "body2" : "body1"}>
                                    I agree to the Privacy Policy
                                </Typography>
                            }
                        />
                        {formik.errors.is_pp_accepted && (
                            <Typography color="error" variant="body2" fontSize={isSmallMobile ? '0.7rem' : '0.875rem'}>
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
                    p: { xs: 1, sm: 2, md: 3 },
                }}
            >
                <Box
                    elevation={4}
                    sx={{
                        p: { xs: 2, sm: 4, md: 4, lg: 5 },
                        maxWidth: { xs: '100%', sm: 500, md: 550, lg: 800 },
                        width: "100%",
                        // bgcolor: "white",
                        borderRadius: { xs: 2, sm: 3 },
                        height: '90vh',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#888',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: '#555',
                        },
                    }}
                >
                    <Box display="flex" justifyContent="center" mb={{ xs: 2, sm: 2.5, md: 3 }}>
                        <img 
                            src={Logo} 
                            alt="Logo" 
                            style={{ 
                                height: isSmallMobile ? 60 : isMobile ? 70 : 80,
                                marginRight: isMobile ? 15 : 20,
                                maxWidth: '100%',
                                objectFit: 'contain'
                            }} 
                        />
                    </Box>

                    <Typography 
                        variant={isSmallMobile ? "h6" : isMobile ? "h5" : "h5"} 
                        fontWeight="bold" 
                        mb={1} 
                        color="#344767"
                        textAlign={{ xs: 'center', sm: 'left' }}
                    >
                        Join Us Today
                    </Typography>
                    <Typography 
                        variant="body2"
                        mb={{ xs: 2, sm: 2.5 }} 
                        color="#344767"
                        textAlign={{ xs: 'center', sm: 'left' }}
                    >
                        Create your account to get started
                    </Typography>

                    <Box>
                        {renderStepContent(activeStep)}
                    </Box>

                    <Box 
                        display="flex" 
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between" 
                        gap={{ xs: 2, sm: 0 }}
                        mt={{ xs: 3, sm: 3 }}
                    >
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            variant="outlined"
                            fullWidth={isMobile}
                            size={isMobile ? "medium" : "large"}
                            sx={{
                                py: { xs: 0.75, sm: 1 },
                                px: { xs: 2, sm: 3 },
                                background: "white",
                                boxShadow: "0 4px 10px rgba(33, 150, 243, 0.4)",
                                borderRadius: "5px",
                                color: "#000",
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                order: { xs: 2, sm: 1 }
                            }}
                        >
                            Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            variant="contained"
                            disabled={loading}
                            fullWidth={isMobile}
                            size={isMobile ? "medium" : "large"}
                            sx={{
                                py: { xs: 0.75, sm: 1 },
                                px: { xs: 2, sm: 4 },
                                background: "linear-gradient(to right, #2196f3, #21cbf3)",
                                boxShadow: "0 4px 10px rgba(33, 150, 243, 0.4)",
                                borderRadius: "5px",
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                order: { xs: 1, sm: 2 }
                            }}
                        >
                            {loading
                                ? "Creating..."
                                : activeStep === steps.length - 1
                                    ? "Sign Up"
                                    : "Next"}
                        </Button>
                    </Box>

                    <Typography 
                        mt={{ xs: 3, sm: 4 }} 
                        textAlign="center" 
                        variant="body2" 
                        color="#344767"
                        fontSize={{ xs: '0.8rem', sm: '0.875rem' }}
                    >
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            style={{ textDecoration: "none", color: "#17c1e8" }}
                        >
                            Sign in
                        </Link>
                    </Typography>
                </Box>
            </Box>

            <OtpBox
                open={otpOpen}
                otpValues={otpValues}
                handleOtpChange={handleOtpChange}
                handleOtpSubmit={handleOtpSubmit}
                onClose={() => setOtpOpen(false)}
                loading={otpLoading}
                email={userEmail}
            />

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