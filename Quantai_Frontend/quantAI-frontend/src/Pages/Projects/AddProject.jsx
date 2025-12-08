import React, { useState, useCallback, memo } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Upload } from "@mui/icons-material";
import { CreateProject } from "../../API/Services/services";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/* ------------------ Initial State ------------------ */
const initialState = {
  title: "",
  description: "",
  language_ids: [],
  active: "",
  start_time: "",
  end_time: "",
  reward_points: "",
  code: "",
  project_type: "",
  mode: "",

  logo: "",
  logo_width: "",
  logo_height: "",
  logo_location: "center",
  fit_logo: "",

  display_welcome_message: "",
  welcome_message: "",

  display_thankyou_message: "",
  thankyou_message: "",

  quotefull_message: "",
  terminate_message: "",
  navigation_message: "",

  participant_limit: "",
  start_btn_text: "",
  complete_btn_text: "",
  previous_btn_text: "",
  next_btn_text: "",
  show_progress_bar: "",
  answer_preview: "",
};

/* ------------------ Styles ------------------ */
const inputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#f9fbff",
    "& fieldset": { borderColor: "#d8dff2" },
    "&:hover fieldset": { borderColor: "#b9c4ec" },
    "&.Mui-focused fieldset": {
      borderColor: "#4a5fd4",
      boxShadow: "0 0 0 2px rgba(74,95,212,0.15)",
    },
  },
  "& .MuiInputBase-input": { padding: "13px 14px" },
};

const SectionPaper = memo(({ title, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 4,
      borderRadius: "18px",
      border: "1px solid #e7ebf4",
      background: "#fff",
      boxShadow: "0 6px 25px rgba(20, 30, 70, 0.06)",
    }}
  >
    {title && (
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#122046" }}>
        {title}
      </Typography>
    )}
    {children}
  </Paper>
));
SectionPaper.displayName = "SectionPaper";

/* ------------------ Main Component ------------------ */
const CreateProjectPage = () => {
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }, []);

  const handleCheckbox = useCallback((e) => {
    const { name, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: checked }));
  }, []);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((p) => ({ ...p, logo: file }));
    }
  }, []);

  /* ------------------ Submit Handler ------------------ */
  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        active: Boolean(formData.active),
        fit_logo: Boolean(formData.fit_logo),
        display_welcome_message: Boolean(formData.display_welcome_message),
        display_thankyou_message: Boolean(formData.display_thankyou_message),
        show_progress_bar: Boolean(formData.show_progress_bar),
        answer_preview: Boolean(formData.answer_preview),
        language_ids: formData.language_ids || [],
        participant_limit: Number(formData.participant_limit),
        reward_points: Number(formData.reward_points),
        start_time: formData.start_time
          ? new Date(formData.start_time).toISOString()
          : null,
        end_time: formData.end_time
          ? new Date(formData.end_time).toISOString()
          : null,
      };

      toast.loading("Creating project...");
      await CreateProject(payload);

      toast.dismiss();
      toast.success("Project created successfully!");
      navigate("/projects");
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          sx={{ fontWeight: 600, mb: 5, color: "#0f1f41" }}
        >
          Create New Project
        </Typography>

        <Stack spacing={4}>
          {/* PROJECT DETAILS */}
          <SectionPaper>
            <TextField
              label="Project Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              sx={inputStyles}
            />

            <TextField
              label="Project Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={4}
              sx={{ ...inputStyles, mt: 3 }}
            />

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Languages"
                  name="language_ids"
                  fullWidth
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => selected.join(", "),
                  }}
                  value={formData.language_ids || []}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      language_ids: e.target.value,
                    }))
                  }
                  sx={{ ...inputStyles, width: "200px" }}
                >
                  <MenuItem value={2}>English</MenuItem>
                  <MenuItem value={3}>Hindi</MenuItem>
                  <MenuItem value={4}>Gujarati</MenuItem>
                  <MenuItem value={5}>Tamil</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="active"
                      checked={formData.active}
                      onChange={handleCheckbox}
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Reward Points"
                  name="reward_points"
                  value={formData.reward_points}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Project Code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Project Type"
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                  fullWidth
                   sx={{ ...inputStyles, width: "200px" }}
                >
                  <MenuItem value="SU">Survey</MenuItem>
                  <MenuItem value="PR">Profiling</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  type="datetime-local"
                  label="Start Time"
                  name="start_time"
                  InputLabelProps={{ shrink: true }}
                  value={formData.start_time}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  type="datetime-local"
                  label="End Time"
                  name="end_time"
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_time}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Participant Limit"
                  name="participant_limit"
                  value={formData.participant_limit}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Mode"
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  fullWidth
                   sx={{ ...inputStyles, width: "200px" }}
                >
                  <MenuItem value="PR">Preview</MenuItem>
                  <MenuItem value="DE">Development</MenuItem>
                  <MenuItem value="LIVE">Live</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </SectionPaper>

          {/* LOGO SETTINGS */}
          <SectionPaper title="Logo Settings">
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<Upload />}
                sx={{
                  px: 4,
                  py: 1.6,
                  borderRadius: "10px",
                  textTransform: "none",
                  background: "linear-gradient(90deg, #125bfd, #23c0ff)",
                }}
              >
                Upload Logo
                <input hidden type="file" accept="image/*" onChange={handleLogoUpload} />
              </Button>

              {formData.logo && (
                <Paper
                  sx={{
                    width: 120,
                    height: 120,
                    display: "flex",
                    borderRadius: 3,
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e3e7f2",
                    background: "#f2f5ff",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={URL.createObjectURL(formData.logo)}
                    alt="Logo"
                    style={{
                      width: formData.logo_width || "100%",
                      height: formData.logo_height || "100%",
                      objectFit: formData.fit_logo ? "contain" : "none",
                    }}
                  />
                </Paper>
              )}
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.fit_logo}
                      name="fit_logo"
                      onChange={handleCheckbox}
                    />
                  }
                  label="Fit Logo"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Logo Width (px)"
                  name="logo_width"
                  value={formData.logo_width}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Logo Height (px)"
                  name="logo_height"
                  value={formData.logo_height}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Logo Location"
                  name="logo_location"
                  value={formData.logo_location}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyles}
                >
                  {["center", "left", "right"].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </SectionPaper>

          {/* MESSAGES */}
          <SectionPaper title="Messages & UI Text">
            <FormControlLabel
              control={
                <Checkbox
                  name="display_welcome_message"
                  checked={formData.display_welcome_message}
                  onChange={handleCheckbox}
                />
              }
              label="Display Welcome Message"
            />

            {formData.display_welcome_message && (
              <TextField
                fullWidth
                label="Welcome Message"
                name="welcome_message"
                multiline
                minRows={4}
                value={formData.welcome_message}
                onChange={handleChange}
                sx={inputStyles}
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  name="display_thankyou_message"
                  checked={formData.display_thankyou_message}
                  onChange={handleCheckbox}
                />
              }
              label="Display Thank You Message"
            />

            {formData.display_thankyou_message && (
              <TextField
                fullWidth
                label="Thank You Message"
                name="thankyou_message"
                multiline
                minRows={4}
                value={formData.thankyou_message}
                onChange={handleChange}
                sx={inputStyles}
              />
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quota Full Message"
                  name="quotefull_message"
                  multiline
                  minRows={4}
                  value={formData.quotefull_message}
                  onChange={handleChange}
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Terminate Message"
                  name="terminate_message"
                  multiline
                  minRows={4}
                  value={formData.terminate_message}
                  onChange={handleChange}
                  sx={inputStyles}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Navigation Message"
              name="navigation_message"
              multiline
              minRows={4}
              value={formData.navigation_message}
              onChange={handleChange}
              sx={{ ...inputStyles, mt: 3 }}
            />

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {[
                "start_btn_text",
                "complete_btn_text",
                "previous_btn_text",
                "next_btn_text",
              ].map((field, index) => (
                <Grid item xs={12} md={3} key={index}>
                  <TextField
                    fullWidth
                    label={field.replace(/_/g, " ")}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    sx={inputStyles}
                  />
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="show_progress_bar"
                    checked={formData.show_progress_bar}
                    onChange={handleCheckbox}
                  />
                }
                label="Show Progress Bar"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="answer_preview"
                    checked={formData.answer_preview}
                    onChange={handleCheckbox}
                  />
                }
                label="Enable Answer Preview"
              />
            </Stack>
          </SectionPaper>
        </Stack>

        {/* ACTION BUTTONS */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 4 }}>
          <Button variant="outlined" sx={{ px: 4, py: 1.5, borderRadius: "12px" }}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(90deg, #125bfd, #23c0ff)",
            }}
          >
            Create Project
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default CreateProjectPage;
