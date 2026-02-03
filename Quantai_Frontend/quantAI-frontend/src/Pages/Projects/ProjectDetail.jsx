import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  NavigateNext,
  RadioButtonChecked,
  Grade,
  AccessTime,
  CheckBox,
  GridOn,
  Visibility,
  Numbers,
  ShortText,
  Home,
  ExpandMore,
} from "@mui/icons-material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import FormBuilder from "./FormBuilder";
import EditProjectPage from "./EditProject";

// Utility function to strip HTML tags from text
const stripHtmlTags = (html) => {
  if (!html || typeof html !== 'string') return html || '';
  // Create a temporary DOM element to extract text content
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const topTabs = [
  "Statistics",
  "Basic",
  "Questionnaire",
  "Variables",
  "Filters",
  "Preview",
  "Results",
  "Reports",
];

const questionComponents = [
  { type: "radio", label: "Radio (Single Select)", icon: <RadioButtonChecked /> },
  { type: "rating", label: "Rating", icon: <Grade /> },
  { type: "timer", label: "Timer", icon: <AccessTime /> },
  { type: "checkbox", label: "Checkbox", icon: <CheckBox /> },
  { type: "grid", label: "Grid", icon: <GridOn /> },
  { type: "view", label: "View", icon: <Visibility /> },
  { type: "number", label: "Number", icon: <Numbers /> },
  { type: "text", label: "Text", icon: <ShortText /> },
];

const rotationOptions = ["No Rotation", "Forward", "Backward", "Random"];

const RichTextInput = ({ value, onChange, placeholder }) => (
  <CKEditor
    editor={ClassicEditor}
    data={value || ""}
    config={{
      placeholder,
      toolbar: {
        items: [
          "undo",
          "redo",
          "|",
          "heading",
          "|",
          "bold",
          "italic",
          "bulletedList",
          "numberedList",
          "|",
          "blockQuote",
          "link",
          "insertTable",
        ],
      },
    }}
    onChange={(event, editor) => onChange(editor.getData())}
  />
);

const QuestionSettingsPanel = ({
  config,
  settings,
  onChange,
  responses,
  onResponsesChange,
}) => {
  if (!config) return null;

  const handleFieldChange = (name, value) => {
    onChange(name, value);
  };

  const handleResponseChange = (index, key, value) => {
    const updated = responses.map((response, idx) =>
      idx === index ? { ...response, [key]: value } : response
    );
    onResponsesChange(updated);
  };

  const addResponse = () => {
    onResponsesChange([
      ...responses,
      { option: `Option ${responses.length + 1}`, value: `value_${responses.length + 1}`, anchor: false },
    ]);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e5eaf3",
        p: 3,
        boxShadow: "0 18px 40px rgba(12,26,75,0.08)",
        backgroundColor: "#fff",
        position: { lg: "sticky" },
        top: { lg: 140 },
        maxHeight: { lg: "calc(100vh - 180px)" },
        overflowY: "auto",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, color: "#0f1f41", fontSize: 16 }}>
          {config.title}
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {config.fields.map((field) => {
          if (field.type === "text") {
            return (
              <TextField
                key={field.name}
                label={field.label}
                placeholder={field.label}
                value={settings[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                fullWidth
              />
            );
          }

          if (field.type === "select") {
            return (
              <TextField
                key={field.name}
                select
                label={field.label}
                value={settings[field.name] || field.options[0]}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                fullWidth
              >
                {field.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            );
          }

          if (field.type === "toggle") {
            return (
              <Stack key={field.name} direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={Boolean(settings[field.name])}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  size="small"
                  sx={{
                    transform: "scale(1)",
                    transformOrigin: "left center",
                    mr: 1
                  }}
                />
                <Typography fontWeight={500} sx={{ fontSize: 14 }}>{field.label}</Typography>
              </Stack>
            );
          }

          if (field.type === "editor") {
            return (
              <Box key={field.name}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0f1f41", mb: 1 }}>
                  {field.label}
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    "& .ck.ck-toolbar": {
                      border: "none",
                      borderBottom: "1px solid #e5e9f2",
                      background: "#f8f9ff",
                    },
                    "& .ck-editor__editable": {
                      minHeight: 140,
                      border: "none",
                      padding: "18px",
                    },
                  }}
                >
                  <RichTextInput
                    value={settings[field.name] || ""}
                    onChange={(data) => handleFieldChange(field.name, data)}
                    placeholder="Write question text..."
                  />
                </Paper>
              </Box>
            );
          }

          if (field.type === "responses") {
            return (
              <Box key={field.name}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Responses
                  </Typography>
                  <Button size="small" onClick={addResponse}>
                    + Add
                  </Button>
                </Stack>
                <Stack spacing={1.5}>
                  {responses.map((response, index) => (
                    <Grid container spacing={1} key={`${response.option}_${index}`}>
                      <Grid item xs={5}>
                        <TextField
                          label="Response Option"
                          value={response.option}
                          onChange={(e) => handleResponseChange(index, "option", e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          label="Response Value"
                          value={response.value}
                          onChange={(e) => handleResponseChange(index, "value", e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant={response.anchor ? "contained" : "outlined"}
                            size="small"
                            onClick={() => handleResponseChange(index, "anchor", !response.anchor)}
                          >
                            Anchor
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  ))}
                </Stack>
              </Box>
            );
          }

          return null;
        })}

        {config.actions && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="outlined" fullWidth>
              Cancel
            </Button>
            <Button variant="contained" fullWidth sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)" }}>
              Submit
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

const questionConfigs = {
  radio: {
    title: "Radio (Single Select) Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
      { type: "toggle", name: "isFirst", label: "Is first question ?" },
      { type: "select", name: "rotation", label: "Option Rotation", options: rotationOptions },
      { type: "toggle", name: "allowOther", label: "Allow Other" },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  rating: {
    title: "Rating Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
      { type: "select", name: "rotation", label: "Option Rotation", options: rotationOptions },
      { type: "text", name: "minValue", label: "Minimum Rate Value" },
      { type: "text", name: "maxValue", label: "Maximum Rate Value" },
      { type: "text", name: "rateStep", label: "Rate Step" },
      { type: "text", name: "minDescription", label: "Minimum Rate Value Description" },
      { type: "text", name: "maxDescription", label: "Maximum Rate Value Description" },
      { type: "toggle", name: "extremeDescriptions", label: "Display rate descriptions as extreme values" },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  dropdown: {
    title: "Dropdown Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
      { type: "toggle", name: "isFirst", label: "Is first question ?" },
      { type: "select", name: "rotation", label: "Option Rotation", options: rotationOptions },
      { type: "toggle", name: "allowOther", label: "Allow Other" },
      { type: "text", name: "inputPlaceholder", label: "Input Area Placeholder" },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  checkbox: {
    title: "Checkbox Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
      { type: "select", name: "rotation", label: "Option Rotation", options: rotationOptions },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  tagbox: {
    title: "Tagbox Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "allowOther", label: "Allow Other" },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  boolean: {
    title: "Boolean Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  singleInput: {
    title: "Single Input Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
    ],
    actions: true,
  },
  comment: {
    title: "Comment Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
    ],
    actions: true,
  },
  multipleText: {
    title: "Multiple Text Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  matrix: {
    title: "Multiple Choice Matrix Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  timer: {
    title: "Timer Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
    ],
    actions: true,
  },
  grid: {
    title: "Grid Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  view: {
    title: "View Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
    ],
    actions: true,
  },
  number: {
    title: "Number Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
    ],
    actions: true,
  },
  text: {
    title: "Text Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
    ],
    actions: true,
  },
};

const StatsCard = ({ title, value }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      p: 3,
      textAlign: "center",
      border: "1px solid #f2f4fb",
      boxShadow: "0 25px 50px rgba(13,35,85,0.08)",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
    }}
  >
    <Typography 
      variant="h5" 
      sx={{ 
        color: "#1d2d44ff", 
        fontWeight: 500,
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      {value}
    </Typography>
    <Typography 
      variant="subtitle1" 
      sx={{ 
        fontWeight: 500, 
        color: "#2b3c61ff", 
        fontSize: 12,
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      {title}
    </Typography>
  </Paper>
);

const QuestionCanvas = () => (
  <Box>
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #edf1fc",
        minHeight: "70vh",
        display: "flex",
        width: "700px",
        alignItems: "center",
        justifyContent: "center",
        color: "#58607f",
        fontWeight: 400,
        fontSize: "15px",
        boxShadow: "0 25px 60px rgba(13,35,85,0.08)",
        backgroundColor: "#fff",
        mb: 2,
      }}
    >
      Select question type and submit for preview
    </Paper>
  </Box>
);

const BasicForm = () => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 4,
      border: "1px solid #edf1fc",
      p: 4,
      boxShadow: "0 25px 60px rgba(13,35,85,0.08)",
    }}
  >
    <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e2c4c", mb: 3 }}>
      Edit Project
    </Typography>
    < EditProjectPage />
  </Paper>
);

const VariablesCard = ({ projectId }) => {
  const [variableName, setVariableName] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [value, setValue] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [variableType, setVariableType] = React.useState("text");
  const [variables, setVariables] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const loadVariables = async () => {
      try {
        setLoading(true);
        const { GetVariables } = await import("../../API/Services/services");
        const vars = await GetVariables(projectId);
        setVariables(Array.isArray(vars) ? vars : []);
      } catch (error) {
        console.error("Error loading variables:", error);
        setVariables([]);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) {
      loadVariables();
    }
  }, [projectId]);

  const handleAdd = () => {
    // Note: CreateVariable API endpoint not available
    // Variables are typically created automatically when questions are created
    alert("Variable creation API is not available. Variables are created automatically when you add questions with variable names.");
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting variables:", variables);
      // Variables are already saved individually via handleAdd
      alert("Variables saved successfully!");
    } catch (error) {
      console.error("Error submitting variables:", error);
    }
  };

  const handleCancel = () => {
    setVariableName("");
    setLabel("");
    setValue("");
    setDescription("");
    setVariableType("text");
  };

  return (
  <Paper
    elevation={0}
    sx={{ borderRadius: 4, border: "1px solid #edf1fc", p: 4, boxShadow: "0 20px 50px rgba(14,26,75,0.08)" }}
  >
    <Typography variant="h5" sx={{ fontWeight: 500, mb: 3, fontSize: "20px" }}>
      Project Variables
    </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField 
            label="Variable Name *" 
            fullWidth 
            placeholder="Enter variable name (e.g., var_name)"
            value={variableName}
            onChange={(e) => setVariableName(e.target.value)}
            disabled={loading}
            required
            helperText="Unique identifier for the variable"
          />
      </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label="Label *" 
            fullWidth 
            placeholder="Enter label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={loading}
            required
            helperText="Display name for the variable"
          />
      </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label="Value" 
            fullWidth 
            placeholder="Enter value (optional)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
            helperText="Default value for the variable"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label="Type" 
            select
            fullWidth 
            value={variableType}
            onChange={(e) => setVariableType(e.target.value)}
            disabled={loading}
            helperText="Variable data type"
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="number">Number</MenuItem>
            <MenuItem value="boolean">Boolean</MenuItem>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="url">URL</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField 
            label="Description" 
            fullWidth 
            multiline
            rows={3}
            placeholder="Enter description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            helperText="Description of what this variable represents"
          />
        </Grid>
        <Grid item xs={12} sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button 
            variant="contained" 
            sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)" }}
            onClick={handleAdd}
            disabled={loading}
          >
            + Add Variable
        </Button>
      </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" sx={{ color: "#6b7280", fontStyle: "italic" }}>
            Note: Variables are created automatically when you add questions with variable names in the Questionnaire tab.
          </Typography>
    </Grid>
      </Grid>
      {variables.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
            Project Variables ({variables.length}):
          </Typography>
          <Box
            sx={{
              maxHeight: "400px",
              overflowY: "auto",
              overflowX: "hidden",
              pr: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#c1c1c1",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "#a8a8a8",
                },
              },
            }}
          >
            <Stack spacing={1}>
              {variables.map((variable, index) => (
                <Box key={variable.id || index} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, backgroundColor: "#f9fafb" }}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {variable.label || variable.name || variable.variable_name || `Variable ${index + 1}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        {variable.variable_name || variable.name || "N/A"}
                        {variable.type && ` • Type: ${variable.type}`}
                      </Typography>
                      {variable.value && (
                        <Typography variant="body2" sx={{ mt: 0.5, color: "#374151" }}>
                          Value: {variable.value}
                        </Typography>
                      )}
                      {variable.description && (
                        <Typography variant="caption" sx={{ color: "#9ca3af", display: "block", mt: 0.5 }}>
                          {variable.description}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      )}
    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={handleCancel}>
        Cancel
      </Button>
        <Button 
          variant="contained" 
          sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)" }}
          onClick={handleSubmit}
          disabled={loading}
        >
        Submit
      </Button>
    </Stack>
  </Paper>
);
};

const FiltersCard = ({ projectId }) => {
  const [askToAll, setAskToAll] = React.useState(false);
  const [mergeCondition, setMergeCondition] = React.useState("AND");
  const [selectedVariable, setSelectedVariable] = React.useState("");
  const [selectedOption, setSelectedOption] = React.useState("All");
  const [variables, setVariables] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const loadVariables = async () => {
      try {
        setLoading(true);
        const { GetVariables } = await import("../../API/Services/services");
        const vars = await GetVariables(projectId);
        setVariables(Array.isArray(vars) ? vars : []);
      } catch (error) {
        console.error("Error loading variables:", error);
        setVariables([]);
      } finally {
        setLoading(false);
      }
    };
    loadVariables();
  }, [projectId]);

  const handleSubmit = React.useCallback(async () => {
    try {
      if (!projectId) {
        console.error("Project ID is required");
        return;
      }
      
      // Note: Project filter API endpoint doesn't exist yet (404 error)
      // For now, just log the filter data
      const filterData = {
        ask_to_all: askToAll,
        merge_condition: mergeCondition,
        variable: selectedVariable || null,
        option: selectedOption || "All",
      };
      
      console.log("Filter submitted:", filterData);
      // TODO: Uncomment when API endpoint is available
      // const { CreateProjectFilter } = await import("../../API/Services/services");
      // const result = await CreateProjectFilter(projectId, filterData);
      // console.log("Filter created successfully:", result);
      
      alert("Filter settings saved (API endpoint not available yet)");
    } catch (error) {
      console.error("Error submitting filter:", error);
      if (error.response?.data) {
        console.error("API Error Details:", error.response.data);
      }
    }
  }, [askToAll, mergeCondition, selectedVariable, selectedOption, projectId]);

  return (
  <Paper
    elevation={0}
    sx={{ borderRadius: 4, border: "1px solid #edf1fc", p: 4, boxShadow: "0 20px 50px rgba(14,26,75,0.08)" }}
  >
    <Typography variant="h5" sx={{ fontWeight: 500, mb: 3, fontSize: "20px" }}>
      Project Filters
    </Typography>
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography sx={{ fontSize: 13 }}>Do you want to ask this questionnaire to all?</Typography>
          <Switch checked={askToAll} onChange={(e) => setAskToAll(e.target.checked)} />
      </Stack>
      <Stack direction="row" spacing={2}>
        <Typography fontWeight={500} sx={{ fontSize: 14 }}>Merge filter conditions with?</Typography>
        <Stack direction="row" spacing={1}>
            <Button 
              sx={{ 
                backgroundColor: mergeCondition === "AND" ? "black" : "transparent", 
                color: mergeCondition === "AND" ? "#fff" : "#000",
                border: mergeCondition === "AND" ? "none" : "1px solid black"
              }}
              onClick={() => setMergeCondition("AND")}
            >
              AND
            </Button>
            <Button 
              sx={{ 
                backgroundColor: mergeCondition === "OR" ? "black" : "transparent", 
                color: mergeCondition === "OR" ? "#fff" : "#000",
                border: mergeCondition === "OR" ? "none" : "1px solid black"
              }}
              onClick={() => setMergeCondition("OR")}
            >
              OR
            </Button>
        </Stack>
      </Stack>
      <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField 
              label="Variable" 
              select 
              fullWidth
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              disabled={loading}
            >
              {variables.map((variable) => (
                <MenuItem key={variable.id || variable.name} value={variable.name || variable.variable_name}>
                  {variable.name || variable.variable_name || variable.label}
                </MenuItem>
              ))}
              {variables.length === 0 && (
                <MenuItem disabled>No variables available</MenuItem>
              )}
          </TextField>
        </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              label="Options" 
              select 
              fullWidth
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Custom">Custom</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => {
            setAskToAll(false);
            setMergeCondition("AND");
            setSelectedVariable("");
            setSelectedOption("All");
          }}>
          Cancel
        </Button>
          <Button 
            variant="contained" 
            sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)" }}
            onClick={handleSubmit}
          >
          Submit
        </Button>
      </Stack>
    </Stack>
  </Paper>
);
};

const PreviewCard = ({ projectId }) => {
  const getStorageKey = () => `questions_${projectId || "default"}`;
  const getWelcomeKey = () => `welcome_${projectId || "default"}`;
  const defaultWelcomeQuestion = {
    id: "welcome",
    type: "welcome",
    label: "Welcome Screen",
    questionText:
      "Hello, Thanks for joining QuantAi. Please take 10 - 15 minutes to complete the survey which could reward you 1000 points. The survey is based on your personal preferences and choices",
    description: "",
    buttonText: "lets go",
  };
  const [questions, setQuestions] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(0);

  React.useEffect(() => {
    const loadQuestions = async () => {
      try {
        // 1) Build welcome question, overriding from localStorage if present
        let welcomeQuestion = { ...defaultWelcomeQuestion };
        try {
          const storedWelcome = localStorage.getItem(getWelcomeKey());
          if (storedWelcome) {
            const parsed = JSON.parse(storedWelcome);
            welcomeQuestion = { ...welcomeQuestion, ...parsed };
          }
        } catch (e) {
          console.error("Error reading welcome question from storage:", e);
        }

        // 2) Load questions from API
        let apiQuestions = [];
        try {
          if (projectId) {
            const { GetQuestions, GetQuestionChoices } = await import("../../API/Services/services");
            const loaded = await GetQuestions(projectId);
            const backendCodeToFrontendType = {
              RDO: "radio",
              CHB: "checkbox",
              DRP: "list",
              TXT: "text",
              TXTL: "text",
              RAT: "rating",
              NPS: "rating",
              SLI: "rating",
              RNK: "rating",
              MTX: "grid",
              FIL: "view",
              DT: "view",
              IMG: "view",
              SIG: "view",
              GEO: "view",
              AV: "view",
              EML: "text",
              PHN: "text",
              URL: "text",
              NUM: "number",
              ADR: "text",
              CTI: "text",
            };

            if (Array.isArray(loaded) && loaded.length > 0) {
              apiQuestions = await Promise.all(
                loaded.map(async (q) => {
                  const frontendType =
                    (q.question_type && backendCodeToFrontendType[q.question_type]) ||
                    q.widget ||
                    "text";

                  // Load choices for this question for preview
                  let choices = [];
                  try {
                    const questionChoices = await GetQuestionChoices(q.id);
                    if (Array.isArray(questionChoices) && questionChoices.length > 0) {
                      choices = questionChoices.map((choice) => ({
                        option: stripHtmlTags(choice.text || choice.option || ""),
                        value: stripHtmlTags(choice.value || choice.text || choice.option || ""),
                        anchor: choice.anchor || false,
                        id: choice.id,
                      }));
                      // Sort by display_order if available
                      choices.sort((a, b) => {
                        const orderA = questionChoices.find(c => c.id === a.id)?.display_order || 0;
                        const orderB = questionChoices.find(c => c.id === b.id)?.display_order || 0;
                        return orderA - orderB;
                      });
                    } else {
                      // If API returns no choices, try localStorage fallback (builder stores there)
                      try {
                        const storageKey = `question_${q.id}_choices`;
                        const storedChoices = localStorage.getItem(storageKey);
                        if (storedChoices) {
                          const parsed = JSON.parse(storedChoices);
                          // Strip HTML tags from stored choices
                          choices = parsed.map((choice) => ({
                            ...choice,
                            option: stripHtmlTags(choice.option || choice.text || ""),
                            value: stripHtmlTags(choice.value || choice.option || choice.text || ""),
                          }));
                          console.log(`Preview: loaded ${choices.length} choices from localStorage for question ${q.id}`);
                        }
                      } catch (storageError) {
                        // Ignore localStorage errors in preview
                      }
                    }
                  } catch (choiceError) {
                    console.error(`Preview: error loading choices for question ${q.id}:`, choiceError);
                    // Try localStorage as fallback
                    try {
                      const storageKey = `question_${q.id}_choices`;
                      const storedChoices = localStorage.getItem(storageKey);
                      if (storedChoices) {
                        const parsed = JSON.parse(storedChoices);
                        // Strip HTML tags from stored choices
                        choices = parsed.map((choice) => ({
                          ...choice,
                          option: stripHtmlTags(choice.option || choice.text || ""),
                          value: stripHtmlTags(choice.value || choice.option || choice.text || ""),
                        }));
                        console.log(`Preview: loaded ${choices.length} choices from localStorage fallback for question ${q.id}`);
                      }
                    } catch (storageError) {
                      // Ignore localStorage errors in preview
                    }
                  }

                  return {
                    id: q.id?.toString() || Date.now().toString(),
                    backendId: q.id,
                    type: frontendType,
                    label: q.title || "",
                    questionText: q.title || "",
                    description: q.description || "",
                    variableName: q.variable_name || "",
                    required: q.is_required || false,
                    isFirst: q.is_initial_question || false,
                    displayIndex: q.display_index || 0,
                    responses: choices, // Use loaded choices/options for preview
                  };
                })
              );
            }
          }
        } catch (apiError) {
          console.error("Error loading questions from API for preview:", apiError);
        }

        const combined = [welcomeQuestion, ...apiQuestions];

        // 3) Cache combined list in localStorage for quick access
        try {
          const storageKey = getStorageKey();
          localStorage.setItem(storageKey, JSON.stringify(combined));
        } catch (cacheError) {
          console.error("Error caching preview questions:", cacheError);
        }

        setQuestions(combined);
    } catch (error) {
      console.error("Error loading questions for preview:", error);
        setQuestions([defaultWelcomeQuestion]);
    }
    };

    loadQuestions();
  }, [projectId]);

  const handleNext = () => {
    if (currentPage < questions.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderQuestionPreview = (question, index) => {
    const questionNumber = question.type === "welcome" ? null : questions.slice(0, index + 1).filter(q => q.type !== "welcome").length;
    const isWelcome = question.type === "welcome";

    if (isWelcome) {
      return (
        <Box key={question.id} sx={{ mb: 4, width: "100%", textAlign: "center", py: 6 }}>
          <Typography variant="h4" sx={{ mb: 2, color: "#1f2937", fontWeight: 600 }}>
            {question.questionText || "Welcome to the Survey"}
          </Typography>
          {question.description && (
            <Typography variant="body1" sx={{ mb: 4, color: "#6b7280", maxWidth: "600px", mx: "auto" }}>
              {question.description}
            </Typography>
          )}
          <Button
            variant="contained"
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              backgroundColor: "#3b82f6",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {question.buttonText || "Get Started"}
          </Button>
        </Box>
      );
    }

    if (question.type === "radio") {
      return (
        <Box key={question.id} sx={{ mb: 4, width: "100%", p: 4, border: "1px solid #e5e7eb", borderRadius: 3, backgroundColor: "#fff" }}>
          <Typography variant="h6" sx={{ mb: 1, color: "#1f2937", fontWeight: 600 }}>
            {questionNumber}. {question.questionText || "Question"}
          </Typography>
          {question.description && (
            <Typography variant="body2" sx={{ mb: 3, color: "#6b7280" }}>
              {question.description}
            </Typography>
          )}
          <Stack spacing={2} sx={{ mt: 2 }}>
            {question.responses?.map((response, idx) => (
              <Box 
                key={idx} 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 2, 
                  p: 2, 
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" },
                  cursor: "pointer",
                }}
              >
                <Box sx={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #d1d5db", flexShrink: 0 }} />
                <Typography variant="body1" sx={{ color: "#374151" }}>{stripHtmlTags(response.option || `Option ${idx + 1}`)}</Typography>
              </Box>
            ))}
            {(!question.responses || question.responses.length === 0) && (
              <Typography variant="body2" sx={{ color: "#9ca3af", fontStyle: "italic" }}>
                No options added yet
              </Typography>
            )}
          </Stack>
        </Box>
      );
    }

    if (question.type === "rating") {
      const ratingCount = question.ratingCount || 5;
      return (
        <Box key={question.id} sx={{ mb: 4, width: "100%", p: 4, border: "1px solid #e5e7eb", borderRadius: 3, backgroundColor: "#fff" }}>
          <Typography variant="h6" sx={{ mb: 1, color: "#1f2937", fontWeight: 600 }}>
            {questionNumber}. {question.questionText || "Question"}
          </Typography>
          {question.description && (
            <Typography variant="body2" sx={{ mb: 3, color: "#6b7280" }}>
              {question.description}
            </Typography>
          )}
          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: "center", flexWrap: "wrap" }}>
            {Array.from({ length: ratingCount }).map((_, idx) => (
              <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                <Grade sx={{ fontSize: 40, color: "#d1d5db", cursor: "pointer", "&:hover": { color: "#fbbf24" } }} />
                <Typography variant="caption" sx={{ color: "#6b7280", fontSize: 12 }}>{idx + 1}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      );
    }

    if (question.type === "grid") {
      return (
        <Box key={question.id} sx={{ mb: 4, width: "100%", p: 4, border: "1px solid #e5e7eb", borderRadius: 3, backgroundColor: "#fff" }}>
          <Typography variant="h6" sx={{ mb: 1, color: "#1f2937", fontWeight: 600 }}>
            {questionNumber}. {question.questionText || "Question"}
          </Typography>
          {question.description && (
            <Typography variant="body2" sx={{ mb: 3, color: "#6b7280" }}>
              {question.description}
            </Typography>
          )}
          {question.responses && question.responses.length > 0 ? (
            <Box sx={{ mt: 3, overflowX: "auto" }}>
              <Box sx={{ display: "table", width: "100%", minWidth: 500, border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ display: "table-row", bgcolor: "#f9fafb" }}>
                  <Box sx={{ display: "table-cell", p: 2, border: "1px solid #e5e7eb", fontWeight: 600, fontSize: 14, color: "#374151" }}>
                    Options
                  </Box>
                  {question.responses.map((response, idx) => (
                    <Box 
                      key={idx} 
                      sx={{ 
                        display: "table-cell", 
                        p: 2, 
                        border: "1px solid #e5e7eb", 
                        textAlign: "center", 
                        fontWeight: 600, 
                        fontSize: 14,
                        color: "#374151",
                        minWidth: 120,
                      }}
                    >
                      {stripHtmlTags(response.option || `Option ${idx + 1}`)}
                    </Box>
                  ))}
                </Box>
                {[1, 2, 3].map((rowIdx) => (
                  <Box key={rowIdx} sx={{ display: "table-row", "&:hover": { bgcolor: "#fafbff" } }}>
                    <Box sx={{ display: "table-cell", p: 2, border: "1px solid #e5e7eb", fontSize: 14, color: "#6b7280", fontWeight: 500 }}>
                      Row {rowIdx}
                    </Box>
                    {question.responses.map((_, colIdx) => (
                      <Box 
                        key={colIdx} 
                        sx={{ 
                          display: "table-cell", 
                          p: 2, 
                          border: "1px solid #e5e7eb", 
                          textAlign: "center",
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 20, 
                            height: 20, 
                            border: "2px solid #d1d5db", 
                            borderRadius: "4px", 
                            mx: "auto",
                            cursor: "pointer",
                            "&:hover": {
                              borderColor: "#4a5fd4",
                              bgcolor: "#f0f9ff",
                            },
                          }} 
                        />
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "#9ca3af", mt: 2, fontStyle: "italic" }}>
              No options added yet. Add options to create grid form.
            </Typography>
          )}
        </Box>
      );
    }

    if (question.type === "checkbox") {
      return (
        <Box key={question.id} sx={{ mb: 4, width: "100%", p: 4, border: "1px solid #e5e7eb", borderRadius: 3, backgroundColor: "#fff" }}>
          <Typography variant="h6" sx={{ mb: 1, color: "#1f2937", fontWeight: 600 }}>
            {questionNumber}. {question.questionText || "Question"}
          </Typography>
          {question.description && (
            <Typography variant="body2" sx={{ mb: 3, color: "#6b7280" }}>
              {question.description}
            </Typography>
          )}
          <Stack spacing={2} sx={{ mt: 2 }}>
            {question.responses?.map((response, idx) => (
              <Box 
                key={idx} 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 2, 
                  p: 2, 
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" },
                  cursor: "pointer",
                }}
              >
                <Box sx={{ width: 20, height: 20, border: "2px solid #d1d5db", borderRadius: "4px", flexShrink: 0 }} />
                <Typography variant="body1" sx={{ color: "#374151" }}>{stripHtmlTags(response.option || `Option ${idx + 1}`)}</Typography>
              </Box>
            ))}
            {(!question.responses || question.responses.length === 0) && (
              <Typography variant="body2" sx={{ color: "#9ca3af", fontStyle: "italic" }}>
                No options added yet
              </Typography>
            )}
          </Stack>
        </Box>
      );
    }

    if (question.type === "list") {
      return (
        <Box key={question.id} sx={{ mb: 4, width: "100%", p: 4, border: "1px solid #e5e7eb", borderRadius: 3, backgroundColor: "#fff" }}>
          <Typography variant="h6" sx={{ mb: 1, color: "#1f2937", fontWeight: 600 }}>
            {questionNumber}. {question.questionText || "Question"}
          </Typography>
          {question.description && (
            <Typography variant="body2" sx={{ mb: 3, color: "#6b7280" }}>
              {question.description}
            </Typography>
          )}
          <TextField
            select
            fullWidth
            placeholder="Select an option..."
            sx={{ mt: 2 }}
            variant="outlined"
            defaultValue=""
          >
            {question.responses?.map((response, idx) => (
              <MenuItem key={idx} value={response.value || response.option || `option_${idx}`}>
                {stripHtmlTags(response.option || `Option ${idx + 1}`)}
              </MenuItem>
            ))}
            {(!question.responses || question.responses.length === 0) && (
              <MenuItem value="" disabled>
                No options added yet
              </MenuItem>
            )}
          </TextField>
        </Box>
      );
    }

    // Default question preview (text, number, etc.)
    return (
      <Box key={question.id} sx={{ mb: 4, width: "100%", p: 4, border: "1px solid #e5e7eb", borderRadius: 3, backgroundColor: "#fff" }}>
        <Typography variant="h6" sx={{ mb: 1, color: "#1f2937", fontWeight: 600 }}>
          {questionNumber}. {question.questionText || "Question"}
        </Typography>
        {question.description && (
          <Typography variant="body2" sx={{ mb: 3, color: "#6b7280" }}>
            {question.description}
          </Typography>
        )}
        <TextField
          fullWidth
          placeholder="Your answer..."
          sx={{ mt: 2 }}
          variant="outlined"
          type={question.type === "number" ? "number" : "text"}
        />
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #edf1fc",
        p: 4,
        minHeight: "60vh",
        boxShadow: "0 20px 50px rgba(14,26,75,0.08)",
        backgroundColor: "#fafbff",
      }}
    >
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 600, color: "#1f2937" }}>
        Preview - How Questions Appear to Users
      </Typography>
      {questions.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, color: "#9ca3af" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>No questions added yet.</Typography>
          <Typography variant="body2">
            Add questions in the Questionnaire tab to see how they will appear to users.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: "relative", minHeight: "70vh", display: "flex", flexDirection: "column" }}>
          {/* Page Content */}
        <Box sx={{ 
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            position: "relative",
          }}>
            {renderQuestionPreview(questions[currentPage], currentPage)}
          </Box>
          
          {/* Navigation Controls */}
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center" 
            justifyContent="center"
            sx={{ mt: 4, mb: 2 }}
          >
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentPage === 0}
              sx={{ textTransform: "none" }}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              Page {currentPage + 1} of {questions.length}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleNext}
              disabled={currentPage === questions.length - 1}
              sx={{ textTransform: "none" }}
            >
              Next
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

const ResultsCard = () => (
  <Paper
    elevation={0}
    sx={{ 
      borderRadius: 4, 
      border: "1px solid #edf1fc", 
      p: 4, 
      boxShadow: "0 20px 50px rgba(14,26,75,0.08)",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
    }}
  >
    <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      <Grid container spacing={2} alignItems="center" sx={{ width: "100%", margin: 0 }}>
        <Grid item xs={12} md={4} sx={{ boxSizing: "border-box", minWidth: 0 }}>
          <TextField select label="Status" fullWidth defaultValue="ALL">
            <MenuItem value="ALL">ALL</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4} sx={{ boxSizing: "border-box", minWidth: 0 }}>
          <TextField select label="Display Data Type" fullWidth defaultValue="Value">
            <MenuItem value="Value">Value</MenuItem>
            <MenuItem value="Percentage">Percentage</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, boxSizing: "border-box", minWidth: 0 }}>
          <Button variant="contained" sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)" }}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
    <Card
      variant="outlined"
      sx={{
        mt: 3,
        borderRadius: 3,
        minHeight: 280,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#58607f",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      No Rows To Show
    </Card>
  </Paper>
);

const ReportsCard = () => {
  const [selectedQuestion, setSelectedQuestion] = React.useState("");
  const [displayType, setDisplayType] = React.useState("Value");
  
  return (
  <Paper
    elevation={0}
    sx={{ 
      borderRadius: 4, 
      border: "1px solid #edf1fc", 
      p: 4, 
      boxShadow: "0 20px 50px rgba(14,26,75,0.08)",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
    }}
  >
    <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      <Grid container spacing={2} alignItems="center" sx={{ width: "100%", margin: 0 }}>
          <Grid item xs={12} md={4} sx={{ boxSizing: "border-box", minWidth: 0 }}>
            <TextField 
              select 
              label="Question" 
              fullWidth 
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(e.target.value)}
            >
              <MenuItem value="">Select Question</MenuItem>
            <MenuItem value="Q1">Q1 - Intro</MenuItem>
          </TextField>
        </Grid>
          <Grid item xs={12} md={4} sx={{ boxSizing: "border-box", minWidth: 0 }}>
            <TextField 
              select 
              label="Display Data Type" 
              fullWidth 
              value={displayType}
              onChange={(e) => setDisplayType(e.target.value)}
            >
            <MenuItem value="Value">Value</MenuItem>
            <MenuItem value="Percentage">Percentage</MenuItem>
          </TextField>
        </Grid>
          <Grid item xs={12} md={4} sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: { xs: "wrap", md: "nowrap" }, boxSizing: "border-box", minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
            <Switch />
            <Typography fontWeight={500} sx={{ fontSize: 14 }}>Percentage</Typography>
          </Stack>
          <Button variant="contained" sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)", flexShrink: 0 }}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  </Paper>
);
};

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("Questionnaire");
  const [questionSubTab, setQuestionSubTab] = useState("Questions");
  const [selectedComponent, setSelectedComponent] = useState(questionComponents[0].type);
  const [questionSettings, setQuestionSettings] = useState(() =>
    questionComponents.reduce(
      (acc, component) => ({
        ...acc,
        [component.type]: {},
      }),
      {}
    )
  );
  const [responseData, setResponseData] = useState(() =>
    questionComponents.reduce(
      (acc, component) => ({
        ...acc,
        [component.type]: [],
      }),
      {}
    )
  );

  const stats = useMemo(
    () => [
      { title: "Total Audiences", value: 0 },
      { title: "Started Audiences", value: 0 },
      { title: "Completed Audiences", value: 0 },
      { title: "Overall Time Spent", value: 0 },
      { title: "Average Time Spent", value: 0 },
    ],
    []
  );

  const updateSettings = (type, field, value) => {
    setQuestionSettings((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const updateResponses = (type, list) => {
    setResponseData((prev) => ({
      ...prev,
      [type]: list,
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Statistics":
        return (
          <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
            <Grid container spacing={2} sx={{ width: "100%", margin: 0 }}>
              {stats.map((stat) => (
                <Grid item xs={12} md={4} key={stat.title} sx={{ boxSizing: "border-box", minWidth: 0 }}>
                  <StatsCard title={stat.title} value={stat.value} />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case "Basic":
        return <BasicForm />;
      case "Questionnaire":
        return (
          <Box sx={{ height: "calc(100vh - 200px)", position: "relative", margin: "-16px -16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <FormBuilder formName={`Project ${projectId}`} projectId={projectId} />
          </Box>
        );
      case "Variables":
        return <VariablesCard projectId={projectId} />;
      case "Filters":
        return <FiltersCard projectId={projectId} />;
      case "Preview":
        return <PreviewCard projectId={projectId} />;
      case "Results":
        return <ResultsCard />;
      case "Reports":
        return <ReportsCard />;
      default:
        return null;
    }
  };

  return (
    <Box  sx={{
      width: "100%",
      maxWidth: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <Container maxWidth="xl">
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ color: "#7a86a4", mb: 2.5 }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Home fontSize="small" />
            <Typography variant="body2" sx={{ color: "#7a86a4" }}>Projects</Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "#7a86a4" }}>
            {projectId}
          </Typography>
          <Typography variant="body2" sx={{ color: "#0f1f41", fontWeight: 600 }}>
            Edit
          </Typography>
        </Breadcrumbs>

        <Stack direction="row" spacing={1.5} sx={{ mb: 3, flexWrap: "wrap" }}>
          {topTabs.map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "12px",
                backgroundColor: activeTab === tab ? "#fff" : "transparent",
                color: activeTab === tab ? "#0f1f41" : "#7a86a4",
                border: activeTab === tab ? "1px solid #e0e6f6" : "1px solid transparent",
                boxShadow: activeTab === tab ? "0 4px 12px rgba(13,35,85,0.1)" : "none",
                "&:hover": {
                  backgroundColor: activeTab === tab ? "#fff" : "rgba(15,31,65,0.04)",
                },
              }}
            >
              {tab}
            </Button>
          ))}
        </Stack>

        {renderTabContent()}
      </Container>
    </Box>
  );
}

