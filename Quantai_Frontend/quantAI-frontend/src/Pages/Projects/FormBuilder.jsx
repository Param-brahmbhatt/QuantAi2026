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
  Delete,
  Add,
  ZoomOut,
  ZoomIn,
  Fullscreen,
  RestartAlt,
  BarChart,
  QuestionMark,
  List,
} from "@mui/icons-material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  GetLogicNodes,
  CreateLogicNode,
  GetConditions,
  CreateCondition,
  GetVariables,
  GetAnswers,
  SubmitAnswer,
  CalculateNextQuestion,
  GetQuestions,
  CreateQuestion,
  UpdateQuestion,
  DeleteQuestion,
  GetQuestionTypes,
} from "../../API/Services/services";
import { useParams } from "react-router-dom";

// Helper function to get icon by type
const getIconByType = (type) => {
  const iconMap = {
    radio: <RadioButtonChecked />,
    rating: <Grade />,
    timer: <AccessTime />,
    checkbox: <CheckBox />,
    grid: <GridOn />,
    view: <Visibility />,
    number: <Numbers />,
    text: <ShortText />,
    list: <List />,
  };
  return iconMap[type] || <ShortText />;
};

// Default question type configurations (fallback)
const defaultQuestionComponents = [
  { type: "radio", label: "Radio (Single Select)", icon: <RadioButtonChecked /> },
  { type: "rating", label: "Rating", icon: <Grade /> },
  { type: "timer", label: "Timer", icon: <AccessTime /> },
  { type: "checkbox", label: "Checkbox", icon: <CheckBox /> },
  { type: "grid", label: "Grid", icon: <GridOn /> },
  { type: "view", label: "View", icon: <Visibility /> },
  { type: "number", label: "Number", icon: <Numbers /> },
  { type: "text", label: "Text", icon: <ShortText /> },
  { type: "list", label: "List (Dropdown)", icon: <List /> },
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
  list: {
    title: "List (Dropdown) Settings",
    fields: [
      { type: "text", name: "variableName", label: "Variable Name" },
      { type: "editor", name: "questionText", label: "Question Text" },
      { type: "toggle", name: "required", label: "Required" },
      { type: "responses", name: "responses" },
    ],
    actions: true,
  },
};

// Inline Editable Component for Center Preview (Typeform-style)
const InlineEditable = ({ value, onChange, placeholder, questionNumber, isDescription = false, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef(null);
  const containerRef = useRef(null);
  const lastExternalValueRef = useRef(value || "");
  const isInitializedRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Initialize content on mount and when value changes
  useEffect(() => {
    if (editableRef.current) {
      const currentText = editableRef.current.textContent || "";
      const newValue = value || "";

      // On initial mount, always set the value if it exists
      if (!isInitializedRef.current) {
        if (newValue) {
          editableRef.current.textContent = newValue;
          lastExternalValueRef.current = newValue;
        }
        isInitializedRef.current = true;
      } else if (!isEditing) {
        // After initialization, only update if value changed externally and we're not editing
        if (newValue !== lastExternalValueRef.current) {
          editableRef.current.textContent = newValue;
          lastExternalValueRef.current = newValue;
        } else if (!newValue && currentText) {
          // If value is cleared externally, clear the content
          editableRef.current.textContent = "";
          lastExternalValueRef.current = "";
        }
      }
    }
  }, [value, isEditing]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Preserve content when editing starts
  useEffect(() => {
    if (isEditing && editableRef.current) {
      // When editing starts, ensure content is set
      const currentText = editableRef.current.textContent || "";
      const valueText = value || "";
      // If content is empty but we have a value, set it
      if (!currentText && valueText) {
        editableRef.current.textContent = valueText;
      }
      // Focus and set cursor to end
      setTimeout(() => {
        if (editableRef.current) {
          editableRef.current.focus();
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(editableRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 0);
    }
  }, [isEditing, value]);
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        const isClickingOnOption = event.target.closest('[data-question-option]') ||
          event.target.closest('button') ||
          event.target.closest('[role="button"]') ||
          event.target.closest('.MuiButton-root');
        if (!isClickingOnOption) {
          setTimeout(() => {
            if (isEditing) {
              handleBlur();
            }
          }, 100);
        }
      }
    };

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

  const handleSave = () => {
    setIsEditing(false);
    const text = editableRef.current?.textContent || "";
    if (onChange) {
      onChange(text);
    }
    if (onSave) {
      onSave(text);
    }
  };

  const handleBlur = () => {
    handleSave();
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
    // Save on input with debouncing for better persistence
    // This ensures changes are saved even if user doesn't blur
    if (onChange && editableRef.current) {
      const text = editableRef.current.textContent || "";
      // Use a small delay to debounce rapid typing
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        if (onChange && editableRef.current) {
          const currentText = editableRef.current.textContent || "";
          onChange(currentText);
        }
      }, 500); // Save after 500ms of no typing
    }
  };

  const isEmpty = !value || value.trim() === "";
  const displayText = value || "";

  if (isDescription) {
    return (
      <Box
        ref={containerRef}
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
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
            caretColor: "#374151",
            minHeight: 20,
            outline: "none",
            display: "inline-block",
            width: "100%",
            maxWidth: "100%",
            flex: 1,
            minWidth: 0,
            wordWrap: "break-word",
            overflowWrap: "break-word",
            wordBreak: "break-word",
            direction: "ltr",
            textAlign: "left",
            boxSizing: "border-box",
            overflow: "hidden",
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
        />
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        mb: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
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
          caretColor: "#374151",
          minHeight: 28,
          display: "inline-block",
          maxWidth: "100%",
          width: "100%",
          flex: 1,
          minWidth: 0,
          wordWrap: "break-word",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          outline: "none",
          direction: "ltr",
          textAlign: "left",
          boxSizing: "border-box",
          overflow: "hidden",
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
      />
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
  useEffect(() => {
    if (editorRef.current) {
      const currentData = editorRef.current.getData();
      const newValue = value || "";
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
        width: "100%",
        maxWidth: "800px",
        mx: "auto",
        px: 2,
        py: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxHeight: "120vh",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-track": { background: "#000" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#c1c1c1",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#a8a8a8",
        },
      }}
    >
      <Box sx={{ width: "100%", textAlign: "center", mb: 2, maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
        <InlineEditable
          value={question?.questionText}
          onChange={(text) => onUpdate({ ...question, questionText: text })}
          onSave={(text) => onUpdate({ ...question, questionText: text })}
          placeholder="Hello, Thanks for joining QuantAi. Please take 10 - 15 minutes to complete the survey which could reward you 1000 points. The survey is based on your personal preferences and choices"
        />
      </Box>
      <Box sx={{ width: "100%", textAlign: "center", mb: 3, maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
        <InlineEditable
          value={question?.description}
          onChange={(text) => onUpdate({ ...question, description: text })}
          onSave={(text) => onUpdate({ ...question, description: text })}
          placeholder="Description (optional)"
          isDescription
        />
      </Box>
      <Button
        variant="contained"
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 2,
          textTransform: "none",
          backgroundColor: "#3b82f6",
          mb: 1,
          maxWidth: "calc(100% - 16px)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
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
    return getIconByType(question.type);
  };

  const getQuestionLabel = () => {
    if (question.type === "welcome") return "Welcome Screen";
    const allTypes = [...defaultQuestionComponents];
    const component = allTypes.find((c) => c.type === question.type);
    return component?.label || question.type;
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header - Question Type Selector */}
      <Box sx={{ mb: 2, width: "100%", boxSizing: "border-box" }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ color: "#3b82f6", display: "flex", alignItems: "center", flexShrink: 0 }}>
            {getQuestionIcon()}
          </Box>
          <TextField
            select
            value={question.type}
            size="small"
            sx={{
              flex: 1,
              minWidth: 0,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f9fafb",
              },
            }}
          >
            <MenuItem value={question.type}>{getQuestionLabel()}</MenuItem>
          </TextField>
        </Stack>
      </Box>

      {/* Settings Fields */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          width: "100%",
          pr: 0.5,
          minHeight: 0,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#a8a8a8",
          },
        }}
      >
        <Stack spacing={2.5} sx={{ width: "100%", boxSizing: "border-box" }}>
          {config.fields.map((field) => {
            if (field.type === "text") {
              const value = question[field.name] || "";
              const maxLength = field.name === "buttonText" ? 24 : undefined;
              return (
                <Box key={field.name} sx={{ width: "100%", boxSizing: "border-box" }}>
                  <TextField
                    label={field.label}
                    value={value}
                    onChange={(e) => {
                      const newValue = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
                      handleFieldChange(field.name, newValue);
                    }}
                    fullWidth
                    size="small"
                    inputProps={{ maxLength }}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fff",
                      },
                    }}
                    InputProps={{
                      endAdornment: field.name === "buttonText" && (
                        <InputAdornment position="end">
                          <Typography variant="caption" sx={{ color: "#9ca3af", fontSize: 12, whiteSpace: "nowrap" }}>
                            {value.length}/{maxLength}
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              );
            }

            if (field.type === "select") {
              return (
                <Box key={field.name} sx={{ width: "100%", boxSizing: "border-box" }}>
                  <TextField
                    select
                    label={field.label}
                    value={question[field.name] || field.options[0]}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    fullWidth
                    size="small"
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fff",
                      },
                    }}
                  >
                    {field.options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              );
            }

            if (field.type === "toggle") {
              return (
                <Box key={field.name} sx={{ width: "100%", boxSizing: "border-box" }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ width: "100%" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 14,
                        color: "#374151",
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {field.label}
                    </Typography>
                    <Switch
                      checked={Boolean(question[field.name])}
                      onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                      size="small"
                      sx={{ flexShrink: 0, ml: 1 }}
                    />
                  </Stack>
                </Box>
              );
            }

            if (field.type === "editor") {
              return (
                <Box key={field.name} sx={{ width: "100%", boxSizing: "border-box" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: 14, color: "#374151" }}>
                    {field.label}
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      width: "100%",
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
                <Box key={field.name} sx={{ width: "100%", boxSizing: "border-box" }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1.5, width: "100%" }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: 14, color: "#374151" }}>
                      Responses
                    </Typography>
                    <Button
                      size="small"
                      onClick={addResponse}
                      sx={{
                        textTransform: "none",
                        color: "#3b82f6",
                        minWidth: "auto",
                        px: 1.5,
                      }}
                    >
                      + Add
                    </Button>
                  </Stack>
                  <Stack spacing={1.5} sx={{ width: "100%" }}>
                    {responses.map((response, index) => (
                      <Stack
                        direction="row"
                        spacing={1}
                        key={index}
                        alignItems="center"
                        sx={{ width: "100%", minWidth: 0 }}
                      >
                        <TextField
                          label="Option"
                          value={response.option}
                          onChange={(e) => handleResponseChange(index, "option", e.target.value)}
                          size="small"
                          sx={{ flex: 1, minWidth: 0 }}
                        />
                        <TextField
                          label="Value"
                          value={response.value}
                          onChange={(e) => handleResponseChange(index, "value", e.target.value)}
                          size="small"
                          sx={{ flex: 1, minWidth: 0 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => deleteResponse(index)}
                          sx={{
                            color: "#ef4444",
                            flexShrink: 0,
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
                <Box key={field.name} sx={{ width: "100%", boxSizing: "border-box" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 14,
                      mb: 1.5,
                      color: "#374151",
                      fontWeight: 400,
                    }}
                  >
                    {field.label}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    size="small"
                    sx={{
                      textTransform: "none",
                      borderColor: "#e5e7eb",
                      color: "#374151",
                      "&:hover": {
                        borderColor: "#d1d5db",
                        backgroundColor: "#f9fafb",
                      },
                    }}
                  >
                    Add
                  </Button>
                </Box>
              );
            }

            if (field.type === "questionType") {
              const questionType = question.questionType || "text";
              return (
                <Box key={field.name} sx={{ width: "100%", boxSizing: "border-box" }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <QuestionMark sx={{ fontSize: 18, color: "#6b7280", flexShrink: 0 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>
                      {field.label}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                    <Button
                      variant={questionType === "text" ? "contained" : "outlined"}
                      onClick={() => handleFieldChange("questionType", "text")}
                      sx={{
                        textTransform: "none",
                        flex: 1,
                        minWidth: 0,
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
                        minWidth: 0,
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
                <Box key={field.name} sx={{ width: "100%", boxSizing: "border-box" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: 14, color: "#374151" }}>
                    {field.label}
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={question.answerType || "rating"}
                    onChange={(e) => handleFieldChange("answerType", e.target.value)}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fff",
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
                <Box key={field.name} sx={{ width: "100%", boxSizing: "border-box" }}>
                  <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                    <TextField
                      select
                      size="small"
                      value={ratingCount}
                      onChange={(e) => handleFieldChange("ratingCount", parseInt(e.target.value))}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#fff",
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
                        minWidth: 0,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#fff",
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
                <Box key={field.name} sx={{ width: "100%", boxSizing: "border-box" }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ width: "100%" }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>
                      {field.label}
                    </Typography>
                    <IconButton
                      size="small"
                      sx={{
                        border: "1px dashed #d8dff2",
                        flexShrink: 0,
                        color: "#6b7280",
                        "&:hover": {
                          borderColor: "#c1c9e2",
                          backgroundColor: "#f9fafb",
                        },
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Stack>
                </Box>
              );
            }

            return null;
          })}
        </Stack>
      </Box>
    </Box>
  );
};

// Add Content Modal Component
const AddContentModal = ({ open, onClose, onAddQuestion, questionTypes = defaultQuestionComponents }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("elements");

  const filteredComponents = useMemo(() => {
    if (!searchQuery) return questionTypes;
    return questionTypes.filter((comp) =>
      comp.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, questionTypes]);

  const handleAddQuestion = (type) => {
    const component = questionTypes.find((c) => c.type === type);
    const baseQuestion = {
      id: Date.now().toString(),
      type: component.type,
      label: component.label,
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
      baseQuestion.responses = [];
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
              {filteredComponents.map((component, idx) => (
                <Paper
                  key={`${component.type}-${idx}`}
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

// Workflow Component with Drag and Drop
const WorkflowView = ({ questions, logicNodes = [], conditions = [], variables = [], answers = [], onQuestionsUpdate }) => {
  const workflowQuestions = questions.filter(q => q.type !== "welcome");
  const [draggedQuestion, setDraggedQuestion] = useState(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);
  const [nodePositions, setNodePositions] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [connectionPoints, setConnectionPoints] = useState({});
  const [draggingConnection, setDraggingConnection] = useState(null);

  // Initialize positions
  useEffect(() => {
    const positions = {};
    questions.forEach((q, index) => {
      if (!nodePositions[q.id]) {
        positions[q.id] = { x: index * 150, y: 150 };
      } else {
        positions[q.id] = nodePositions[q.id];
      }
    });
    if (Object.keys(positions).length > 0) {
      setNodePositions(prev => ({ ...prev, ...positions }));
    }
  }, [questions.length]);

  // Initialize connection control points
  useEffect(() => {
    const points = {};
    questions.forEach((q, index) => {
      if (index < questions.length - 1) {
        const nextQ = questions[index + 1];
        const startPos = nodePositions[q.id] || { x: index * 150, y: 150 };
        const endPos = nodePositions[nextQ.id] || { x: (index + 1) * 150, y: 150 };
        const midX = (startPos.x + endPos.x) / 2;
        const midY = (startPos.y + endPos.y) / 2;
        points[`${q.id}-${nextQ.id}`] = { x: midX, y: midY };
      }
    });
    setConnectionPoints(prev => ({ ...prev, ...points }));
  }, [questions, nodePositions]);

  const handleDragStart = (e, question) => {
    setDraggedQuestion(question);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", question.id);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOverIndex(index);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedQuestion && draggedOverIndex !== null) {
      const newQuestions = [...questions];
      const draggedIndex = questions.findIndex(q => q.id === draggedQuestion.id);

      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        const [removed] = newQuestions.splice(draggedIndex, 1);
        newQuestions.splice(targetIndex, 0, removed);
        if (onQuestionsUpdate) {
          onQuestionsUpdate(newQuestions);
        }
      }
    }
    setDraggedQuestion(null);
    setDraggedOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedQuestion(null);
    setDraggedOverIndex(null);
  };

  const handleNodePositionUpdate = (questionId, newPosition) => {
    setNodePositions(prev => ({
      ...prev,
      [questionId]: newPosition
    }));
  };

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
        <Box
          sx={{
          flex: 1, 
          overflow: "auto", 
          backgroundColor: "#fafbff", 
          p: 4, 
          position: "relative",
          minHeight: "100%",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const questionId = e.dataTransfer.getData("text/html");
          if (questionId && onQuestionsUpdate) {
            // Handle drop on canvas
          }
        }}
      >
        <Box
          sx={{
            position: "relative",
            minHeight: "600px",
            width: "100%",
          }}
        >
          {/* SVG container for curved connections with moveable control points */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: draggingConnection ? "all" : "none",
              zIndex: 1,
            }}
            onMouseMove={(e) => {
              if (draggingConnection) {
                const rect = e.currentTarget.getBoundingClientRect();
                const newX = e.clientX - rect.left;
                const newY = e.clientY - rect.top;
                setConnectionPoints(prev => ({
                  ...prev,
                  [draggingConnection]: { x: newX, y: newY }
                }));
              }
            }}
            onMouseUp={() => {
              setDraggingConnection(null);
            }}
            onMouseLeave={() => {
              setDraggingConnection(null);
            }}
          >
            {questions.map((question, index) => {
              if (index === questions.length - 1) return null;
              const nextQuestion = questions[index + 1];
              const startPos = nodePositions[question.id] || { x: index * 150, y: 150 };
              const endPos = nodePositions[nextQuestion.id] || { x: (index + 1) * 150, y: 150 };
              const connectionKey = `${question.id}-${nextQuestion.id}`;
              const controlPoint = connectionPoints[connectionKey] || {
                x: (startPos.x + endPos.x) / 2,
                y: (startPos.y + endPos.y) / 2
              };

              const startX = startPos.x + 50;
              const startY = startPos.y + 40;
              const endX = endPos.x;
              const endY = endPos.y + 40;
              const cpX = controlPoint.x;
              const cpY = controlPoint.y;

              const path = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;

              return (
                <g key={`connection-${question.id}`}>
                  <path
                    d={path}
                    fill="none"
                    stroke="#d8dff2"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    style={{ pointerEvents: "stroke", cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      e.target.style.stroke = "#4a5fd4";
                      e.target.style.strokeWidth = "3";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.stroke = "#d8dff2";
                      e.target.style.strokeWidth = "2";
                    }}
                  />
                  <circle cx={endX} cy={endY} r="4" fill="#d8dff2" />
                  {/* Invisible larger hit area for easier dragging */}
                  <circle
                    cx={cpX}
                    cy={cpY}
                    r="12"
                    fill="transparent"
                    stroke="none"
                    style={{
                      cursor: draggingConnection === connectionKey ? "grabbing" : "grab",
                      pointerEvents: "all",
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingConnection(connectionKey);
                    }}
                  />
                  {/* Visible control point */}
                  <circle
                    cx={cpX}
                    cy={cpY}
                    r="6"
                    fill="#4a5fd4"
                    style={{
                      cursor: draggingConnection === connectionKey ? "grabbing" : "grab",
                      opacity: draggingConnection === connectionKey ? 0.8 : 0.6,
                      pointerEvents: "none",
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Render question nodes */}
          {questions.map((question, index) => {
            const isWelcome = question.type === "welcome";
            const allTypes = [...defaultQuestionComponents];
            const component = allTypes.find((c) => c.type === question.type);
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

            const position = nodePositions[question.id] || { x: index * 200, y: 100 };
            const isDragged = draggedQuestion?.id === question.id;
            const isDraggedOver = draggedOverIndex === index;

            return (
                <Paper
                key={question.id}
                draggable
                onDragStart={(e) => handleDragStart(e, question)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                elevation={selectedNode === question.id ? 8 : 0}
                onClick={() => setSelectedNode(question.id)}
                  sx={{
                  width: 100,
                  minHeight: 80,
                  backgroundColor: "#fff",
                  borderRadius: 1.5,
                  border: `2px solid ${getNodeColor()}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  color: "#0f1f41",
                  position: "absolute",
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  cursor: "grab",
                  opacity: isDragged ? 0.5 : 1,
                  borderColor: selectedNode === question.id ? getNodeColor() : "#d8dff2",
                  boxShadow: selectedNode === question.id ? `0 0 0 3px ${getNodeColor()}33` : "0 2px 4px rgba(0,0,0,0.1)",
                  transform: isDraggedOver ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.2s",
                  p: 1.5,
                  zIndex: selectedNode === question.id ? 10 : 2,
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    transform: "scale(1.05)",
                    borderColor: getNodeColor(),
                  },
                  "&:active": {
                    cursor: "grabbing",
                    },
                  }}
                >
                  <Box sx={{ 
                    color: getNodeColor(), 
                    mb: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5
                  }}>
                    {isWelcome ? (
                      <PlayArrow sx={{ fontSize: 18 }} />
                    ) : (
                      <>
                        {component?.icon || <ShortText />}
                        {questionNumber !== null && (
                          <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, ml: 0.5 }}>
                            {questionNumber}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                  {!isWelcome && question.type === "radio" && (
                    <Box sx={{ position: "absolute", top: 4, right: 4 }}>
                      <Typography variant="caption" sx={{ fontSize: 8, color: "#6b7280" }}>1</Typography>
                    </Box>
                  )}
                  {/* Show logic node indicator if exists */}
                  {logicNodes.some(node => node.question === question.id || node.question === question.backendId) && (
                    <Box sx={{ position: "absolute", bottom: 4, right: 4 }}>
                      <BarChart sx={{ fontSize: 12, color: getNodeColor() }} />
                    </Box>
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{
                      fontSize: 9, 
                      textAlign: "center",
                      px: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      color: "#374151",
                      lineHeight: 1.2,
                    }}
                  >
                    {question.questionText?.replace(/<[^>]*>/g, "").substring(0, 15) || question.label || `Q${questionNumber || index}`}
                  </Typography>
                </Paper>
            );
          })}
        </Box>
      </Box>

      {/* Right Sidebar - Actions & API Data */}
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
          Actions & Logic
        </Typography>

        <Stack spacing={3}>
          {/* Selected Question Logic Nodes */}
          {selectedNode && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14, mb: 2 }}>
                Logic for Selected Question
              </Typography>
              {logicNodes
                .filter(node => {
                  const selectedQ = questions.find(q => q.id === selectedNode);
                  return node.question === selectedQ?.id || node.question === selectedQ?.backendId;
                })
                .map((node, idx) => (
                  <Paper key={idx} elevation={0} sx={{ p: 2, border: "1px solid #e5e9f2", borderRadius: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ color: "#6b7280", fontSize: 11 }}>Action Type</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{node.action_type || "N/A"}</Typography>
                    {node.target_question && (
                      <>
                        <Typography variant="caption" sx={{ color: "#6b7280", fontSize: 11, mt: 1, display: "block" }}>Target Question</Typography>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>{node.target_question}</Typography>
                      </>
                    )}
                  </Paper>
                ))}
              {logicNodes.filter(node => {
                const selectedQ = questions.find(q => q.id === selectedNode);
                return node.question === selectedQ?.id || node.question === selectedQ?.backendId;
              }).length === 0 && (
                  <Typography variant="body2" sx={{ color: "#9ca3af", fontSize: 12 }}>
                    No logic nodes for this question
                  </Typography>
                )}
            </Box>
          )}

          {/* API Data Summary */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ p: 0.5, borderRadius: 1, backgroundColor: "#f3f6ff" }}>
                <BarChart sx={{ fontSize: 18, color: "#4a5fd4" }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
                API Data
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e9f2", borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontSize: 11 }}>Logic Nodes</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{logicNodes.length}</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e9f2", borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontSize: 11 }}>Conditions</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{conditions.length}</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e9f2", borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontSize: 11 }}>Variables</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{variables.length}</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e9f2", borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontSize: 11 }}>Answers</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{answers.length}</Typography>
              </Paper>
            </Stack>
          </Box>
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
const FormBuilder = ({ formName = "My new form", projectId: propProjectId }) => {
  const { projectId: urlProjectId } = useParams();
  const projectId = propProjectId || urlProjectId;
  
  // Default welcome question (can be overridden from localStorage)
  const defaultWelcomeQuestion = {
    id: "welcome",
    type: "welcome",
    label: "Welcome Screen",
    questionText:
      "Hello, Thanks for joining QuantAi. Please take 10 - 15 minutes to complete the survey which could reward you 1000 points. The survey is based on your personal preferences and choices",
    description: "",
    buttonText: "lets go",
    timeToComplete: false,
    numberOfSubmissions: false,
  };

  // Storage keys for this project
  const getStorageKey = () => `questions_${projectId || "default"}`;
  const getWelcomeKey = () => `welcome_${projectId || "default"}`;
  
  // Ensure we only persist serializable question data (no React elements like icons)
  const getSerializableQuestions = (list) =>
    (list || []).map(({ icon, ...rest }) => rest);
  
  // Load questions: API is source of truth for questions, localStorage only for welcome overrides / caching
  const loadQuestions = async () => {
    // 1) Build welcome question, overriding from localStorage if present
    let welcomeQuestion = { ...defaultWelcomeQuestion };
    try {
      const storedWelcome = localStorage.getItem(getWelcomeKey());
      if (storedWelcome) {
        const parsed = JSON.parse(storedWelcome);
        welcomeQuestion = { ...welcomeQuestion, ...parsed };
      }
    } catch (e) {
      console.error("Error reading welcome question from localStorage:", e);
    }

    // 2) Load questions from API
    let apiQuestions = [];
    try {
      if (projectId) {
        const loaded = await GetQuestions(projectId);
        if (Array.isArray(loaded) && loaded.length > 0) {
          apiQuestions = loaded.map((q) => {
            const frontendType =
              (q.question_type && backendCodeToFrontendType[q.question_type]) ||
              q.widget ||
              "text";

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
              responses: [], // TODO: map choices when API provides them
            };
          });
        }
      }
    } catch (error) {
      console.error("Error loading questions from API:", error);
    }

    const combined = [welcomeQuestion, ...apiQuestions];

    // 3) Cache combined list in localStorage for quick access (not source of truth)
    try {
      const storageKey = getStorageKey();
      const serializable = getSerializableQuestions(combined);
      localStorage.setItem(storageKey, JSON.stringify(serializable));
    } catch (e) {
      console.error("Error caching questions to localStorage:", e);
    }

    return combined;
  };

  const [questions, setQuestions] = useState([defaultWelcomeQuestion]);
  const [selectedQuestion, setSelectedQuestion] = useState(questions[0] || defaultWelcomeQuestion);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTopTab, setActiveTopTab] = useState("Content");

  // API Data States
  const [logicNodes, setLogicNodes] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [variables, setVariables] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [questionTypes, setQuestionTypes] = useState(defaultQuestionComponents);
  const [loading, setLoading] = useState(false);

  // Map backend question type codes to frontend types
  const backendCodeToFrontendType = {
    "RDO": "radio",
    "CHB": "checkbox",
    "DRP": "list",
    "TXT": "text",
    "TXTL": "text",
    "RAT": "rating",
    "NPS": "rating",
    "SLI": "rating",
    "RNK": "rating",
    "MTX": "grid",
    "FIL": "view",
    "DT": "view",
    "IMG": "view",
    "SIG": "view",
    "GEO": "view",
    "AV": "view",
    "EML": "text",
    "PHN": "text",
    "URL": "text",
    "NUM": "number",
    "ADR": "text",
    "CTI": "text",
  };

  // Map frontend types to backend codes
  const frontendTypeToBackendCode = {
    "radio": "RDO",
    "checkbox": "CHB",
    "list": "DRP",
    "text": "TXT",
    "rating": "RAT",
    "grid": "MTX",
    "number": "NUM",
    "timer": "DT",
    "view": "VIEW",
  };
  
  // Question types: load from backend question-types API, fallback to defaults
  useEffect(() => {
    const loadQuestionTypes = async () => {
      try {
        setLoading(true);
        const apiQuestionTypes = await GetQuestionTypes();
        if (Array.isArray(apiQuestionTypes) && apiQuestionTypes.length > 0) {
          const transformed = apiQuestionTypes.map((qt) => {
            const code = qt.code || "";
            const name = qt.name || "";
            const frontendType =
              backendCodeToFrontendType[code] ||
              qt.widget ||
              "text";

            // Pick icon based on frontend type
            let icon;
            switch (frontendType) {
              case "radio":
                icon = <RadioButtonChecked />;
                break;
              case "rating":
                icon = <Grade />;
                break;
              case "timer":
                icon = <AccessTime />;
                break;
              case "checkbox":
                icon = <CheckBox />;
                break;
              case "grid":
                icon = <GridOn />;
                break;
              case "view":
                icon = <Visibility />;
                break;
              case "number":
                icon = <Numbers />;
                break;
              case "list":
                icon = <List />;
                break;
              case "text":
              default:
                icon = <ShortText />;
            }

            return {
              type: frontendType,
              label: name,
              icon,
              backendCode: code,
            };
          });

          setQuestionTypes(transformed);
        } else {
          setQuestionTypes(defaultQuestionComponents);
        }
      } catch (error) {
        console.error("Error loading question types from API:", error);
        setQuestionTypes(defaultQuestionComponents);
      } finally {
        setLoading(false);
      }
    };

    loadQuestionTypes();
  }, []);

  // Save questions to localStorage whenever they change (but not on initial load)
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    try {
      const storageKey = getStorageKey();
      const serializable = getSerializableQuestions(questions);
      localStorage.setItem(storageKey, JSON.stringify(serializable));
      // Dispatch custom event to notify PreviewCard
      window.dispatchEvent(new CustomEvent('questionsUpdated', {
        detail: { projectId, questions }
      }));
    } catch (error) {
      console.error("Error saving questions to storage:", error);
    }
  }, [questions, projectId]);

  const handleAddQuestion = async (newQuestion) => {
    try {
      // Save to API if projectId exists
      if (projectId && newQuestion.type !== "welcome") {
        // Get backend code for this question type (prefer API-provided mapping)
        const typeMeta = questionTypes.find((qt) => qt.type === newQuestion.type);
        const backendCode =
          typeMeta?.backendCode || frontendTypeToBackendCode[newQuestion.type] || "TXT";
        
        // Ensure title is not empty - use a default if needed
        const questionTitle = newQuestion.questionText || newQuestion.label || "Untitled Question";

        const questionData = {
          project: parseInt(projectId),
          variable_name: newQuestion.variableName || `var_${Date.now()}`,
          title: questionTitle,
          description: newQuestion.description || "",
          is_required: newQuestion.required || false,
          is_initial_question: newQuestion.isFirst || false,
          question_type: backendCode, // Use backend code
          widget: newQuestion.type === "rating" ? "star_rating" : (newQuestion.type || "text"),
        };

        console.log("Creating question with data:", questionData);
        const created = await CreateQuestion(questionData);
        if (created && created.id) {
          newQuestion.backendId = created.id;
          newQuestion.id = created.id?.toString() || newQuestion.id;
        }
      }
      
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    setSelectedQuestion(newQuestion);
      // Save to localStorage immediately
      try {
        const storageKey = getStorageKey();
        const serializable = getSerializableQuestions(updatedQuestions);
        localStorage.setItem(storageKey, JSON.stringify(serializable));
        window.dispatchEvent(new CustomEvent('questionsUpdated', { 
          detail: { projectId, questions: updatedQuestions } 
        }));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    } catch (error) {
      console.error("Error adding question:", error);
      if (error.response?.data) {
        console.error("API Error Details:", error.response.data);
        // Log the full error response to understand validation issues
        if (error.response.data.question_type) {
          console.error("question_type validation error. Valid values might be:", error.response.data.question_type);
        }
      }
      // Log the request payload for debugging
      if (error.config?.data) {
        console.error("Request payload was:", JSON.parse(error.config.data));
      }
      // Still add locally even if API fails
      const updatedQuestions = [...questions, newQuestion];
      setQuestions(updatedQuestions);
      setSelectedQuestion(newQuestion);
      // Save to localStorage even on error
      try {
        const storageKey = getStorageKey();
        const serializable = getSerializableQuestions(updatedQuestions);
        localStorage.setItem(storageKey, JSON.stringify(serializable));
        window.dispatchEvent(new CustomEvent('questionsUpdated', { 
          detail: { projectId, questions: updatedQuestions } 
        }));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
    }
  };

  const handleUpdateQuestion = async (updatedQuestion) => {
    try {
      // Persist welcome question edits only to localStorage (no backend support)
      if (updatedQuestion.type === "welcome") {
        try {
          const welcomeKey = getWelcomeKey();
          const {
            questionText,
            description,
            buttonText,
            timeToComplete,
            numberOfSubmissions,
          } = updatedQuestion;
          localStorage.setItem(
            welcomeKey,
            JSON.stringify({
              questionText,
              description,
              buttonText,
              timeToComplete,
              numberOfSubmissions,
            })
          );
        } catch (e) {
          console.error("Error saving welcome question to localStorage:", e);
        }
      }

      // Update in API if backendId exists (non-welcome questions)
      if (updatedQuestion.backendId && updatedQuestion.type !== "welcome") {
        // Get backend code for this question type (prefer API-provided mapping)
        const typeMeta = questionTypes.find((qt) => qt.type === updatedQuestion.type);
        const backendCode =
          typeMeta?.backendCode || frontendTypeToBackendCode[updatedQuestion.type] || "TXT";
        
        const questionData = {
          project: parseInt(projectId),
          // Ensure variable_name is never blank to satisfy backend validation
          variable_name:
            updatedQuestion.variableName ||
            updatedQuestion.variable_name ||
            (typeof updatedQuestion.id !== "undefined" ? `var_${updatedQuestion.id}` : `var_${Date.now()}`),
          title: updatedQuestion.questionText || updatedQuestion.label || "",
          description: updatedQuestion.description || "",
          is_required: updatedQuestion.required || false,
          is_initial_question: updatedQuestion.isFirst || false,
          question_type: backendCode, // Use backend code
          widget: updatedQuestion.type === "rating" ? "star_rating" : (updatedQuestion.type || "text"),
        };

        await UpdateQuestion(updatedQuestion.backendId, questionData);
      }
      
    const updatedQuestions = questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    setQuestions(updatedQuestions);
    setSelectedQuestion(updatedQuestion);
      // Save to localStorage immediately
      try {
        const storageKey = getStorageKey();
        const serializable = getSerializableQuestions(updatedQuestions);
        localStorage.setItem(storageKey, JSON.stringify(serializable));
        window.dispatchEvent(new CustomEvent('questionsUpdated', { 
          detail: { projectId, questions: updatedQuestions } 
        }));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    } catch (error) {
      console.error("Error updating question:", error);
      // Still update locally even if API fails
      let updatedQuestions;
      if (updatedQuestion.type === "welcome") {
        const otherQuestions = questions.filter(q => q.type !== "welcome");
        updatedQuestions = [updatedQuestion, ...otherQuestions];
      } else {
        updatedQuestions = questions.map((q) =>
          q.id === updatedQuestion.id ? updatedQuestion : q
        );
        const welcomeQ = updatedQuestions.find(q => q.type === "welcome");
        const nonWelcome = updatedQuestions.filter(q => q.type !== "welcome");
        if (welcomeQ) {
          updatedQuestions = [welcomeQ, ...nonWelcome];
        }
      }

      setQuestions(updatedQuestions);
      setSelectedQuestion(updatedQuestion);

      // Save to localStorage even on error
      try {
        const storageKey = getStorageKey();
        const serializable = getSerializableQuestions(updatedQuestions);
        localStorage.setItem(storageKey, JSON.stringify(serializable));
        window.dispatchEvent(new CustomEvent('questionsUpdated', { 
          detail: { projectId, questions: updatedQuestions } 
        }));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
    }
  };


  // Load questions and API data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [loadedQuestions, logicNodesData, conditionsData, variablesData, answersData] = await Promise.all([
          loadQuestions(),
          GetLogicNodes(),
          GetConditions(),
          GetVariables(),
          GetAnswers(),
        ]);
        setQuestions(loadedQuestions);
        setSelectedQuestion(loadedQuestions[0] || defaultWelcomeQuestion);
        setLogicNodes(logicNodesData || []);
        setConditions(conditionsData || []);
        setVariables(variablesData || []);
        setAnswers(answersData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  // Save question and integrate with APIs
  const handleSaveQuestion = async () => {
    if (!selectedQuestion || selectedQuestion.type === "welcome") {
      handleUpdateQuestion(selectedQuestion);
      return;
    }

    try {
      setLoading(true);

      // Get question ID (assuming questions have backend IDs or we need to create them)
      const questionId = selectedQuestion.backendId || selectedQuestion.id;
      const projectIdNum = projectId ? parseInt(projectId) : 1;
      const profileId = 1; // This should come from auth context

      // 1. Create/Update Variable if variableName exists
      if (selectedQuestion.variableName) {
        // Variable will be created when question is saved on backend
        // For now, we just track it
        console.log("Variable name:", selectedQuestion.variableName);
      }

      // 2. Create Logic Node if branching is configured
      if (selectedQuestion.branching && selectedQuestion.branching.targetQuestion) {
        const logicNodeData = {
          question: questionId,
          action_type: "SKIP_TO",
          target_question: selectedQuestion.branching.targetQuestion,
          priority: selectedQuestion.branching.priority || 1,
        };

        try {
          const createdLogicNode = await CreateLogicNode(logicNodeData);
          console.log("Logic node created:", createdLogicNode);

          // 3. Create Condition if branching condition exists
          if (selectedQuestion.branching.condition) {
            const conditionData = {
              logic_node: createdLogicNode.id || createdLogicNode,
              source_question: selectedQuestion.branching.condition.sourceQuestion || questionId,
              operator: selectedQuestion.branching.condition.operator || "EQ",
              value: selectedQuestion.branching.condition.value || "",
              comparison_type: selectedQuestion.branching.condition.comparisonType || "CONSTANT",
              logic_operator: selectedQuestion.branching.condition.logicOperator || "AND",
            };

            try {
              const createdCondition = await CreateCondition(conditionData);
              console.log("Condition created:", createdCondition);
            } catch (conditionError) {
              console.error("Error creating condition:", conditionError);
            }
          }
        } catch (logicError) {
          console.error("Error creating logic node:", logicError);
        }
      }

      // Update local state
      handleUpdateQuestion(selectedQuestion);
      console.log("Question saved:", selectedQuestion);

      // Reload API data
      const [logicNodesData, conditionsData, variablesData] = await Promise.all([
        GetLogicNodes(),
        GetConditions(),
        GetVariables(),
      ]);
      setLogicNodes(logicNodesData || []);
      setConditions(conditionsData || []);
      setVariables(variablesData || []);

      // Find welcome question and select it
      const welcomeQuestion = questions.find(q => q.type === "welcome");
      if (welcomeQuestion) {
        setSelectedQuestion(welcomeQuestion);
      }
    } catch (error) {
      console.error("Error saving question:", error);
    } finally {
      setLoading(false);
    }
  };

  // Submit answer function
  const handleSubmitAnswer = async (questionId, answerValue, projectIdNum = null, profileId = 1) => {
    try {
      const project = projectIdNum || (projectId ? parseInt(projectId) : 1);
      const answerData = {
        question: questionId,
        project: project,
        profile: profileId,
        input: { value: answerValue },
      };

      const submittedAnswer = await SubmitAnswer(answerData);
      console.log("Answer submitted:", submittedAnswer);

      // Reload answers
      const answersData = await GetAnswers();
      setAnswers(answersData || []);

      return submittedAnswer;
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  };

  // Calculate next question function
  const handleCalculateNextQuestion = async (currentQuestionId, projectIdNum = null, profileId = 1) => {
    try {
      const project = projectIdNum || (projectId ? parseInt(projectId) : 1);
      const nextQuestionData = {
        question: currentQuestionId,
        project: project,
        profile: profileId,
      };

      const result = await CalculateNextQuestion(nextQuestionData);
      console.log("Next question calculated:", result);
      return result;
    } catch (error) {
      console.error("Error calculating next question:", error);
      throw error;
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const questionToDelete = questions.find(q => q.id === questionId);

      // Delete from API if backendId exists
      if (questionToDelete?.backendId) {
        await DeleteQuestion(questionToDelete.backendId);
      }
      
    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(updatedQuestions);
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(updatedQuestions[0] || defaultWelcomeQuestion);
    }
      // Save to localStorage immediately
      try {
        const storageKey = getStorageKey();
        const serializable = getSerializableQuestions(updatedQuestions);
        localStorage.setItem(storageKey, JSON.stringify(serializable));
        window.dispatchEvent(new CustomEvent('questionsUpdated', { 
          detail: { projectId, questions: updatedQuestions } 
        }));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      // Still delete locally even if API fails
      const updatedQuestions = questions.filter((q) => q.id !== questionId);
      setQuestions(updatedQuestions);
      if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(updatedQuestions[0] || defaultWelcomeQuestion);
      }
      // Save to localStorage even on error
      try {
        const storageKey = getStorageKey();
        const serializable = getSerializableQuestions(updatedQuestions);
        localStorage.setItem(storageKey, JSON.stringify(serializable));
        window.dispatchEvent(new CustomEvent('questionsUpdated', { 
          detail: { projectId, questions: updatedQuestions } 
        }));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
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
    const handleOptionChange = (index, newOptionText) => {
      const responses = question.responses || [];
      const updated = responses.map((response, idx) =>
        idx === index ? { ...response, option: newOptionText } : response
      );
      handleUpdateQuestion({ ...question, responses: updated });
    };

    // Rating Question Preview
    if (question.type === "rating") {
      const ratingCount = question.ratingCount || 3;
      const ratingShape = question.ratingShape || "star";

      return (
        <Box
          sx={{
            width: "100%",
            maxWidth: "800px",
            mx: "auto",
            px: 2,
            py: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            minHeight: "min-content",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <Box sx={{ mb: 1, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
            {questionNumber} →{" "}
            <InlineEditable
              value={question.questionText || question.label || ""}
              onChange={handleQuestionTextChange}
              placeholder="Your question here. Recall information with @"
              questionNumber={questionNumber}
            />
          </Box>
          <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
            <InlineEditable
              value={question.description}
              onChange={handleDescriptionChange}
              placeholder="Description (optional)"
              questionNumber={questionNumber}
              isDescription={true}
            />
          </Box>
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" sx={{ width: "100%", maxWidth: "100%", flexWrap: "wrap", mt: 2, boxSizing: "border-box" }}>
            {Array.from({ length: ratingCount }).map((_, idx) => (
              <Box
                key={idx}
                data-question-option="true"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Rating star is clickable for preview
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  msUserSelect: "none",
                  "&:hover": {
                    transform: "scale(1.1)",
                    transition: "transform 0.2s",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
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
            width: "100%",
            maxWidth: "800px",
            mx: "auto",
            px: 2,
            py: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            minHeight: "min-content",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <Box sx={{ mb: 1, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
            {questionNumber} →{" "}
            <InlineEditable
              value={question.questionText || question.label || ""}
              onChange={handleQuestionTextChange}
              placeholder="Your question here. Recall information with @"
              questionNumber={questionNumber}
            />
          </Box>
          <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
            <InlineEditable
              value={question.description}
              onChange={handleDescriptionChange}
              placeholder="Description (optional)"
              questionNumber={questionNumber}
              isDescription={true}
            />
          </Box>
          <Stack spacing={2} sx={{ width: "100%", maxWidth: "100%", mt: 2, boxSizing: "border-box" }}>
            {question.responses && question.responses.length > 0 ? (
              question.responses.map((response, idx) => (
                <Paper
                  key={idx}
                  data-question-option="true"
                  elevation={0}
                  onMouseDown={(e) => {
                    // Allow editing, but prevent event bubbling
                    if (e.target.closest('.editable-text')) {
                      e.stopPropagation();
                    }
                  }}
                  sx={{
                    p: 2,
                    border: "1px solid #e5e7eb",
                    borderRadius: 2,
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    "&:hover": {
                      borderColor: "#4a5fd4",
                      backgroundColor: "#fafbff",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "2px solid #d1d5db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0, maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
                      <Typography variant="body2" sx={{ fontSize: 12, color: "#9ca3af", mb: 0.5 }}>
                        {String.fromCharCode(65 + idx)}
                      </Typography>
                      <InlineEditable
                        value={response.option}
                        onChange={(text) => handleOptionChange(idx, text)}
                        placeholder={`Option ${idx + 1}`}
                        questionNumber={null}
                      />
                    </Box>
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

    // Grid Question Preview - Show as Grid Form
    if (question.type === "grid") {
      return (
        <Box
          sx={{
            width: "100%",
            maxWidth: "800px",
            mx: "auto",
            px: 2,
            py: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            minHeight: "min-content",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <Box sx={{ mb: 1, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
            {questionNumber} →{" "}
            <InlineEditable
              value={question.questionText || question.label || ""}
              onChange={handleQuestionTextChange}
              placeholder="Your question here. Recall information with @"
              questionNumber={questionNumber}
            />
          </Box>
          <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden", mb: 2 }}>
            <InlineEditable
              value={question.description}
              onChange={handleDescriptionChange}
              placeholder="Description (optional)"
              questionNumber={questionNumber}
              isDescription={true}
            />
          </Box>
          {question.responses && question.responses.length > 0 ? (
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <Box sx={{ display: "table", width: "100%", minWidth: 600 }}>
                  {/* Header Row */}
                  <Box sx={{ display: "table-row", backgroundColor: "#f9fafb" }}>
                    <Box sx={{ display: "table-cell", p: 2, borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: 14, color: "#374151" }}>
                      Options
                    </Box>
                    {question.responses.map((response, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "table-cell",
                          p: 2,
                          borderBottom: "1px solid #e5e7eb",
                          borderLeft: "1px solid #e5e7eb",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#374151",
                          textAlign: "center",
                          minWidth: 120,
                        }}
                      >
                        <InlineEditable
                          value={response.option}
                          onChange={(text) => handleOptionChange(idx, text)}
                          placeholder={`Option ${idx + 1}`}
                          questionNumber={null}
                        />
                      </Box>
                    ))}
                  </Box>
                  {/* Data Rows - Example rows for grid form */}
                  {[1, 2, 3].map((rowIdx) => (
                    <Box key={rowIdx} sx={{ display: "table-row", "&:hover": { backgroundColor: "#fafbff" } }}>
                      <Box sx={{ display: "table-cell", p: 2, borderBottom: "1px solid #e5e7eb", fontSize: 14, color: "#6b7280" }}>
                        Row {rowIdx}
                      </Box>
                      {question.responses.map((_, colIdx) => (
                        <Box
                          key={colIdx}
                          sx={{
                            display: "table-cell",
                            p: 2,
                            borderBottom: "1px solid #e5e7eb",
                            borderLeft: "1px solid #e5e7eb",
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
                                backgroundColor: "#f0f9ff",
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "#9ca3af", textAlign: "center", mt: 2 }}>
              No options added yet. Add options to create grid form.
            </Typography>
          )}
        </Box>
      );
    }

    // Default Preview for other question types
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          px: 2,
          py: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: "min-content",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <Box sx={{ mb: 1, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
          {questionNumber} →{" "}
          <InlineEditable
            value={question.questionText}
            onChange={handleQuestionTextChange}
            placeholder="Your question here. Recall information with @"
            questionNumber={questionNumber}
          />
        </Box>
        <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
          <InlineEditable
            value={question.description}
            onChange={handleDescriptionChange}
            placeholder="Description (optional)"
            questionNumber={questionNumber}
            isDescription={true}
          />
        </Box>
        {question.responses && question.responses.length > 0 && (
          <Stack spacing={2} sx={{ width: "100%", maxWidth: "100%", mt: 2, boxSizing: "border-box" }}>
            {question.responses.map((response, idx) => (
              <Paper
                key={idx}
                data-question-option="true"
                elevation={0}
                onMouseDown={(e) => {
                  // Allow editing, but prevent event bubbling
                  if (e.target.closest('.editable-text')) {
                    e.stopPropagation();
                  }
                }}
                sx={{
                  p: 2,
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  "&:hover": {
                    borderColor: "#4a5fd4",
                    backgroundColor: "#fafbff",
                  },
                }}
              >
                <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
                  <InlineEditable
                    value={response.option}
                    onChange={(text) => handleOptionChange(idx, text)}
                    placeholder={`Option ${idx + 1}`}
                    questionNumber={null}
                  />
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f9fafb", overflow: "hidden" }}>
      {/* Top Navigation Bar */}
      <Box
        sx={{
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fff",
          px: 3,
          py: 1.5,
          flexShrink: 0,
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
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden" }}>
        <WorkflowView 
          questions={questions} 
          logicNodes={logicNodes}
          conditions={conditions}
          variables={variables}
          answers={answers}
            onQuestionsUpdate={setQuestions}
          />
          <Box
            sx={{
              p: 2,
              backgroundColor: "#fff",
              flexShrink: 0,
              borderTop: "1px solid #e5e7eb",
              boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
              zIndex: 5,
            }}
          >
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
      ) : activeTopTab === "Content" ? (
        <Box
          sx={{
            display: "flex",
            flex: 1,
            overflowX: "auto",
            overflowY: "hidden",
            minWidth: 0,
            minHeight: 0,
            height: "100%",
            width: "100%",
            position: "relative",
            "&::-webkit-scrollbar": {
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c1c1c1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#a8a8a8",
            },
          }}
        >

          {/* Left Sidebar */}
          <Box
            sx={{
              width: { xs: 240, sm: 260, md: 280 },
              minWidth: { xs: 240, sm: 260, md: 280 },
              flexShrink: 0,
              borderRight: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              height: "100%",
            }}
          >
            {/* Add Content Button */}
            <Box sx={{ p: 2, flexShrink: 0, borderBottom: "1px solid #f3f4f6" }}>
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

            {/* Questions List - Scrollable Area */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                px: 1.5,
                py: 1.5,
                minHeight: 0,
                "&::-webkit-scrollbar": {
                  width: "10px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f9fafb",
                  borderRadius: "5px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#d1d5db",
                  borderRadius: "5px",
                  "&:hover": {
                    background: "#9ca3af",
                  },
                },
                scrollbarWidth: "thin",
                scrollbarColor: "#d1d5db #f9fafb",
              }}
            >
              <Stack spacing={0.5}>
                {questions.map((question, index) => {
                  const isSelected = selectedQuestion?.id === question.id;
                  const allTypes = [...defaultQuestionComponents];
                  const component = allTypes.find((c) => c.type === question.type);
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
                        <PlayArrow sx={{ color: "#3b82f6", fontSize: 20, mt: 0.5, flexShrink: 0 }} />
                      ) : (
                        <Box sx={{ color: isSelected ? "#3b82f6" : "#6b7280", mt: 0.5, flexShrink: 0 }}>
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
                            ? question.questionText || "Hello, Thanks for joining QuantAi...."
                            : (() => {
                              const text = question.questionText || question.label || "";
                              const cleanText = text.replace(/<[^>]*>/g, "").trim();
                              if (cleanText) {
                                return cleanText.length > 40 ? cleanText.substring(0, 40) + "..." : cleanText;
                              }
                              return `Question ${questionNumber !== null ? questionNumber + 1 : ""}`;
                            })()}
                        </Typography>
                      </Box>
                      {!isWelcome && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(question.id);
                          }}
                          sx={{ mt: -0.5, opacity: 0.6, "&:hover": { opacity: 1 }, flexShrink: 0 }}
                        >
                          <Delete fontSize="small" sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            {/* Endings Section */}

          </Box>

          {/* Main Content Area */}
          <Box sx={{ flex: "1 1 auto", display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#fafbff", minWidth: { xs: 300, sm: 400, md: "auto" }, maxWidth: "100%", minHeight: 0 }}>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                px: 2,
                py: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                minHeight: 0,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                position: "relative",
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#c1c1c1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#a8a8a8",
                },
              }}
            >
              {selectedQuestion ? (
                <>
                  <Box sx={{ width: "100%", maxWidth: "800px", boxSizing: "border-box", overflow: "hidden", minWidth: 0 }}>
                    {renderQuestionPreview(selectedQuestion)}
                  </Box>
                  {selectedQuestion.type !== "welcome" && (
                    <Box sx={{ mt: 4, width: "100%", maxWidth: "800px", display: "flex", justifyContent: "center", boxSizing: "border-box", flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        onClick={handleSaveQuestion}
                        sx={{
                          px: 6,
                          py: 1.5,
                          textTransform: "none",
                          backgroundColor: "#4a5fd4",
                          fontWeight: 600,
                          "&:hover": {
                            backgroundColor: "#3a4fc4",
                          },
                        }}
                      >
                        Save Question
                      </Button>
                    </Box>
                  )}
                </>
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
            <Box
              sx={{
                p: 2,
                backgroundColor: "#fff",
                flexShrink: 0,
                borderTop: "1px solid #e5e7eb",
                boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
                zIndex: 5,
              }}
            >

            </Box>
          </Box>

          {/* Right Sidebar - Settings Panel */}
          <Box
            sx={{
              width: { xs: 280, sm: 300, md: 320 },
              minWidth: { xs: 280, sm: 300, md: 320 },
              maxWidth: { xs: 280, sm: 300, md: 320 },
              flexShrink: 0,
              borderLeft: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              height: "100%",
              boxSizing: "border-box",
              position: "relative",
            }}
          >

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                p: 2,
                minHeight: 0,
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#c1c1c1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#a8a8a8",
                },
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
        questionTypes={questionTypes}
      />
    </Box>
  );
};

export default FormBuilder;

