import React, { useState } from "react";
import {
    Box,
    Button,
    MenuItem,
    Paper,
    TextField,
    Typography,
    Stack,
} from "@mui/material";

export default function AddUserForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        status: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("New User Data:", formData);
    };

    const fieldStyles = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#d9d9d9ff',
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
        '& input, & textarea': {
            textAlign: 'center',         // horizontal center
            paddingTop: '10px',          // vertical spacing top
            paddingBottom: '10px',       // vertical spacing bottom
        },
    };


    return (
        <Box sx={{ p: 4 }}>
            <Box
                elevation={3}
                sx={{
                    p: 5,
                    maxWidth: 650,
                    mx: "auto",
                    borderRadius: 4
                }}
            >
                <Typography
                    variant="h5"
                    gutterBottom
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
                    <Stack spacing={4}>
                        <TextField
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputProps={{ sx: { height: 50, fontSize: "1rem" } }}
                            InputLabelProps={{ sx: { fontSize: "1rem" } }}
                            sx={fieldStyles}
                        />

                        <TextField
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputProps={{ sx: { height: 50, fontSize: "1rem" } }}
                            InputLabelProps={{ sx: { fontSize: "1rem" } }}
                            sx={fieldStyles}
                        />

                        <TextField
                            select
                            label="Role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputProps={{ sx: { height: 50, fontSize: "1rem" } }}
                            InputLabelProps={{ sx: { fontSize: "1rem" } }}
                            sx={fieldStyles}
                        >
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="User">User</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputProps={{ sx: { height: 50, fontSize: "1rem" } }}
                            InputLabelProps={{ sx: { fontSize: "1rem" } }}
                            sx={fieldStyles}
                        >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </TextField>

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            sx={{
                                backgroundColor: "#0c2a58ff",
                                "&:hover": { backgroundColor: "#11284cff" },
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 500,
                                fontSize: "1rem",
                                py: 1.5,
                            }}
                        >
                            Add User
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Box>
    );
}
