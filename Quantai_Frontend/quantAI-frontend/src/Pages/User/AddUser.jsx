import React, { useState } from "react";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    Stack,
    Checkbox,
    FormControlLabel,
    CircularProgress,
} from "@mui/material";
import { AddUser } from "../../API/Services/services";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddUserForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        profile_type: "",
        is_active: false,
        is_verified: false,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await AddUser(formData);
            toast.success("User added successfully");

            // Reset form after success
            setFormData({
                email: "",
                password: "",
                first_name: "",
                last_name: "",
                profile_type: "",
                is_active: false,
                is_verified: false,
            });
            navigate('/users')
        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message || "Failed to add user"
            );
        } finally {
            setLoading(false);
        }
    };

    const fieldStyles = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#d9d9d9ff' },
            '&:hover fieldset': { borderColor: '#F5F2F2' },
            '&.Mui-focused fieldset': { borderColor: '#EDEDED' },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: 'black' },
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box
                sx={{
                    p: 5,
                    maxWidth: 650,
                    mx: "auto",
                    borderRadius: 4,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: "#142b4fff",
                        mb: 3,
                        textAlign: "center",
                    }}
                >
                    Add New User
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={fieldStyles}
                        />

                        <TextField
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={fieldStyles}
                        />

                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={fieldStyles}
                        />

                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={fieldStyles}
                        />

                        <TextField
                            select
                            label="Profile Type"
                            name="profile_type"
                            value={formData.profile_type}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={fieldStyles}
                        >
                            <MenuItem value="CL">Client</MenuItem>
                            <MenuItem value="DEV">Developer</MenuItem>
                            <MenuItem value="SU">SuperUser</MenuItem>
                        </TextField>

                        <Stack direction="row" spacing={3}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.is_active}
                                        name="is_active"
                                        onChange={handleChange}
                                    />
                                }
                                label="Active"
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.is_verified}
                                        name="is_verified"
                                        onChange={handleChange}
                                    />
                                }
                                label="Verified"
                            />
                        </Stack>

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                backgroundColor: "#0c2a58ff",
                                "&:hover": { backgroundColor: "#11284cff" },
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 500,
                                py: 1.5,
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Add User"
                            )}
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Box>
    );
}
