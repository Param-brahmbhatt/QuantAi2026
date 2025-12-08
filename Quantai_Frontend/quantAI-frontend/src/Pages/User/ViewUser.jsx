import React from "react";
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
} from "@mui/material";

const users = [
  { id: 1, name: "Mitesh Prajapati", email: "miteshjp207@gmail.com", role: "Admin", status: "Active" },
  { id: 2, name: "Param Barot", email: "samb203@gmail.com", role: "User", status: "Inactive" },
  { id: 3, name: "Dev Behl", email: "chikubehl2003@gmail.com", role: "User", status: "Active" },
];

export default function UserTable() {
  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, color: "#171260ff", fontFamily: "sans-serif" }}>User Management</h2>
      </Box>

      {/* User Table */}
      <TableContainer
        sx={{
          borderRadius: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#211f48ff" }}>
              <TableCell sx={{  color: "#fff" }}>Name</TableCell>
              <TableCell sx={{  color: "#fff" }}>Email</TableCell>
              <TableCell sx={{  color: "#fff" }}>Role</TableCell>
              <TableCell sx={{  color: "#fff" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    sx={{
                      backgroundColor:
                        user.role === "Admin" ? "#bbdefb" : "#e3f2fd",
                      color: "#0d47a1",
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    sx={{
                      backgroundColor:
                        user.status === "Active" ? "#c8e6c9" : "#ffcdd2",
                      color:
                        user.status === "Active" ? "#2e7d32" : "#c62828",
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
