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
  Chip,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ContactsIcon from "@mui/icons-material/Contacts";
import VpnLockIcon from "@mui/icons-material/VpnLock";
import { GetUserDetails } from "../../API/Services/services";

export default function ProfilePage() {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "India",
  });

  const [roleInfo, setRoleInfo] = useState({
    role: "",
    role_display: "",
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await GetUserDetails();

        /* ================= SAVE ROLE (FIX) ================= */
        if (response?.role) {
          localStorage.setItem("role", response.role);
          localStorage.setItem("role_display", response.role_display || response.role);

          setRoleInfo({
            role: response.role,
            role_display: response.role_display || response.role,
          });
        }

        /* ================= SET USER DATA ================= */
        setUser({
          first_name:
            response?.first_name ||
            response?.name?.split(" ")[0] ||
            "",
          last_name:
            response?.last_name ||
            response?.name?.split(" ").slice(1).join(" ") ||
            "",
          email: response?.email || "",
          phone: response?.phone || "",
          country: "India",
        });

      } catch (error) {
        console.error("Profile fetch failed:", error);
      }
    };

    getUser();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", p: 4 }}>
      {/* ================= SIDEBAR ================= */}
      <Paper
        elevation={0}
        sx={{
          width: 220,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: "10px",
          mt: "123px",
        }}
      >
        <Stack direction="row" spacing={2}>
          <RocketLaunchIcon sx={{ fontSize: 18, color: "#67748e" }} />
          <Typography sx={{ fontSize: 14, color: "#67748e" }}>
            Profile
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          <ContactsIcon sx={{ fontSize: 18, color: "#67748e" }} />
          <Typography sx={{ fontSize: 14, color: "#67748e" }}>
            Basic Info
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          <VpnLockIcon sx={{ fontSize: 18, color: "#67748e" }} />
          <Typography sx={{ fontSize: 14, color: "#67748e" }}>
            Change Password
          </Typography>
        </Stack>
      </Paper>

      {/* ================= MAIN ================= */}
      <Box sx={{ flex: 1, ml: 4 }}>
        {/* ===== HEADER ===== */}
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            mb: 4,
            borderRadius: 4,
            width: "82%",
          }}
        >
          <Avatar sx={{ width: 60, height: 60 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#344767" }}>
              {user.first_name || "User"} {user.last_name}
            </Typography>

            <Typography sx={{ color: "#67748e", fontSize: 14 }}>
              {user.email}
            </Typography>

            {roleInfo.role_display && (
              <Chip
                label={roleInfo.role_display}
                size="small"
                sx={{
                  mt: 0.5,
                  backgroundColor: "#e3f2fd",
                  color: "#1e88e5",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </Paper>

        {/* ===== BASIC INFO ===== */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, maxWidth: 700 }}>
          <Typography sx={{ color: "#67748e", fontWeight: 600 }}>
            Basic Info
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 3,
              mt: 2,
            }}
          >
            <TextField
              label="First Name"
              name="first_name"
              value={user.first_name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Last Name"
              name="last_name"
              value={user.last_name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Email"
              value={user.email}
              fullWidth
              disabled
            />

            <TextField
              label="Phone Number"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              select
              label="Country"
              name="country"
              value={user.country}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="India">India</MenuItem>
              <MenuItem value="USA">USA</MenuItem>
              <MenuItem value="UK">UK</MenuItem>
            </TextField>

            {/* ✅ ROLE FIELD */}
            <TextField
              label="Role"
              value={roleInfo.role_display || "—"}
              fullWidth
              disabled
            />
          </Box>

          <Box sx={{ mt: 4, textAlign: "right" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#2e354f",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Update Profile
            </Button>
          </Box>
        </Paper>

        <br />

        {/* ===== CHANGE PASSWORD ===== */}
        <Paper elevation={0} sx={{ p: 4, maxWidth: 700 }}>
          <Typography sx={{ color: "#67748e", fontWeight: 600 }}>
            Change Password
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField label="New Password" type="password" fullWidth />
            <TextField label="Confirm Password" type="password" fullWidth />
          </Box>

          <Box mt={4} textAlign="right">
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#2e354f",
                fontWeight: 700,
                fontSize: 13,
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
