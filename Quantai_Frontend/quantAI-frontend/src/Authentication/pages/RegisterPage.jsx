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
                } else {
                    // Touch all fields to show validation errors
                    formik.setTouched({
                        first_name: true,
                        last_name: true,
                        email: true,
                        password: true,
                        re_password: true,
                    });
                }
            });
        } else if (activeStep === 1) {
            if (formik.values.is_terms_accepted) {
                setActiveStep((prev) => prev + 1);
            } else {
                // Show error by touching the field
                formik.setFieldTouched('is_terms_accepted', true);
                formik.setFieldError('is_terms_accepted', 'You must accept the Terms & Conditions');
            }
        } else if (activeStep === 2) {
            if (formik.values.is_pp_accepted) {
                formik.handleSubmit();
            } else {
                // Show error by touching the field
                formik.setFieldTouched('is_pp_accepted', true);
                formik.setFieldError('is_pp_accepted', 'You must accept the Privacy Policy');
            }
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
                        <Box
                            sx={{
                                pr: 1,
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                p: { xs: 2, sm: 3 },
                                bgcolor: '#fafafa',
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" mb={2} color="#344767">
                                TERMS OF SERVICE AGREEMENT
                            </Typography>

                            <Typography variant="body2" paragraph>
                                <strong>LAST REVISION: JULY 2025</strong>
                            </Typography>

                            <Typography variant="body2" paragraph>
                                PLEASE READ THIS TERMS OF SERVICE AGREEMENT CAREFULLY. BY USING THIS PLATFORM, YOU AGREE TO BE BOUND BY ALL OF THE TERMS AND CONDITIONS OF THIS AGREEMENT.
                            </Typography>

                            <Typography variant="body2" paragraph>
                                This Terms of Service Agreement (the "Agreement") governs your use of this website, www.quantaigroup.com & www.portal.quantaigroup.com owned by QUANTAI DATA PRIVATE LIMITED Referred as QUANTAI in this Agreement.
                            </Typography>

                            <Typography variant="subtitle2" fontWeight="bold" mt={2} mb={1}>
                                I. SERVICE AND FEATURE
                            </Typography>

                            <Typography variant="body2" paragraph>
                                <strong>Terms of Use:</strong> This Website offers certain services or features (the "Services"). By taking Services through this Website, you agree to the Terms of Use set forth in this Agreement.
                            </Typography>

                            <Typography variant="body2" paragraph>
                                <strong>Customer Solicitation:</strong> Unless you notify us or direct QUANTAI reps, while they are calling you, of your desire to opt out from further direct company communications and solicitations, you are agreeing to continue to receive further emails and call solicitations QUANTAI and its designated in house or third-party call team(s).
                            </Typography>

                            <Typography variant="body2" paragraph>
                                <strong>Proprietary Rights:</strong> QUANTAI has proprietary rights and trade secrets in the Services. You may not copy, reproduce, resell or redistribute any Services offered by QUANTAI.
                            </Typography>

                            <Typography variant="subtitle2" fontWeight="bold" mt={2} mb={1}>
                                II. WEBSITE
                            </Typography>

                            <Typography variant="body2" paragraph>
                                <strong>Content and Intellectual Property:</strong> This Website offers information and marketing materials. QUANTAI does not always create the information offered on this Website; instead, the information is often gathered from other sources. To the extent that QUANTAI does create the content on this Website, such content is protected by intellectual property laws of India, foreign nations, and international bodies.
                            </Typography>

                            <Typography variant="body2" paragraph>
                                <strong>License:</strong> By using this Website, you are granted a limited, non-exclusive, nontransferable right to use the content and materials on the Website in connection with your normal, noncommercial, use of the Website.
                            </Typography>

                            <Typography variant="subtitle2" fontWeight="bold" mt={2} mb={1}>
                                III. DISCLAIMER OF WARRANTIES
                            </Typography>

                            <Typography variant="body2" paragraph>
                                YOUR USE OF THIS WEBSITE AND/OR SERVICES ARE AT YOUR SOLE RISK. THE WEBSITE AND SERVICES ARE OFFERED ON AN "AS IS" AND "AS AVAILABLE" BASIS. QUANTAI EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.
                            </Typography>

                            <Typography variant="subtitle2" fontWeight="bold" mt={2} mb={1}>
                                IV. LIMITATION OF LIABILITY
                            </Typography>

                            <Typography variant="body2" paragraph>
                                QUANTAI ENTIRE LIABILITY, AND YOUR EXCLUSIVE REMEDY, IN LAW, IN EQUITY, OR OTHERWISE, WITH RESPECT TO THE WEBSITE CONTENT AND SERVICES AND/OR FOR ANY BREACH OF THIS AGREEMENT IS SOLELY LIMITED TO THE AMOUNT YOU PAID, FOR SERVICES USED VIA THE WEBSITE.
                            </Typography>

                            <Typography variant="subtitle2" fontWeight="bold" mt={2} mb={1}>
                                V. COPYRIGHT INFRINGEMENT
                            </Typography>

                            <Typography variant="body2" paragraph>
                                If you believe that your intellectual property is being used on the Website in a way that constitutes copyright infringement, please contact our Designated Agent at:
                            </Typography>

                            <Typography variant="body2" paragraph>
                                QUANTAI DATA PRIVATE LIMITED<br />
                                Attn: QUANTAI Legal<br />
                                302. SHIVALIK SHILP 2, OPP ITC NARMADA HOTEL, KESHAVBAUG ROAD, AHMEDABAD, GUJARAT, INDIA 380015
                            </Typography>

                            <Typography variant="subtitle2" fontWeight="bold" mt={2} mb={1}>
                                VI. INDEMNIFICATION
                            </Typography>

                            <Typography variant="body2" paragraph>
                                You will release, indemnify, defend and hold harmless QUANTAI, and any of its contractors, agents, employees, officers, directors, shareholders, affiliates and assigns from all liabilities, claims, damages, costs and expenses relating to or arising out of this Agreement or your use of the Website.
                            </Typography>

                            <Typography variant="subtitle2" fontWeight="bold" mt={2} mb={1}>
                                VII. GENERAL
                            </Typography>

                            <Typography variant="body2" paragraph>
                                <strong>Governing Law:</strong> This Agreement will be governed by the laws of India. Neither you nor QUANTAI will commence or prosecute any suit, proceeding or claim to enforce the provisions of this Agreement, other than in courts located in the State of AHMEDABAD, GUJARAT, INDIA.
                            </Typography>

                            <Typography variant="body2" paragraph>
                                <strong>Termination:</strong> QUANTAI reserves the right to terminate your access to the Website if it reasonably believes, in its sole discretion, that you have breached any of the terms and conditions of this Agreement.
                            </Typography>

                            <Typography variant="body2" paragraph fontWeight="bold" mt={2}>
                                BY USING THIS WEBSITE OR USING SERVICES FROM THIS WEBSITE YOU AGREE TO BE BOUND BY ALL OF THE TERMS AND CONDITIONS OF THIS AGREEMENT.
                            </Typography>
                        </Box>

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
                                    I have read and agree to the Terms & Conditions
                                </Typography>
                            }
                        />
                        {formik.touched.is_terms_accepted && formik.errors.is_terms_accepted && (
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
                                pr: 1,
                                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                '& h3': {
                                    fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' },
                                    fontWeight: 600,
                                    mt: 2,
                                    mb: 1
                                },
                                '& strong': {
                                    fontWeight: 600
                                }
                            }}
                        >
                            <strong>QUANTAI DATA PRIVATE LIMITED - Privacy Policy</strong>
                            <br /><br />
                            <em>Effective: July 2025</em>
                            <br /><br />

                            <h3>Scope</h3>
                            QUANTAI DATA PRIVATE LIMITED ("QUANTAI", "we" or "us") is a company constituted under the laws of India, with its principal office at 302, SHIVALIK SHILP 2, OPP. HOTEL ITC NARMADA, KESHAVBAUG ROAD, AHMEDABAD, GUJARAT INDIA 380015.
                            <br /><br />

                            QUANTAI acts as a "Data Controller" under the Information Technology Act, 2000. We are committed to protecting your privacy.
                            <br /><br />

                            <strong>Contact our Data Protection Officer:</strong><br />
                            Email: hello@quantaigroup.com<br />
                            Address: 302, SHIVALIK SHILP 2, OPP. HOTEL ITC NARMADA, KESHAVBAUG ROAD, AHMEDABAD, GUJARAT, INDIA 380015
                            <br /><br />

                            <h3>1. What Personal Data Do We Process?</h3>
                            QUANTAI applies the minimization principle and only processes personal data required for our purposes. We provide sampling solutions and technology for survey research, serving businesses, universities, and governmental agencies.
                            <br /><br />

                            <h3>2. Types of Information We Collect</h3>
                            <strong>(i) Personally Identifiable Information (PII):</strong> Name, email, telephone numbers, residential address.
                            <br /><br />
                            <strong>(ii) Business Contact Information:</strong> Company name, job title, department.
                            <br /><br />
                            <strong>(iii) Employer Information:</strong> Details about your company.
                            <br /><br />
                            <strong>(iv) Automated Information:</strong> IP address, browser type, operating system, website activity.
                            <br /><br />

                            <h3>3. How We Collect Information</h3>
                            <strong>(i) Directly from you:</strong> Through our websites (www.quantaigroup.com, www.quantai.app), business meetings, events, calls, and emails.
                            <br /><br />
                            <strong>(ii) From third parties:</strong> Information service bureaus, social media, event organizers.
                            <br /><br />
                            <strong>(iii) Through automated means:</strong> Cookies (session and persistent), log files with browser data.
                            <br /><br />

                            <h3>4. How We Use Your Information</h3>
                            We use your information to: provide products and services; maintain directories; prevent fraud; respond to inquiries; improve our business; conduct marketing and research; comply with laws; respond to legal requests; protect our rights; and evaluate employment opportunities.
                            <br /><br />

                            <h3>5. Your Rights</h3>
                            <strong>(i)</strong> Request access, correction, or deletion of your personal data.
                            <br />
                            <strong>(ii)</strong> Withdraw consent or object to processing.
                            <br />
                            <strong>(iii)</strong> We implement security measures to protect your data.
                            <br />
                            <strong>(iv)</strong> Manage your account through our webstore or email hello@quantaigroup.com.
                            <br />
                            <strong>(v)</strong> Unsubscribe from newsletters using the footer link.
                            <br />
                            <strong>(vi-ix)</strong> We only collect consented information, use it for stated purposes, and allow you to refuse data collection by unsubscribing.
                            <br /><br />

                            <h3>International Data Processing</h3>
                            Your data may be processed in: <strong>North America</strong> (US, Canada, Mexico, etc.), <strong>EMEA</strong> (UK, Germany, France, UAE, etc.), and <strong>APAC</strong> (India, Australia, Singapore, Japan, etc.).
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

                        {formik.touched.is_pp_accepted && formik.errors.is_pp_accepted && (
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
                        maxWidth: { xs: '100%', sm: 600, md: 700, lg: 1000 },
                        width: "100%",
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