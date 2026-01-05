import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Typography,
  Dialog,
  MenuItem,
  Select,
} from "@mui/material";
import { Link } from "react-router-dom";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { ListUser, DeleteUser, UpdateRole } from "../../API/Services/services";

/* 🔑 ROLE LABEL MAP */
const ROLE_LABELS = {
  AD: "Admin",
  SU: "SuperUser / Developer",
  AM: "Admin Manager",
  CL: "Vendor",
  CM: "Vendor Manager",
  AU: "Audience",
};

export default function UserTable() {
  const [user, setUser] = useState([]);
  const [search, setSearch] = useState("");

  /* 🔴 DELETE MODAL */
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  /* 🔵 UPDATE ROLE MODAL */
  const [openRole, setOpenRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  /* 🔴 Open Delete */
  const handleDeleteClick = (id) => {
    setSelectedUserId(id);
    setOpenDelete(true);
  };

  /* ❌ Close Delete */
  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedUserId(null);
  };

  /* ✅ Confirm Delete */
  const handleConfirmDelete = async () => {
    try {
      await DeleteUser(selectedUserId);
      setUser((prev) => prev.filter((u) => u.id !== selectedUserId));
      handleCloseDelete();
    } catch (error) {
      console.error(error);
    }
  };

  /* 🔵 Open Role Modal */
  const handleOpenRole = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.profile_type);
    setOpenRole(true);
  };

  /* ❌ Close Role Modal */
  const handleCloseRole = () => {
    setOpenRole(false);
    setSelectedUser(null);
    setSelectedRole("");
  };

  /* ✅ Confirm Role Update */
  const handleConfirmRoleUpdate = async () => {
    try {
      await UpdateRole(selectedUser.id, {
        profile_type: selectedRole,
      });

      setUser((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, profile_type: selectedRole }
            : u
        )
      );

      handleCloseRole();
    } catch (error) {
      console.error("Role update failed:", error);
    }
  };

  /* 🔄 FETCH USERS */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await ListUser();
        setUser(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  /* 🔍 SEARCH */
  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();
    return user.filter(
      (u) =>
        u.first_name?.toLowerCase().includes(query) ||
        u.last_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
    );
  }, [user, search]);

  return (
    <Box sx={{ p: 4 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: 28, color: "#27356eff" }}>
          User Management
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Link to="/users/new-add">
            <Button sx={{ border: "1px solid #27356eff", color: "#27356eff" }}>
              Add User
            </Button>
          </Link>
        </Box>
      </Box>

      {/* TABLE */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#211f48ff" }}>
              {[
                "Name",
                "Email",
                "Role",
                "Joining Date",
                "Last Login",
                "Update Role",
                "Action",
              ].map((h) => (
                <TableCell key={h} sx={{ color: "#fff" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.length ? (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    {u.first_name} {u.last_name}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>

                  {/* ✅ ROLE NAME DISPLAY */}
                  <TableCell>
                    {ROLE_LABELS[u.profile_type] || "-"}
                  </TableCell>

                  <TableCell>{u.date_joined || "-"}</TableCell>
                  <TableCell>{u.last_login || "-"}</TableCell>

                  {/* UPDATE ROLE */}
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenRole(u)}
                      sx={{
                        border: "1px solid #03106cff",
                        color: "#0d173aff",
                      }}
                    >
                      Update Role
                    </Button>
                  </TableCell>

                  {/* DELETE */}
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDeleteClick(u.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🔴 DELETE MODAL */}
      <Dialog open={openDelete} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
        <Box sx={{ textAlign: "center", p: 3 }}>
          <WarningAmberRoundedIcon sx={{ fontSize: 60, color: "#d32f2f" }} />
          <Typography fontSize={22} fontWeight={600}>
            Delete User?
          </Typography>
          <Typography color="text.secondary" mb={3}>
            This action cannot be undone.
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={handleCloseDelete}>
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* 🔵 UPDATE ROLE MODAL */}
      <Dialog open={openRole} onClose={handleCloseRole} maxWidth="xs" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography fontSize={20} fontWeight={600} mb={2}>
            Update User Role
          </Typography>

          <Typography fontSize={14} mb={1}>
            {selectedUser?.first_name} {selectedUser?.last_name} —{" "}
            {ROLE_LABELS[selectedUser?.profile_type]}
          </Typography>

          <Select
            fullWidth
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            sx={{ mb: 3 }}
          >
            <MenuItem value="AD">Admin</MenuItem>
            <MenuItem value="SU">SuperUser / Developer</MenuItem>
            <MenuItem value="AM">Admin Manager</MenuItem>
            <MenuItem value="CL">Vendor</MenuItem>
            <MenuItem value="CM">Vendor Manager</MenuItem>
            <MenuItem value="AU">Audience</MenuItem>
          </Select>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={handleCloseRole}>
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleConfirmRoleUpdate}
            >
              Update
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
