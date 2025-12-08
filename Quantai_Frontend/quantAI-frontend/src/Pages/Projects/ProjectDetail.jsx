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
    }}
  >
    <Typography variant="h5" sx={{ color: "#1d2d44ff", fontWeight: 500 }}>
      {value}
    </Typography>
    <Typography variant="subtitle1" sx={{ fontWeight: 500, color: "#2b3c61ff", fontSize: 12 }}>
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
    <Stack spacing={3}>
      <TextField label="Project Name" placeholder="Enter project name" fullWidth />
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          About The Project For Your Reference
        </Typography>
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <RichTextInput value="" onChange={() => { }} placeholder="Describe this project..." />
        </Paper>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField label="Project Code" fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField select label="Type Of Research" fullWidth defaultValue="Survey">
            <MenuItem value="Survey">Survey</MenuItem>
            <MenuItem value="Profiling">Profiling</MenuItem>
            <MenuItem value="Qualitative">Qualitative</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Stack>
  </Paper>
);

const VariablesCard = () => (
  <Paper
    elevation={0}
    sx={{ borderRadius: 4, border: "1px solid #edf1fc", p: 4, boxShadow: "0 20px 50px rgba(14,26,75,0.08)" }}
  >
    <Typography variant="h5" sx={{ fontWeight: 500, mb: 3, fontSize: "20px" }}>
      Project Variables
    </Typography>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={4}>
        <TextField label="Label" fullWidth placeholder="Enter label" />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField label="Value" fullWidth placeholder="Enter value" />
      </Grid>
      <Grid item xs={12} md={4} sx={{ display: "flex", gap: 1 }}>
        <Button variant="contained" sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)" }}>
          + Add
        </Button>
      </Grid>
    </Grid>
    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
      <Button variant="outlined">
        Cancel
      </Button>
      <Button variant="contained"  sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)" }}>
        Submit
      </Button>
    </Stack>
  </Paper>
);

const FiltersCard = () => (
  <Paper
    elevation={0}
    sx={{ borderRadius: 4, border: "1px solid #edf1fc", p: 4, boxShadow: "0 20px 50px rgba(14,26,75,0.08)" }}
  >
    <Typography variant="h5" sx={{ fontWeight: 500, mb: 3, fontSize: "20px" }}>
      Project Filters
    </Typography>
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography sx={{fontSize: 13}}>Do you want to ask this questionnaire to all?</Typography>
        <Switch />
      </Stack>
      <Stack direction="row" spacing={2}>
        <Typography fontWeight={500} sx={{fontSize: 14}}>Merge filter conditions with?</Typography>
        <Stack direction="row" spacing={1}>
          <Button sx={{backgroundColor: "black", color: "#fff"}}>AND</Button>
          <Button sx={{border: "1px solid black", color: "#000"}}>OR</Button>
        </Stack>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} sx={{width: "120px"}}>
          <TextField label="Variable" select fullWidth>
            <MenuItem value="Age">Age</MenuItem>
            <MenuItem value="Country">Country</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} sx={{width: "120px"}}>
          <TextField label="Options" select fullWidth>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Custom">Custom</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined">
          Cancel
        </Button>
        <Button variant="contained" sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)" }}>
          Submit
        </Button>
      </Stack>
    </Stack>
  </Paper>
);

const PreviewCard = () => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 4,
      border: "1px solid #edf1fc",
      p: 4,
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 20px 50px rgba(14,26,75,0.08)",
      fontWeight: 600,
      color: "#20314f",
    }}
  >
    testing
  </Paper>
);

const ResultsCard = () => (
  <Paper
    elevation={0}
    sx={{ borderRadius: 4, border: "1px solid #edf1fc", p: 4, boxShadow: "0 20px 50px rgba(14,26,75,0.08)" }}
  >
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={4}>
        <TextField select label="Status" fullWidth defaultValue="ALL">
          <MenuItem value="ALL">ALL</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField select label="Display Data Type" fullWidth defaultValue="Value">
          <MenuItem value="Value">Value</MenuItem>
          <MenuItem value="Percentage">Percentage</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)" }}>
          Submit
        </Button>
      </Grid>
    </Grid>
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
      }}
    >
      No Rows To Show
    </Card>
  </Paper>
);

const ReportsCard = () => (
  <Paper
    elevation={0}
    sx={{ borderRadius: 4, border: "1px solid #edf1fc", p: 4, boxShadow: "0 20px 50px rgba(14,26,75,0.08)" }}
  >
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={4} sx={{width: "120px"}}>
        <TextField select label="Question" fullWidth>
          <MenuItem value="Q1">Q1 - Intro</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} md={4} sx={{width: "200px"}}>
        <TextField select label="Display Data Type" fullWidth defaultValue="Value">
          <MenuItem value="Value">Value</MenuItem>
          <MenuItem value="Percentage">Percentage</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} md={4} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Switch />
          <Typography fontWeight={500} sx={{fontSize: 14}}>Percentage</Typography>
        </Stack>
        <Button variant="contained" sx={{ background: "linear-gradient(90deg,#1d65f1,#23c0ff)" }}>
          Submit
        </Button>
      </Grid>
    </Grid>
  </Paper>
);

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { projectId = "1100" } = useParams();
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
        [component.type]: [
          { option: "Item", value: "item_value", anchor: false },
          { option: "Item 2", value: "item_value_2", anchor: false },
        ],
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
          <Grid container spacing={2}>
            {stats.map((stat) => (
              <Grid item xs={12} md={4} key={stat.title}>
                <StatsCard title={stat.title} value={stat.value} />
              </Grid>
            ))}
          </Grid>
        );
      case "Basic":
        return <BasicForm />;
      case "Questionnaire":
        return (
          <Box sx={{ height: "calc(100vh - 200px)", position: "relative", margin: "-16px -16px", overflow: "hidden" }}>
            <FormBuilder formName={`Project ${projectId}`} />
          </Box>
        );
      case "Variables":
        return <VariablesCard />;
      case "Filters":
        return <FiltersCard />;
      case "Preview":
        return <PreviewCard />;
      case "Results":
        return <ResultsCard />;
      case "Reports":
        return <ReportsCard />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
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

