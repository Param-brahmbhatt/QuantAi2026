import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Divider,
  Typography,
} from "@mui/material";

const AddRedemptionDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    minGap: "",
    minEligibility: "",
    maxEligibility: "",
    share: "",
    profilingOnly: true,
    active: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
    setFormData({
      name: "",
      minGap: "",
      minEligibility: "",
      maxEligibility: "",
      share: "",
      profilingOnly: true,
      active: true,
    });
  };

  // Common style for label text
  const labelStyle = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
    mb: 0.5,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0,
          backgroundColor: "#fff",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "18px",
          borderBottom: "1px solid #e0e0e0",
          pb: 1,
        }}
      >
        Add Redemption
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Name */}
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Name</Typography>
            <TextField
              name="name"
              placeholder="Enter name"
              fullWidth
              size="small"
              value={formData.name}
              onChange={handleChange}
              InputLabelProps={{ shrink: false }}
            />
          </Grid>

          {/* Min Redemption Gap */}
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Min Redemption Gap In Days</Typography>
            <TextField
              name="minGap"
              type="number"
              placeholder="0"
              fullWidth
              size="small"
              value={formData.minGap}
              onChange={handleChange}
              InputLabelProps={{ shrink: false }}
            />
          </Grid>

          {/* Min Eligibility */}
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Min Eligibility For Redemption</Typography>
            <TextField
              name="minEligibility"
              type="number"
              placeholder="0"
              fullWidth
              size="small"
              value={formData.minEligibility}
              onChange={handleChange}
              InputLabelProps={{ shrink: false }}
            />
          </Grid>

          {/* Max Eligibility */}
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Max Eligibility For Redemption</Typography>
            <TextField
              name="maxEligibility"
              type="number"
              placeholder="0"
              fullWidth
              size="small"
              value={formData.maxEligibility}
              onChange={handleChange}
              InputLabelProps={{ shrink: false }}
            />
          </Grid>

          {/* Redemption Share */}
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Redemption Share From Profiling Rewards</Typography>
            <TextField
              name="share"
              type="number"
              placeholder="0"
              fullWidth
              size="small"
              value={formData.share}
              onChange={handleChange}
              InputLabelProps={{ shrink: false }}
            />
          </Grid>

          {/* Checkboxes */}
          <Grid
            item
            xs={12}
            sm={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  name="profilingOnly"
                  checked={formData.profilingOnly}
                  onChange={handleCheckboxChange}
                />
              }
              label={
                <Typography sx={{ fontSize: 14 }}>
                  Allow only profiling redemption
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="active"
                  checked={formData.active}
                  onChange={handleCheckboxChange}
                />
              }
              label={<Typography sx={{ fontSize: 14 }}>Active</Typography>}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider sx={{ mt: 2 }} />

      {/* Footer Buttons */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            fontWeight: 500,
            borderColor: "#c7c7c7",
            color: "#555",
            "&:hover": { borderColor: "#bdbdbd", backgroundColor: "#fafafa" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            textTransform: "none",
            background: "#1976d2",
            borderRadius: "8px",
            px: 3,
            fontWeight: 500,
            "&:hover": { background: "#1565c0" },
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRedemptionDialog;
