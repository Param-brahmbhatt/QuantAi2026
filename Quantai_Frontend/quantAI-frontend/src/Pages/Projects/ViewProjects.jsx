import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Chip,
  Avatar,
  FormControl,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Star,
  EmojiEvents,
  FilterList,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { GetProjectList } from "../../API/Services/services";

const DARK_BLUE = "#14243c";

const ProjectListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const getProject = async () => {
      try {
        setLoading(true);
        const response = await GetProjectList();
        const data =
          response?.results ||
          response?.data ||
          response?.projects ||
          (Array.isArray(response) ? response : []);
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    getProject();
  }, []);

  const getStatusColor = (status) => {
    if (status === "Completed") return "success";
    if (status === "Planning") return "warning";
    return "default";
  };

  const filteredProjects = projects.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      (!s ||
        (p.name || "").toLowerCase().includes(s) ||
        (p.project_category || "").toLowerCase().includes(s)) &&
      (statusFilter === "all" || p.status === statusFilter) &&
      (priorityFilter === "all" || p.priority === priorityFilter) &&
      (teamFilter === "all" || p.team === teamFilter)
    );
  });

  const handleOpen = (project) => {
    setSelectedProject(project);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProject(null);
  };

  const handleDeactivate = () => {
    setProjects((prev) => prev.filter((p) => p.id !== selectedProject?.id));
    handleClose();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 1.5, sm: 3, md: 4, lg: 6 },
        py: 2,
        maxWidth: "1600px",
        mx: "auto",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          p: 3,
          borderRadius: "14px",
          backgroundColor: "#222857",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#fff",
              fontSize: { xs: "20px", sm: "24px", lg: "28px" },
              fontWeight: 600,
            }}
          >
            Projects
          </Typography>
          <Typography sx={{ color: "#ddd", fontSize: "13px" }}>
            Manage and track all your projects
          </Typography>
        </Box>

        <Link to="/projects/Add-Project" style={{ textDecoration: "none" }}>
          <Button
            sx={{
              border: "1px solid #fff",
              color: "#fff",
              textTransform: "none",
              fontSize: "14px",
              px: 3,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
            }}
          >
            + Add New Project
          </Button>
        </Link>
      </Box>

      {/* FILTERS */}
      <Card sx={{ p: 3, borderRadius: "14px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>

          {[{
            value: statusFilter,
            set: setStatusFilter,
            label: "All Status",
            options: ["Planning", "In Progress", "Completed"]
          }, {
            value: priorityFilter,
            set: setPriorityFilter,
            label: "All Priority",
            options: ["High", "Medium", "Low"]
          }, {
            value: teamFilter,
            set: setTeamFilter,
            label: "All Teams",
            options: ["Design", "Development", "Analytics", "Security"]
          }].map((f, i) => (
            <Grid key={i} item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <Select
                  size="small"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                >
                  <MenuItem value="all">{f.label}</MenuItem>
                  {f.options.map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* RESULTS */}
      <Typography sx={{ mt: 2 }} color="text.secondary">
        Showing <b>{filteredProjects.length}</b> of{" "}
        <b>{projects.length}</b> projects
      </Typography>

      {/* STATES */}
      {loading && (
        <Card sx={{ p: 6, mt: 3, textAlign: "center" }}>
          <Typography>Loading projects...</Typography>
        </Card>
      )}

      {error && !loading && (
        <Card sx={{ p: 6, mt: 3, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
        </Card>
      )}

      {/* PROJECT LIST */}
      {!loading && !error && (
        <Stack spacing={3} mt={3}>
          {filteredProjects.map((p) => (
            <Card key={p.id} sx={{ borderRadius: "14px" }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 36, sm: 44 },
                        height: { xs: 36, sm: 44 },
                        bgcolor: "#e8f0ff",
                        color: "#000",
                      }}
                    >
                      {p.id}
                    </Avatar>

                    <Box flex={1}>
                      <Typography fontWeight={500} sx={{ fontSize: "18px" }}>
                        {p.title || "Unnamed Project"}
                      </Typography>

                      <Typography fontSize="12px" color="text.secondary">
                        {p.code || "No Category"}
                      </Typography>

                      {p.mode && (
                        <Chip
                          size="small"
                          label={p.mode}
                          // icon={<EmojiEvents />}
                          sx={{ mt: 1, fontSize: "10px" }}
                        />
                      )}
                      <Box mt={3}>
                        <Typography fontSize="12px" color="text.secondary">
                          Project Start TIme: {p.start_time || "No Category"}
                        </Typography>
                        <Typography fontSize="12px" color="text.secondary">
                          Project End TIme:  {p.end_time || "No Category"}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack
                      direction={{ xs: "row", sm: "column" }}
                      spacing={1.5}
                      width={{ xs: "100%", sm: "160px" }}
                    >
                      <Link to={`/projects/${p.id}/edit`} style={{ textDecoration: "none" }}>
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{ bgcolor: DARK_BLUE, fontSize: "11px" }}
                        >
                          View Details
                        </Button>
                      </Link>

                      <Button
                        fullWidth
                        onClick={() => handleOpen(p)}
                        sx={{
                          border: "1px solid #f71313",
                          color: "#f71313",
                          fontSize: "11px",
                        }}
                      >
                        Delete Project
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}

          {filteredProjects.length === 0 && (
            <Card sx={{ p: 6, textAlign: "center" }}>
              <FilterList sx={{ fontSize: 50, color: "#ccc" }} />
              <Typography>No projects found</Typography>
            </Card>
          )}
        </Stack>
      )}

      {/* DIALOG */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Deactivate Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate{" "}
            <b>{selectedProject?.name}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#f71313" }}
            onClick={handleDeactivate}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectListPage;
