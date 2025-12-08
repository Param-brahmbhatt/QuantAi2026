import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Switch,
    IconButton,
    TablePagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddRedemptionDialog from "./AddRedemption";

const RedemptionSettings = () => {
    // Dummy data (more than 10 to test pagination)
    const rows = [
        {
            name: "Monthly Redemption",
            minGap: 30,
            minEligibility: "1000 points",
            maxEligibility: "5000 points",
            share: "20%",
            createdOn: "2025-11-01",
            profilingOnly: false,
            active: true,
        },
        {
            name: "Quarterly Bonus",
            minGap: 90,
            minEligibility: "5000 points",
            maxEligibility: "15000 points",
            share: "25%",
            createdOn: "2025-10-15",
            profilingOnly: true,
            active: false,
        },
        {
            name: "Festival Offer",
            minGap: 15,
            minEligibility: "500 points",
            maxEligibility: "3000 points",
            share: "10%",
            createdOn: "2025-09-30",
            profilingOnly: false,
            active: true,
        },
        // add more dummy rows
        ...Array.from({ length: 15 }, (_, i) => ({
            name: `Redemption Plan ${i + 4}`,
            minGap: 20 + i,
            minEligibility: `${(i + 1) * 1000} points`,
            maxEligibility: `${(i + 2) * 2000} points`,
            share: `${10 + i}%`,
            createdOn: "2025-08-20",
            profilingOnly: i % 2 === 0,
            active: i % 3 === 0,
        })),
    ];

    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);

    const handleAddRedemption = (newData) => {
        console.log("New Redemption:", newData);
        // You can push to rows array or handle API call here
    };


    // Handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Pagination logic
    const paginatedRows = rows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <>
            <Box sx={{ p: 3 }}>
                {/* Header Section */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Redemptions Settings
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setOpenDialog(true)}
                        sx={{
                            textTransform: "none",
                            background: "linear-gradient(to right, #3b82f6, #2563eb)",
                            borderRadius: "8px",
                            px: 2.5,
                            py: 1,
                            fontWeight: 500,
                            "&:hover": {
                                background: "linear-gradient(to right, #2563eb, #1d4ed8)",
                            },
                        }}
                    >
                        + New Redemptions
                    </Button>
                </Box>

                {/* Table Section */}
                <Paper sx={{ width: "100%", overflow: "auto" }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#f9fafb" }}>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Min redemption gap (in days)</TableCell>
                                    <TableCell>Min eligibility for redemption</TableCell>
                                    <TableCell>Max eligibility for redemption</TableCell>
                                    <TableCell>Redemption share from profiling rewards</TableCell>
                                    <TableCell>Created On</TableCell>
                                    <TableCell>Allow only profiling redemption</TableCell>
                                    <TableCell>Active</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginatedRows.map((row, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.minGap}</TableCell>
                                        <TableCell>{row.minEligibility}</TableCell>
                                        <TableCell>{row.maxEligibility}</TableCell>
                                        <TableCell>{row.share}</TableCell>
                                        <TableCell>{row.createdOn}</TableCell>
                                        <TableCell>
                                            {row.profilingOnly ? (
                                                <Chip label="Yes" color="primary" size="small" />
                                            ) : (
                                                <Chip label="No" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Switch checked={row.active} color="success" />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="primary" size="small">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton color="error" size="small">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {paginatedRows.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            align="center"
                                            sx={{ py: 4, color: "text.secondary" }}
                                        >
                                            No Rows To Show
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Rows per page:"
                    />
                </Paper>
            </Box>

            <AddRedemptionDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSubmit={handleAddRedemption}
            />

        </>
    );
};

export default RedemptionSettings;
