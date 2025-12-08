import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

// Sample master data - in a real app, this would come from an API
const initialMasterData = [
  {
    id: 1,
    name: "Survey Categories",
    type: "Category",
    description: "Main categories for survey classification",
    status: "Active",
  },
  {
    id: 2,
    name: "User Roles",
    type: "Variable",
    description: "Available user roles in the system",
    status: "Active",
  },
  {
    id: 3,
    name: "Project Statuses",
    type: "Category",
    description: "Different project status values",
    status: "Active",
  },
  {
    id: 4,
    name: "Reward Types",
    type: "Category",
    description: "Types of rewards available",
    status: "Inactive",
  },
  {
    id: 5,
    name: "Language Codes",
    type: "Variable",
    description: "Supported language codes",
    status: "Active",
  },
];

const MasterDataPage = () => {
  const { isAdmin } = useAuth();
  const [masterData, setMasterData] = useState(initialMasterData);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    status: "Active",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  // Check if user has admin access
  if (!isAdmin()) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: "auto" }}>
          Access Denied. This page is only available to administrators.
        </Alert>
      </Box>
    );
  }

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        type: item.type,
        description: item.description,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        type: "",
        description: "",
        status: "Active",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({
      name: "",
      type: "",
      description: "",
      status: "Active",
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingItem) {
      // Update existing item
      setMasterData(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...item, ...formData }
            : item
        )
      );
      setSnackbar({
        open: true,
        message: "Master data updated successfully!",
        severity: "success",
      });
    } else {
      // Add new item
      const newItem = {
        id: Math.max(...masterData.map(item => item.id)) + 1,
        ...formData,
      };
      setMasterData(prev => [...prev, newItem]);
      setSnackbar({
        open: true,
        message: "Master data added successfully!",
        severity: "success",
      });
    }
    
    handleCloseDialog();
  };

  const handleDelete = (item) => {
    setDeleteDialog({ open: true, item });
  };

  const confirmDelete = () => {
    setMasterData(prev => prev.filter(item => item.id !== deleteDialog.item.id));
    setDeleteDialog({ open: false, item: null });
    setSnackbar({
      open: true,
      message: "Master data deleted successfully!",
      severity: "success",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <StorageIcon sx={{ fontSize: 32, color: "#171260ff" }} />
          <Typography
            variant="h4"
            sx={{
              margin: 0,
              color: "#171260ff",
              fontFamily: "sans-serif",
              fontWeight: 600,
            }}
          >
            Master Data Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: "#0c2a58ff",
            "&:hover": { backgroundColor: "#11284cff" },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            py: 1.5,
          }}
        >
          Add Master Data
        </Button>
      </Box>

      {/* Master Data Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#211f48ff" }}>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {masterData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.type}
                      sx={{
                        backgroundColor: "#e3f2fd",
                        color: "#0d47a1",
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      sx={{
                        backgroundColor:
                          item.status === "Active" ? "#c8e6c9" : "#ffcdd2",
                        color:
                          item.status === "Active" ? "#2e7d32" : "#c62828",
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(item)}
                          sx={{ color: "#1976d2" }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item)}
                          sx={{ color: "#d32f2f" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={masterData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: "#142b4fff", fontWeight: 600 }}>
          {editingItem ? "Edit Master Data" : "Add New Master Data"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                sx={fieldStyles}
              />
              <TextField
                select
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                fullWidth
                required
                sx={fieldStyles}
              >
                <MenuItem value="Category">Category</MenuItem>
                <MenuItem value="Variable">Variable</MenuItem>
                <MenuItem value="Configuration">Configuration</MenuItem>
                <MenuItem value="Reference">Reference</MenuItem>
              </TextField>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                sx={fieldStyles}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status === "Active"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.checked ? "Active" : "Inactive",
                      })
                    }
                    color="primary"
                  />
                }
                label="Active Status"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: "#666",
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#0c2a58ff",
                "&:hover": { backgroundColor: "#11284cff" },
                textTransform: "none",
                fontWeight: 500,
                px: 3,
              }}
            >
              {editingItem ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: "#d32f2f", fontWeight: 600 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.item?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, item: null })}
            sx={{
              color: "#666",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              fontWeight: 500,
              px: 3,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MasterDataPage;
