import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  Divider,
  MenuItem,
  InputAdornment,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  RadioButtonChecked,
  Grade,
  Star,
  StarBorder,
  AccessTime,
  CheckBox,
  GridOn,
  Visibility,
  Numbers,
  ShortText,
  Close,
  Share,
  Help,
  Search,
  PlayArrow,
  Send,
  Mic,
  MoreVert,
  Delete,
  DragIndicator,
  Add,
  ArrowForward,
  AccountTree,
  ZoomOut,
  ZoomIn,
  Fullscreen,
  RestartAlt,
  ArrowDownward,
  Menu,
  BarChart,
  Videocam,
  QuestionMark,
} from "@mui/icons-material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Question type configurations
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

const questionConfigs = {
  radio: {
    title: "Radio (Single Select) Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
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
      { type: "questionType", name: "questionType", label: "Question" },
      { type: "answerType", name: "answerType", label: "Answer" },
      { type: "toggle", name: "required", label: "Required" },
      { type: "ratingConfig", name: "ratingConfig", label: "Rating Configuration" },
      { type: "image", name: "image", label: "Image or video" },
      { type: "branching", name: "branching", label: "Branching" },
    ],
    actions: true,
  },
  timer: {
    title: "Timer Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "toggle", name: "required", label: "Required" },
    ],
    actions: true,
  },
  checkbox: {
    title: "Checkbox Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "toggle", name: "required", label: "Required" },
      { type: "select", name: "rotation", label: "Option Rotation", options: rotationOptions },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  grid: {
    title: "Grid Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "toggle", name: "required", label: "Required" },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
  view: {
    title: "View Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
    ],
    actions: true,
  },
  number: {
    title: "Number Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "toggle", name: "required", label: "Required" },
    ],
    actions: true,
  },
  text: {
    title: "Text Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "toggle", name: "required", label: "Required" },
    ],
    actions: true,
  },
};

// Inline Editable Component for Center Preview (Typeform-style)
const InlineEditable = ({ value, onChange, placeholder, questionNumber, isDescription = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef(null);
  const containerRef = useRef(null);
  const lastExternalValueRef = useRef(value || "");

  // Only update content when value changes externally (not during editing)
  useEffect(() => {
    if (editableRef.current && !isEditing) {
      const newValue = value || "";
      // Only update if value changed externally
      if (lastExternalValueRef.current !== newValue) {
        editableRef.current.textContent = newValue;
        lastExternalValueRef.current = newValue;
      }
    }
  }, [value, isEditing]);

  // Handle click outside to save - but exclude clicks on options/choices
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      
      // Check if click is outside the editable container
      if (!containerRef.current.contains(event.target)) {
        // Also check if we're clicking on question options/choices - don't close if so
        const isClickingOnOption = event.target.closest('[data-question-option]') || 
                                   event.target.closest('.MuiPaper-root') ||
                                   event.target.closest('button') ||
                                   event.target.closest('[role="button"]');
        
        // Don't close if clicking on options or other interactive elements
        if (!isClickingOnOption) {
          handleBlur();
        }
      }
    };

    // Add event listener after a short delay to avoid immediate trigger
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const text = editableRef.current?.textContent || "";
    if (onChange) {
      onChange(text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      editableRef.current?.blur();
    } else if (e.key === "Escape") {
      if (editableRef.current) {
        editableRef.current.textContent = value || "";
      }
      editableRef.current?.blur();
    }
  };

  const handleInput = () => {
    // Don't interfere - let browser handle cursor naturally
    // We'll save the value on blur
  };

  const isEmpty = !value || value.trim() === "";
  const displayText = value || "";

  if (isDescription) {
    return (
      <Box
        ref={containerRef}
        sx={{
          mb: 4,
          "&:hover .editable-text": {
            backgroundColor: "#f9fafb",
            borderRadius: 1,
            padding: "4px 8px",
            margin: "-4px -8px",
          },
        }}
      >
        <Box
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setIsEditing(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          className="editable-text"
          dir="ltr"
          sx={{
            color: isEmpty ? "#9ca3af" : "#9ca3af",
            fontSize: 13,
            fontStyle: "italic",
            cursor: "text",
            minHeight: 20,
            outline: "none",
            display: "inline-block",
            width: "100%",
            direction: "ltr",
            textAlign: "left",
            "&:empty:before": {
              content: `"${placeholder}"`,
              color: "#9ca3af",
            },
            "&:focus": {
              backgroundColor: "#f9fafb",
              borderRadius: 1,
              padding: "4px 8px",
              margin: "-4px -8px",
            },
          }}
          suppressHydrationWarning
        >
          {/* Content is controlled by contentEditable, React doesn't manage it */}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        mb: 1,
        display: "inline",
        "&:hover .editable-text": {
          backgroundColor: "#f9fafb",
          borderRadius: 1,
          padding: "4px 8px",
          margin: "-4px -8px",
        },
      }}
    >
      <Box
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className="editable-text"
        dir="ltr"
        sx={{
          fontSize: 18,
          fontWeight: 500,
          fontStyle: isEmpty ? "italic" : "normal",
          color: isEmpty ? "#9ca3af" : "#374151",
          cursor: "text",
          minHeight: 28,
          display: "inline",
          outline: "none",
          direction: "ltr",
          textAlign: "left",
          "&:empty:before": {
            content: `"${placeholder}"`,
            color: "#9ca3af",
            fontStyle: "italic",
          },
          "&:focus": {
            backgroundColor: "#f9fafb",
            borderRadius: 1,
            padding: "4px 8px",
            margin: "-4px -8px",
          },
        }}
        dangerouslySetInnerHTML={!isEditing ? { __html: displayText || "" } : undefined}
      >
    
      </Box>
    </Box>
  );
};

const RichTextInput = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const lastValueRef = useRef(value || "");

  const handleEditorReady = useCallback((editor) => {
    editorRef.current = editor;
    lastValueRef.current = editor.getData();
  }, []);

  const handleEditorChange = useCallback(
    (event, editor) => {
      const data = editor.getData();
      lastValueRef.current = data;
      onChange(data);
    },
    [onChange]
  );

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editorRef.current) {
      const currentData = editorRef.current.getData();
      const newValue = value || "";
      // Only update if the value changed externally (not from user input)
      if (currentData !== newValue && lastValueRef.current === currentData) {
        editorRef.current.setData(newValue);
        lastValueRef.current = newValue;
      }
    }
  }, [value]);

  return (
  <CKEditor
    editor={ClassicEditor}
    data={value || ""}
      onReady={handleEditorReady}
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
      onChange={handleEditorChange}
  />
);
};

// Welcome Screen Component
const WelcomeScreen = ({ question, onUpdate }) => {
  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        p: 4,
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          mb: 4,
        }}
        dangerouslySetInnerHTML={{
          __html: question?.questionText || "Hello, Thanks for joining QuantAi. Please take 10 - 15 minutes to complete the survey which could reward you 1000 points. The survey is based on your personal preferences and choices",
        }}
      />
      <Typography variant="body2" sx={{ color: "#9ca3af", mb: 3 }}>
        Description (optional)
      </Typography>
      <Button
        variant="contained"
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 2,
          textTransform: "none",
          backgroundColor: "#3b82f6",
          mb: 1,
        }}
      >
        {question?.buttonText || "lets go"}
      </Button>
      <Typography variant="caption" sx={{ color: "#9ca3af", mb: 2 }}>
        press Enter
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "#9ca3af" }}>
        <AccessTime fontSize="small" />
        <Typography variant="caption">Takes X minutes</Typography>
      </Stack>
    </Box>
  );
};

// Question Settings Panel Component
const QuestionSettingsPanel = ({ question, config, onUpdate }) => {
  if (!config || !question) return null;

  const handleFieldChange = (name, value) => {
    onUpdate({ ...question, [name]: value });
  };

  const handleResponseChange = (index, key, value) => {
    const responses = question.responses || [];
    const updated = responses.map((response, idx) =>
      idx === index ? { ...response, [key]: value } : response
    );
    onUpdate({ ...question, responses: updated });
  };

  const addResponse = () => {
    const responses = question.responses || [];
    onUpdate({
      ...question,
      responses: [
        ...responses,
        { option: `Option ${responses.length + 1}`, value: `value_${responses.length + 1}`, anchor: false },
      ],
    });
  };

  const deleteResponse = (index) => {
    const responses = question.responses || [];
    const updated = responses.filter((_, idx) => idx !== index);
    onUpdate({ ...question, responses: updated });
  };

  const getQuestionIcon = () => {
    if (question.type === "welcome") return <PlayArrow sx={{ fontSize: 20 }} />;
    const component = questionComponents.find((c) => c.type === question.type);
    return component?.icon || <ShortText />;
  };

  const getQuestionLabel = () => {
    if (question.type === "welcome") return "Welcome Screen";
    const component = questionComponents.find((c) => c.type === question.type);
    return component?.label || question.type;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        p: 3,
        backgroundColor: "#fff",
        maxHeight: "calc(100vh - 200px)",
        overflowY: "auto",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Box sx={{ color: "#3b82f6" }}>{getQuestionIcon()}</Box>
        <TextField
          select
          value={question.type}
          size="small"
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#f9fafb",
            },
          }}
        >
          <MenuItem value={question.type}>{getQuestionLabel()}</MenuItem>
        </TextField>
      </Stack>
      <Stack spacing={2}>
        {config.fields.map((field) => {
          if (field.type === "text") {
            const value = question[field.name] || "";
            const maxLength = field.name === "buttonText" ? 24 : undefined;
            return (
              <TextField
                key={field.name}
                label={field.label}
                value={value}
                onChange={(e) => {
                  const newValue = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
                  handleFieldChange(field.name, newValue);
                }}
                fullWidth
                size="small"
                inputProps={{ maxLength }}
                InputProps={{
                  endAdornment: field.name === "buttonText" && (
                    <InputAdornment position="end">
                      <Typography variant="caption" sx={{ color: "#9ca3af", fontSize: 12 }}>
                        {value.length}/{maxLength}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            );
          }

          if (field.type === "select") {
            return (
              <TextField
                key={field.name}
                select
                label={field.label}
                value={question[field.name] || field.options[0]}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                fullWidth
                size="small"
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
              <Stack key={field.name} direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontSize: 14 }}>
                  {field.label}
                </Typography>
                <Switch
                  checked={Boolean(question[field.name])}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  size="small"
                />
              </Stack>
            );
          }

          if (field.type === "editor") {
            return (
              <Box key={field.name}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                  {field.label}
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    "& .ck.ck-toolbar": {
                      border: "none",
                      borderBottom: "1px solid #e5e7eb",
                      background: "#f9fafb",
                    },
                    "& .ck-editor__editable": {
                      minHeight: 120,
                      border: "none",
                      padding: "16px",
                    },
                  }}
                >
                  <RichTextInput
                    key={`${question.id}-${field.name}`}
                    value={question[field.name] || ""}
                    onChange={(data) => handleFieldChange(field.name, data)}
                    placeholder="Write question text..."
                  />
                </Paper>
              </Box>
            );
          }

          if (field.type === "responses") {
            const responses = question.responses || [];
            return (
              <Box key={field.name}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: 14 }}>
                    Responses
                  </Typography>
                  <Button size="small" onClick={addResponse} sx={{ textTransform: "none" }}>
                    + Add
                  </Button>
                </Stack>
                <Stack spacing={1.5}>
                  {responses.map((response, index) => (
                    <Stack direction="row" spacing={1} key={index} alignItems="center">
                      <TextField
                        label="Option"
                        value={response.option}
                        onChange={(e) => handleResponseChange(index, "option", e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Value"
                        value={response.value}
                        onChange={(e) => handleResponseChange(index, "value", e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => deleteResponse(index)}
                        sx={{
                          color: "#ef4444",
                          "&:hover": { backgroundColor: "#fee2e2" },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            );
          }

          if (field.type === "image") {
            return (
              <Box key={field.name}>
                <Typography variant="body2" sx={{ fontSize: 14, mb: 1 }}>
                  {field.label}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Add
                </Button>
              </Box>
            );
          }

          if (field.type === "questionType") {
            const questionType = question.questionType || "text";
            return (
              <Box key={field.name}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <QuestionMark sx={{ fontSize: 18, color: "#6b7280" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
                    {field.label}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={questionType === "text" ? "contained" : "outlined"}
                    onClick={() => handleFieldChange("questionType", "text")}
                    sx={{
                      textTransform: "none",
                      flex: 1,
                      ...(questionType === "text" ? {
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        border: "none",
                      } : {
                        borderColor: "#e5e7eb",
                        color: "#6b7280",
                      }),
                    }}
                  >
                    Text
                  </Button>
                  <Button
                    variant={questionType === "video" ? "contained" : "outlined"}
                    onClick={() => handleFieldChange("questionType", "video")}
                    sx={{
                      textTransform: "none",
                      flex: 1,
                      ...(questionType === "video" ? {
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        border: "none",
                      } : {
                        borderColor: "#e5e7eb",
                        color: "#6b7280",
                      }),
                    }}
                  >
                    Video
                  </Button>
                </Stack>
              </Box>
            );
          }

          if (field.type === "answerType") {
            return (
              <Box key={field.name}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                  {field.label}
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={question.answerType || "rating"}
                  onChange={(e) => handleFieldChange("answerType", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f9fafb",
                    },
                  }}
                >
                  <MenuItem value="rating">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Star sx={{ fontSize: 18, color: "#6b7280" }} />
                      <Typography>Rating</Typography>
                    </Stack>
                  </MenuItem>
                </TextField>
              </Box>
            );
          }

          if (field.type === "ratingConfig") {
            const ratingCount = question.ratingCount || 3;
            const ratingShape = question.ratingShape || "star";
            return (
              <Box key={field.name}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    select
                    size="small"
                    value={ratingCount}
                    onChange={(e) => handleFieldChange("ratingCount", parseInt(e.target.value))}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f9fafb",
                      },
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    value={ratingShape}
                    onChange={(e) => handleFieldChange("ratingShape", e.target.value)}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f9fafb",
                      },
                    }}
                  >
                    <MenuItem value="star">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Star sx={{ fontSize: 18, color: "#6b7280" }} />
                        <Typography>Star</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="heart">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Grade sx={{ fontSize: 18, color: "#6b7280" }} />
                        <Typography>Heart</Typography>
                      </Stack>
                    </MenuItem>
                  </TextField>
                </Stack>
              </Box>
            );
          }

          if (field.type === "branching") {
            return (
              <Box key={field.name}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
                    {field.label}
                  </Typography>
                  <IconButton size="small" sx={{ border: "1px dashed #d8dff2" }}>
                    <Add />
                  </IconButton>
                </Stack>
              </Box>
            );
          }

          return null;
        })}
      </Stack>
    </Paper>
  );
};

// Add Content Modal Component
const AddContentModal = ({ open, onClose, onAddQuestion }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("elements");

  const filteredComponents = useMemo(() => {
    if (!searchQuery) return questionComponents;
    return questionComponents.filter((comp) =>
      comp.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleAddQuestion = (type) => {
    const component = questionComponents.find((c) => c.type === type);
    const baseQuestion = {
      id: Date.now().toString(),
      type: component.type,
      label: component.label,
      icon: component.icon,
      questionText: "",
      description: "",
      variableName: "",
      responses: [],
    };
    
    // Add type-specific defaults
    if (type === "rating") {
      baseQuestion.ratingCount = 3;
      baseQuestion.ratingShape = "star";
      baseQuestion.questionType = "text";
      baseQuestion.answerType = "rating";
      baseQuestion.required = false;
      baseQuestion.description = "";
    } else if (type === "radio") {
      baseQuestion.responses = [
        { option: "Choice 1", value: "choice_1" },
        { option: "Choice 2", value: "choice_2" },
        { option: "Choice 3", value: "choice_3" },
        { option: "Choice 4", value: "choice_4" },
      ];
      baseQuestion.description = "";
    }
    
    onAddQuestion(baseQuestion);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2}>
            <Button
              variant={activeTab === "elements" ? "contained" : "text"}
              onClick={() => setActiveTab("elements")}
              sx={{ textTransform: "none" }}
            >
              Add form elements
            </Button>
            <Button
              variant={activeTab === "import" ? "contained" : "text"}
              onClick={() => setActiveTab("import")}
              sx={{ textTransform: "none" }}
            >
              Import questions
            </Button>
            <Button
              variant={activeTab === "ai" ? "contained" : "text"}
              onClick={() => setActiveTab("ai")}
              sx={{ textTransform: "none" }}
            >
              Create with AI
            </Button>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {activeTab === "elements" && (
          <Stack spacing={3}>
            <TextField
              fullWidth
              placeholder="Search form elements"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 2,
                maxHeight: "60vh",
                overflowY: "auto",
              }}
            >
              {filteredComponents.map((component) => (
                <Paper
                  key={component.type}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid #e5e7eb",
                    borderRadius: 2,
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "#3b82f6",
                      backgroundColor: "#f0f9ff",
                    },
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                  onClick={() => handleAddQuestion(component.type)}
                >
                  <Box sx={{ color: "#3b82f6" }}>{component.icon}</Box>
                  <Typography variant="body2" sx={{ fontSize: 14 }}>
                    {component.label}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Stack>
        )}
        {activeTab === "import" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography>Import questions functionality coming soon</Typography>
          </Box>
        )}
        {activeTab === "ai" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography>AI question creation coming soon</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Workflow Component
const WorkflowView = ({ questions }) => {
  const workflowQuestions = questions.filter(q => q.type !== "welcome");

  return (
    <Box sx={{ display: "flex", flex: 1, overflow: "hidden", backgroundColor: "#fafbff" }}>
      {/* Left Sidebar - Pull data in */}
      <Box
        sx={{
          width: 280,
          borderRight: "1px solid #e5e9f2",
          backgroundColor: "#fff",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: "2px dashed #d8dff2",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            backgroundColor: "#fafbff",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: "#0f1f41" }}>
            Pull data in
          </Typography>
          <Typography variant="body2" sx={{ color: "#7483a6", mb: 3, fontSize: 13 }}>
            Track sources, identify respondents, and personalize the form content and flow with URL parameters.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              backgroundColor: "#4a5fd4",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#3a4fc4",
              },
            }}
          >
            Add
          </Button>
        </Paper>
      </Box>

      {/* Main Canvas - Workflow Diagram */}
      <Box sx={{ flex: 1, overflow: "auto", backgroundColor: "#fafbff", p: 4, position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            minWidth: "fit-content",
            justifyContent: "flex-start",
          }}
        >
          {questions.map((question, index) => {
            const isWelcome = question.type === "welcome";
            const component = questionComponents.find((c) => c.type === question.type);
            const questionNumber = isWelcome ? null : questions.slice(0, index).filter(q => q.type !== "welcome").length;
            
            // Node colors based on type
            const getNodeColor = () => {
              if (isWelcome) return "#9ca3af";
              if (question.type === "radio") return "#7c3aed";
              if (question.type === "rating") return "#a855f7";
              if (question.type === "checkbox") return "#a855f7";
              if (question.type === "grid") return "#3b82f6";
              if (question.type === "view") return "#10b981";
              return "#a855f7";
            };

            return (
              <React.Fragment key={question.id}>
                <Paper
                  elevation={0}
                  sx={{
                    width: 120,
                    height: 100,
                    backgroundColor: getNodeColor(),
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    position: "relative",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box sx={{ fontSize: 24, mb: 1 }}>
                    {isWelcome ? (
                      <PlayArrow sx={{ fontSize: 24 }} />
                    ) : (
                      component?.icon || <ShortText />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600 }}>
                    {isWelcome ? "0li" : questionNumber !== null ? questionNumber : ""}
                  </Typography>
                  {!isWelcome && question.type === "radio" && (
                    <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: 10 }}>A=B=</Typography>
                    </Box>
                  )}
                </Paper>
                {index < questions.length - 1 && (
                  <Box
                    sx={{
                      width: 40,
                      height: 2,
                      border: "2px dashed #d8dff2",
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        right: -6,
                        top: -4,
                        width: 0,
                        height: 0,
                        borderLeft: "6px solid #d8dff2",
                        borderTop: "4px solid transparent",
                        borderBottom: "4px solid transparent",
                      },
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Box>
      </Box>

      {/* Right Sidebar - Actions */}
      <Box
        sx={{
          width: 320,
          borderLeft: "1px solid #e5e9f2",
          backgroundColor: "#fff",
          overflowY: "auto",
          p: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#0f1f41", fontSize: 16 }}>
          Actions
        </Typography>
        
        <Stack spacing={3}>
          {/* Connect Section */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ p: 0.5, borderRadius: 1, backgroundColor: "#f3f6ff" }}>
                <Add sx={{ fontSize: 18, color: "#4a5fd4" }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
                Connect
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e9f2", borderRadius: 1, cursor: "pointer" }}>
                <Box sx={{ width: 24, height: 24, backgroundColor: "#10b981", borderRadius: 0.5 }} />
              </Paper>
              <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e9f2", borderRadius: 1, cursor: "pointer" }}>
                <Box sx={{ width: 24, height: 24, backgroundColor: "#10b981", borderRadius: 0.5 }} />
              </Paper>
              <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e9f2", borderRadius: 1, cursor: "pointer" }}>
                <Box sx={{ width: 24, height: 24, backgroundColor: "#f59e0b", borderRadius: 0.5 }} />
              </Paper>
              <IconButton size="small" sx={{ border: "1px dashed #d8dff2" }}>
                <Add />
              </IconButton>
            </Stack>
          </Box>

          {/* Messages Section */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ p: 0.5, borderRadius: 1, backgroundColor: "#f3f6ff" }}>
                <Send sx={{ fontSize: 18, color: "#4a5fd4" }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
                Messages
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e9f2", borderRadius: 1, cursor: "pointer" }}>
                <Send sx={{ fontSize: 18, color: "#6b7280" }} />
              </Paper>
              <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e9f2", borderRadius: 1, cursor: "pointer" }}>
                <BarChart sx={{ fontSize: 18, color: "#6b7280" }} />
              </Paper>
              <IconButton size="small" sx={{ border: "1px dashed #d8dff2" }}>
                <Add />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Bottom Controls */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
          backgroundColor: "#fff",
          p: 1,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <IconButton size="small">
          <ZoomOut />
        </IconButton>
        <IconButton size="small">
          <ZoomIn />
        </IconButton>
        <IconButton size="small">
          <Fullscreen />
        </IconButton>
        <IconButton size="small">
          <RestartAlt />
        </IconButton>
      </Box>
    </Box>
  );
};

// Main Form Builder Component
const FormBuilder = ({ formName = "My new form" }) => {
  const [questions, setQuestions] = useState([
    {
      id: "welcome",
      type: "welcome",
      label: "Welcome Screen",
      questionText: "Hello, Thanks for joining QuantAi. Please take 10 - 15 minutes to complete the survey which could reward you 1000 points. The survey is based on your personal preferences and choices",
      buttonText: "lets go",
      timeToComplete: false,
      numberOfSubmissions: false,
    },
  ]);
  const [selectedQuestion, setSelectedQuestion] = useState(questions[0]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTopTab, setActiveTopTab] = useState("Content");

  const handleAddQuestion = (newQuestion) => {
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    setSelectedQuestion(newQuestion);
  };

  const handleUpdateQuestion = (updatedQuestion) => {
    const updatedQuestions = questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    setQuestions(updatedQuestions);
    setSelectedQuestion(updatedQuestion);
  };

  const handleDeleteQuestion = (questionId) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(updatedQuestions);
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(updatedQuestions[0] || null);
    }
  };

  const getQuestionConfig = (question) => {
    if (question.type === "welcome") {
      return {
        title: "Welcome Screen",
        fields: [
          { type: "toggle", name: "timeToComplete", label: "Time to complete" },
          { type: "toggle", name: "numberOfSubmissions", label: "Number of submissions" },
          { type: "text", name: "buttonText", label: "Button" },
          { type: "image", name: "image", label: "Image or video" },
        ],
      };
    }
    return questionConfigs[question.type];
  };

  const getQuestionNumber = (question) => {
    const questionIndex = questions.findIndex(q => q.id === question.id);
    if (questionIndex === -1) return null;
    return questions.slice(0, questionIndex + 1).filter(q => q.type !== "welcome").length;
  };

  const renderQuestionPreview = (question) => {
    if (question.type === "welcome") {
      return <WelcomeScreen question={question} onUpdate={handleUpdateQuestion} />;
    }

    const config = questionConfigs[question.type];
    if (!config) return null;
    const questionNumber = getQuestionNumber(question);
    const handleQuestionTextChange = (newText) => {
      handleUpdateQuestion({ ...question, questionText: newText });
    };
    const handleDescriptionChange = (newDescription) => {
      handleUpdateQuestion({ ...question, description: newDescription });
    };

    // Rating Question Preview
    if (question.type === "rating") {
      const ratingCount = question.ratingCount || 3;
      const ratingShape = question.ratingShape || "star";
      
      return (
        <Box
          sx={{
            maxWidth: 600,
            mx: "auto",
            p: 4,
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box sx={{ mb: 1 }}>
            {questionNumber} →{" "}
            <InlineEditable
              value={question.questionText}
              onChange={handleQuestionTextChange}
              placeholder="Your question here. Recall information with @"
              questionNumber={questionNumber}
            />
          </Box>
          <InlineEditable
            value={question.description}
            onChange={handleDescriptionChange}
            placeholder="Description (optional)"
            questionNumber={questionNumber}
            isDescription={true}
          />
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
            {Array.from({ length: ratingCount }).map((_, idx) => (
              <Box
                key={idx}
                data-question-option="true"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                }}
              >
                <StarBorder
                  sx={{
                    fontSize: 48,
                    color: "#d1d5db",
                    strokeWidth: 1,
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: 14, color: "#6b7280" }}>
                  {idx + 1}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      );
    }

    // Radio/Single Select Preview
    if (question.type === "radio") {
      return (
        <Box
          sx={{
            maxWidth: 600,
            mx: "auto",
            p: 4,
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box sx={{ mb: 1 }}>
            {questionNumber} →{" "}
            <InlineEditable
              value={question.questionText}
              onChange={handleQuestionTextChange}
              placeholder="Your question here. Recall information with @"
              questionNumber={questionNumber}
            />
          </Box>
          <InlineEditable
            value={question.description}
            onChange={handleDescriptionChange}
            placeholder="Description (optional)"
            questionNumber={questionNumber}
            isDescription={true}
          />
          <Stack spacing={2}>
            {question.responses && question.responses.length > 0 ? (
              question.responses.map((response, idx) => (
                <Paper
                  key={idx}
                  data-question-option="true"
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid #e5e7eb",
                    borderRadius: 2,
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "#4a5fd4",
                      backgroundColor: "#fafbff",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "2px solid #d1d5db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                    <Typography variant="body1" sx={{ fontSize: 15 }}>
                      {String.fromCharCode(65 + idx)} {response.option}
                    </Typography>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: "#9ca3af", textAlign: "center" }}>
                No options added yet
              </Typography>
            )}
            <Button
              data-question-option="true"
              variant="text"
              sx={{
                textTransform: "none",
                color: "#4a5fd4",
                justifyContent: "flex-start",
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              Add choice
            </Button>
          </Stack>
        </Box>
      );
    }

    // Default Preview for other question types
    return (
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          p: 4,
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box sx={{ mb: 1 }}>
          {questionNumber} →{" "}
          <InlineEditable
            value={question.questionText}
            onChange={handleQuestionTextChange}
            placeholder="Your question here. Recall information with @"
            questionNumber={questionNumber}
          />
        </Box>
        <InlineEditable
          value={question.description}
          onChange={handleDescriptionChange}
          placeholder="Description (optional)"
          questionNumber={questionNumber}
          isDescription={true}
        />
        {question.responses && question.responses.length > 0 && (
          <Stack spacing={2}>
            {question.responses.map((response, idx) => (
              <Paper
                key={idx}
                data-question-option="true"
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                }}
              >
                {response.option}
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f9fafb" }}>
      {/* Top Navigation Bar */}
      <Box
        sx={{
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fff",
          px: 3,
          py: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Forms {'>'} {formName}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1}>
              <Button
                variant={activeTopTab === "Content" ? "contained" : "text"}
                onClick={() => setActiveTopTab("Content")}
                sx={{
                  textTransform: "none",
                  ...(activeTopTab === "Content" ? {
                    backgroundColor: "#374151",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#374151",
                    },
                  } : {
                    backgroundColor: "transparent",
                    color: "#6b7280",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }),
                }}
              >
                Content
              </Button>
              <Button
                variant={activeTopTab === "Workflow" ? "contained" : "text"}
                onClick={() => setActiveTopTab("Workflow")}
                sx={{
                  textTransform: "none",
                  ...(activeTopTab === "Workflow" ? {
                    backgroundColor: "#374151",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#374151",
                    },
                  } : {
                    backgroundColor: "transparent",
                    color: "#6b7280",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }),
                }}
              >
                Workflow
              </Button>
              <Button
                variant={activeTopTab === "Connect" ? "contained" : "text"}
                onClick={() => setActiveTopTab("Connect")}
                sx={{
                  textTransform: "none",
                  ...(activeTopTab === "Connect" ? {
                    backgroundColor: "#374151",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#374151",
                    },
                  } : {
                    backgroundColor: "transparent",
                    color: "#6b7280",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }),
                }}
              >
                Connect
              </Button>
            </Stack>
            <IconButton size="small">
              <Share />
            </IconButton>
            <Button variant="contained" sx={{ backgroundColor: "#10b981", textTransform: "none" }}>
              View plans
            </Button>
            <IconButton size="small">
              <Help />
            </IconButton>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#3b82f6", fontSize: 14 }}>
              QD
            </Avatar>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content Area */}
      {activeTopTab === "Workflow" ? (
        <WorkflowView questions={questions} />
      ) : activeTopTab === "Content" ? (
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Sidebar */}
          <Box
            sx={{
              width: 280,
              borderRight: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
          <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb" }}>
            <TextField
              select
              fullWidth
              size="small"
              defaultValue="universal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              <MenuItem value="universal">Universal mode</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddModalOpen(true)}
              sx={{
                textTransform: "none",
                backgroundColor: "#0f1f41",
                color: "#fff",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#1a2f55",
                },
              }}
            >
              Add content
            </Button>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 1 }}>
            <Stack spacing={0.5}>
              {questions.map((question, index) => {
                const isSelected = selectedQuestion?.id === question.id;
                const component = questionComponents.find((c) => c.type === question.type);
                const isWelcome = question.type === "welcome";
                // Question number: exclude welcome screen from numbering
                const questionNumber = isWelcome ? null : questions.slice(0, index).filter(q => q.type !== "welcome").length;
                
                return (
                  <Paper
                    key={question.id}
                    elevation={0}
                    onClick={() => setSelectedQuestion(question)}
                    sx={{
                      p: 1.5,
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#f0f9ff" : "transparent",
                      border: isSelected ? "1px solid #3b82f6" : "1px solid transparent",
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: isSelected ? "#f0f9ff" : "#f9fafb",
                        border: "1px solid #e5e7eb",
                      },
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      transition: "all 0.2s",
                    }}
                  >
                    {isWelcome ? (
                      <PlayArrow sx={{ color: "#3b82f6", fontSize: 20, mt: 0.5 }} />
                    ) : (
                      <Box sx={{ color: isSelected ? "#3b82f6" : "#6b7280", mt: 0.5 }}>
                        {component?.icon || <ShortText />}
                      </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {!isWelcome && questionNumber !== null && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9ca3af",
                            fontSize: 11,
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          {questionNumber}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 13,
                          color: "#374151",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {isWelcome
                          ? "Hello, Thanks for joining QuantAi...."
                          : question.label || question.questionText?.replace(/<[^>]*>/g, "").substring(0, 30) + "..." || `Question ${questionNumber}`}
                      </Typography>
                    </Box>
                    {!isWelcome && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(question.id);
                        }}
                        sx={{ mt: -0.5, opacity: 0.6, "&:hover": { opacity: 1 } }}
                      >
                        <Delete fontSize="small" sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          </Box>
          <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
                Endings
              </Typography>
              <IconButton size="small">
                <Add />
              </IconButton>
            </Stack>
          </Box>
        </Box>

          {/* Main Content Area */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#fafbff" }}>
            <Box sx={{ flex: 1, overflowY: "auto", p: 4, display: "flex", justifyContent: "center" }}>
              {selectedQuestion ? (
                renderQuestionPreview(selectedQuestion)
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100%",
                    color: "#9ca3af",
                  }}
                >
                  Select a question to edit
                </Box>
              )}
            </Box>
            <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
              <TextField
                fullWidth
                placeholder="Chat to create"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mic sx={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small">
                        <Send sx={{ color: "#4a5fd4" }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9fafb",
                    borderColor: "#e5e9f2",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Right Sidebar - Settings Panel */}
          <Box
            sx={{
              width: 320,
              borderLeft: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              overflowY: "auto",
              p: 2,
            }}
          >
            {selectedQuestion ? (
              <QuestionSettingsPanel
                question={selectedQuestion}
                config={getQuestionConfig(selectedQuestion)}
                onUpdate={handleUpdateQuestion}
              />
            ) : (
              <Typography variant="body2" sx={{ color: "#9ca3af", textAlign: "center", mt: 4 }}>
                Select a question to view settings
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
          <Typography variant="h6" sx={{ color: "#9ca3af" }}>
            Connect tab content coming soon
          </Typography>
        </Box>
      )}

      {/* Add Content Modal */}
      <AddContentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddQuestion={handleAddQuestion}
      />
    </Box>
  );
};

export default FormBuilder;

