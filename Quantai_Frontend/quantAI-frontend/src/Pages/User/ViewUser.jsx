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
} from "@mui/material";
import { Link } from "react-router-dom";
import { ListUser, DeleteUser } from "../../API/Services/services";

export default function UserTable() {
  const [user, setUser] = useState([]);
  const [search, setSearch] = useState("");

  const handleRoleUpdate = (id) => {
    setUser((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, role: u.role === "Admin" ? "User" : "Admin" }
          : u
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await DeleteUser(id);
      setUser((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const users = async () => {
      try {
        const response = await ListUser();
        setUser(response);
      } catch (error) {
        console.log(error);
      }
    };
    users();
  }, []);

  /* 🔍 Search Filter */
  const filteredUsers = useMemo(() => {
    return user.filter((u) => {
      const query = search.toLowerCase();
      return (
        u.first_name?.toLowerCase().includes(query) ||
        u.last_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      );
    });
  }, [user, search]);

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: "28px", color: "#27356eff" }}>
          User Management
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Link to="/users/new-add">
            <Button
              sx={{
                border: "1px solid #27356eff",
                color: "#27356eff",
              }}
            >
              Add User
            </Button>
          </Link>
        </Box>
      </Box>

      {/* User Table */}
      <TableContainer sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#211f48ff" }}>
              <TableCell sx={{ color: "#fff" }}>Name</TableCell>
              <TableCell sx={{ color: "#fff" }}>Email</TableCell>
              <TableCell sx={{ color: "#fff" }}>Role</TableCell>
              <TableCell sx={{ color: "#fff" }}>Joining Date</TableCell>
              <TableCell sx={{ color: "#fff" }}>End Date</TableCell>
              <TableCell sx={{ color: "#fff" }}>Update Role</TableCell>
              <TableCell sx={{ color: "#fff" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    {u.first_name} {u.last_name}
                  </TableCell>

                  <TableCell>{u.email}</TableCell>

                  <TableCell>{u.role_display || "-"}</TableCell>

                  <TableCell>{u.date_joined}</TableCell>

                  <TableCell>{u.last_login || "-"}</TableCell>

                  {/* Update Role */}
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleRoleUpdate(u.id)}
                      sx={{
                        textTransform: "none",
                        borderColor: "#171260ff",
                        color: "#171260ff",
                        "&:hover": {
                          backgroundColor: "#171260ff",
                          color: "#fff",
                        },
                      }}
                    >
                      Make {u.role === "Admin" ? "User" : "Admin"}
                    </Button>
                  </TableCell>

                  {/* Delete */}
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(u.id)}
                      sx={{ textTransform: "none" }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
