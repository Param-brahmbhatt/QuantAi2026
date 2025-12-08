import React, { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ReceiptLong, Search, Download, ArrowDownward, ArrowUpward } from "@mui/icons-material";

const STATUS_COLORS = {
  Completed: "success",
  Pending: "warning",
  Failed: "error",
};

const Transactions = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [isAdmin] = useState(true);

  // --- Sample Transactions ---
  const sampleTx = [
    { id: "TX-001", date: "2025-08-01", amount: 120.5, status: "Completed", comments: "Payout" },
    { id: "TX-002", date: "2025-08-03", amount: 80, status: "Pending", comments: "Processing" },
    { id: "TX-003", date: "2025-08-05", amount: 45.75, status: "Failed", comments: "Bank issue" },
    { id: "TX-004", date: "2025-08-08", amount: 200.0, status: "Completed", comments: "Bonus" },
    { id: "TX-005", date: "2025-08-09", amount: 60.25, status: "Completed", comments: "Survey" },
  ];

  const filteredRows = useMemo(() => {
    return sampleTx.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchesQuery = !q || r.id.toLowerCase().includes(q) || r.comments.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || r.status === statusFilter;
      const afterFrom = !from || new Date(r.date) >= new Date(from);
      const beforeTo = !to || new Date(r.date) <= new Date(to);
      return matchesQuery && matchesStatus && afterFrom && beforeTo;
    });
  }, [search, statusFilter, from, to]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows];
    rows.sort((a, b) => {
      const factor = order === "asc" ? 1 : -1;
      if (orderBy === "date") {
        return (new Date(a.date) - new Date(b.date)) * factor;
      }
      if (orderBy === "amount") {
        return (a.amount - b.amount) * factor;
      }
      return 0;
    });
    return rows;
  }, [filteredRows, order, orderBy]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, page, rowsPerPage]);

  const handleRequestSort = (key) => {
    if (orderBy === key) {
      setOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(key);
      setOrder("asc");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1a237e 0%, #0d1540 100%)",
          color: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <ReceiptLong sx={{ fontSize: 42 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
              Transactions
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>Review your rewards and payout history</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Amount", value: "$515.75", color: "primary.main" },
          { label: "Completed", value: "3", color: "success.main" },
          { label: "Pending Amount", value: "$80.00", color: "warning.main" },
          { label: "Failed", value: "1", color: "error.main" },
        ].map((m, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "white",
                textAlign: "center",
                minHeight: 80,
                width: 180,
                flexDirection: "column",
                justifyContent: "center",
                "&:hover": { boxShadow: 6, transform: "translateY(-2px)", transition: "0.2s" },
              }}
            >
              <Typography variant="overline" sx={{ color: m.color, fontWeight: 700 }}>
                {m.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                {m.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Toolbar */}
      <Paper elevation={2} sx={{ borderRadius: 3, mb: 3, p: 2.5, bgcolor: "white" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by ID or comments"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: "primary.main" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              size="small" // ✅ matches textfield height
              color="primary"
              exclusive
              value={statusFilter || null}
              onChange={(_, val) => setStatusFilter(val || "")}
              sx={{ flexWrap: "wrap" }}
            >
              <ToggleButton value="">All</ToggleButton>
              <ToggleButton value="Completed">Completed</ToggleButton>
              <ToggleButton value="Pending">Pending</ToggleButton>
              <ToggleButton value="Failed">Failed</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="To"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md="auto" sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
            <Tooltip title="Export CSV">
              <IconButton
                color="primary"
                sx={{
                  border: "1px solid",
                  borderColor: "primary.main",
                  borderRadius: 2,
                  width: 40,
                  height: 40,
                }}
              >
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>


      {/* Transactions Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f7fa" }}>
                <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                <TableCell
                  onClick={() => handleRequestSort("date")}
                  sx={{ cursor: "pointer", fontWeight: 700 }}
                >
                  Date {orderBy === "date" && (order === "asc" ? <ArrowUpward fontSize="inherit" /> : <ArrowDownward fontSize="inherit" />)}
                </TableCell>
                <TableCell
                  align="right"
                  onClick={() => handleRequestSort("amount")}
                  sx={{ cursor: "pointer", fontWeight: 700 }}
                >
                  Amount {orderBy === "amount" && (order === "asc" ? <ArrowUpward fontSize="inherit" /> : <ArrowDownward fontSize="inherit" />)}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Comments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedRows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    bgcolor: idx % 2 === 0 ? "white" : "#fafafa",
                    "&:hover": { bgcolor: "#e3e7f7" },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{row.id}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell align="right">${row.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={STATUS_COLORS[row.status]} size="small" />
                  </TableCell>
                  <TableCell>{row.comments}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[10]}
          count={sortedRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
        />
      </Paper>
    </Container>
  );
};

export default Transactions;
