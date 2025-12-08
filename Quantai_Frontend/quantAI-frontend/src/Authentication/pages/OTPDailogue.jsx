import React, { useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Backdrop,
  Paper,
  CircularProgress,
} from "@mui/material";

export default function OtpBox({
  open,
  otpValues,
  handleOtpChange,
  handleOtpSubmit,
  onClose,
  loading = false,
  email = "",
  length = 6,
}) {
  // RESET OTP WHEN MODAL OPENS
  useEffect(() => {
    if (open) {
      // Clear all OTP boxes
      for (let i = 0; i < length; i++) {
        handleOtpChange(i, "");
      }

      // Auto-focus the first OTP box
      setTimeout(() => {
        const first = document.getElementById("otp-input-0");
        if (first) first.focus();
      }, 150);
    }
  }, [open]);

  if (!open) return null;

  return (
    <Backdrop
      open={open}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
      onClick={onClose}
    >
      <Paper
        elevation={6}
        onClick={(e) => e.stopPropagation()}
        sx={{
          borderRadius: 3,
          padding: 4,
          width: { xs: 360, sm: 560 },
          textAlign: "center",
          bgcolor: "white",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#344767", fontWeight: "bold", mb: 1 }}
        >
          Verify Your Email
        </Typography>

        <Typography mb={3} color="#67748e">
          Enter the 6-digit OTP sent to {email || "your email"}.
        </Typography>

        {/* OTP INPUT BOXES */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1.25,
            flexWrap: "nowrap",
            mt: 1,
          }}
        >
          {Array.from({ length }).map((_, index) => (
            <TextField
              key={index}
              id={`otp-input-${index}`}
              value={otpValues[index] || ""}
              inputProps={{ maxLength: 1 }}
              onChange={(e) => {
                const value = e.target.value;

                handleOtpChange(index, value);

                // Move to next
                if (value.length === 1 && index < length - 1) {
                  const next = document.getElementById(`otp-input-${index + 1}`);
                  if (next) next.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otpValues[index] && index > 0) {
                  const prev = document.getElementById(`otp-input-${index - 1}`);
                  if (prev) prev.focus();
                }
              }}
              sx={{
                width: 56,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#9ecff9" },
                  "&:hover fieldset": { borderColor: "#2196f3" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                    boxShadow: "0 0 0 2px rgba(33, 150, 243, 0.2)",
                  },
                },
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 600,
                  py: 1.2,
                },
              }}
            />
          ))}
        </Box>

        {/* VERIFY BUTTON */}
        <Button
          onClick={handleOtpSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            mt: 4,
            py: 1,
            background: "linear-gradient(to right, #2196f3, #21cbf3)",
            boxShadow: "0 4px 10px rgba(33, 150, 243, 0.4)",
            "&:hover": {
              background: "linear-gradient(to right, #1976d2, #00b0ff)",
              boxShadow: "0 6px 15px rgba(33, 150, 243, 0.5)",
            },
            "&:disabled": {
              background: "linear-gradient(to right, #90caf9, #81d4fa)",
            },
            borderRadius: "8px",
            width: "60%",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} sx={{ color: "white" }} />
              Verifying...
            </Box>
          ) : (
            "Verify OTP"
          )}
        </Button>
      </Paper>
    </Backdrop>
  );
}
