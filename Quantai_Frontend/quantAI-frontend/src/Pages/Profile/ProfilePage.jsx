import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    MenuItem,
    Paper,
    Stack,
} from "@mui/material";
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ContactsIcon from '@mui/icons-material/Contacts';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import { GetUserDetails } from "../../API/Services/services";

export default function ProfilePage() {
    const [user, setUser] = useState()

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await GetUserDetails();
                setUser(response);
            } catch (error) {
                console.log(error);
            }
        };
        getUser();
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                p: 4,
            }}
        >
            {/* Sidebar */}
            <Paper
                elevation={0}
                sx={{
                    width: 220,
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    height: '100px',
                    borderRadius: '10px',
                    lineHeight: 1.5,
                    mt: '123px'
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <RocketLaunchIcon sx={{ fontFamily: 'Helvetica', fontSize: '18px', color: 'rgb(103, 116, 142)' }} />
                    <Typography variant="p" sx={{ fontFamily: 'Helvetica', fontSize: '14px', color: 'rgb(103, 116, 142)' }}>Profile</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <ContactsIcon sx={{ fontFamily: 'Helvetica', fontSize: '18px', color: 'rgb(103, 116, 142)' }} />
                    <Typography variant="p" sx={{ fontFamily: 'Helvetica', fontSize: '14px', color: 'rgb(103, 116, 142)' }}>Basic Info</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <VpnLockIcon sx={{ fontFamily: 'Helvetica', fontSize: '18px', color: 'rgb(103, 116, 142)' }} />
                    <Typography variant="p" sx={{ fontFamily: 'Helvetica', fontSize: '14px', color: 'rgb(103, 116, 142)' }}>Change Password</Typography>
                </Stack>
            </Paper>

            {/* Main Content */}
            <Box sx={{ flex: 1, ml: 4 }}>
                {/* Profile Header */}
                <Paper
                    elevation={0}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        mb: 4,
                        borderRadius: 4,
                        width: '82%'
                    }}
                >
                    <Avatar
                        sx={{ width: 60, height: 60 }}
                        src="/assets/profile.png"
                        alt="Profile"
                    />
                    <Box>
                        <Typography variant="h6"
                            sx={{ color: "rgb(52, 71, 103)", fontWeight: 700 }}
                        >
                            {user?.name || user?.first_name || user?.email || "User"}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "rgb(103, 116, 142)" }}
                        >
                            {user?.email || ""}
                        </Typography>
                    </Box>
                </Paper>

                {/* Basic Info Form */}
                <Paper
                    elevation={0}
                    sx={{ p: 4, borderRadius: 4, maxWidth: 700 }}
                >
                    <Typography variant="h6" gutterBottom sx={{ color: "rgb(103, 116, 142)", fontWeight: 600 }}>
                        Basic Info
                    </Typography>
                    <Box
                        component="form"
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 3,
                            mt: 2,
                        }}
                    >
                        <TextField
                            label="First Name"
                            defaultValue={user?.first_name || user?.name?.split(' ')[0] || ""}
                            fullWidth
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
                        <TextField
                            label="Last Name"
                            defaultValue={user?.last_name || user?.name?.split(' ').slice(1).join(' ') || ""}
                            fullWidth
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
                        <TextField
                            label="Email"
                            defaultValue={user?.email || ""}
                            fullWidth
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
                        <TextField
                            label="Phone Number"
                            placeholder="Enter phone number"
                            fullWidth
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
                        <TextField
                            select
                            label="Country"
                            defaultValue="India"
                            fullWidth
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
                        >
                            <MenuItem value="India">India</MenuItem>
                            <MenuItem value="USA">USA</MenuItem>
                            <MenuItem value="UK">UK</MenuItem>
                        </TextField>
                    </Box>
                    <Box sx={{ mt: 4, textAlign: "right" }}>
                        <Button variant="contained" sx={{ color: 'white', backgroundColor: '#2e354fff', fontFamily: 'Helvetica', fontWeight: 700, fontSize: '12px' }}>
                            Update Profile
                        </Button>
                    </Box>
                </Paper><br /><br />

                <Paper
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        maxWidth: 700,
                        backgroundColor: "#ffffff",
                        boxShadow: 'none'
                    }}
                >
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            color: "rgb(103, 116, 142)",
                            fontWeight: 600,
                            fontSize: 18,
                        }}
                    >
                        Change Password
                    </Typography>

                    <Box
                        component="form"
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2.5,
                            mt: 2,
                        }}
                    >
                        <TextField
                            label="New Password"
                            type="password"
                            placeholder="Enter new password"
                            fullWidth
                            InputProps={{
                                sx: { fontSize: 14 },
                            }}
                            InputLabelProps={{
                                sx: {
                                    fontSize: 14,
                                    color: '#777474ff',
                                    '&.Mui-focused': {
                                        color: '#777474ff',
                                    },
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#E0E0E0' },
                                    '&:hover fieldset': { borderColor: '#BDBDBD' },
                                    '&.Mui-focused fieldset': { borderColor: '#BDBDBD' },
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    fontSize: 12,
                                    color: '#777474ff',
                                },
                            }}
                        />

                        <TextField
                            label="Confirm Password"
                            type="password"
                            placeholder="Re-enter new password"
                            fullWidth
                            InputProps={{
                                sx: { fontSize: 14 },
                            }}
                            InputLabelProps={{
                                sx: {
                                    fontSize: 14,
                                    color: '#777474ff',
                                    '&.Mui-focused': { color: '#777474ff' },
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#E0E0E0' },
                                    '&:hover fieldset': { borderColor: '#BDBDBD' },
                                    '&.Mui-focused fieldset': { borderColor: '#BDBDBD' },
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    fontSize: 12,
                                    color: '#777474ff',
                                },
                            }}
                        />
                    </Box>
                    <Box mt={2} p={2} bgcolor="grey.50" borderRadius={2}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#67748e', fontFamily: "Arial", lineHeight: '1.6', letterSpacing: "0.01071em" }}>
                            Please follow this guide for a strong password
                        </Typography>
                        <Typography variant="body2" color="#67748e" sx={{ lineHeight: '1.6', letterSpacing: "0.01071em" }}>
                            • Password must not be similar to your user details <br />
                            • Must contain at least one special character <br />
                            • Minimum 8 characters <br />
                            • At least one number (2 are recommended) <br />
                            • Change it often
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 4, textAlign: "right" }}>
                        <Button
                            variant="contained"
                            sx={{
                                color: "#fff",
                                backgroundColor: "#2e354f",
                                fontFamily: "Helvetica",
                                fontWeight: 700,
                                fontSize: 13,
                                px: 3,
                                py: 1,
                                '&:hover': {
                                    backgroundColor: "#1f253f",
                                },
                            }}
                        >
                            Update Password
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}
