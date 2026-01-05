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
} from "@mui/material";
import {
  Star,
  TrendingUp,
  Person,
  EmojiEvents,
  FilterList,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { GetProjectList } from "../../API/Services/services";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const DARK_BLUE = "#14243cff";


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
        setError(null);
        const response = await GetProjectList();
        let projectList = [];
        if (Array.isArray(response)) {
          projectList = response;
        } else if (response && typeof response === 'object') {
          if (response.results && Array.isArray(response.results)) {
            projectList = response.results;
          } else if (response.data && Array.isArray(response.data)) {
            projectList = response.data;
          } else if (response.projects && Array.isArray(response.projects)) {
            projectList = response.projects;
          } else {
            projectList = Object.values(response).filter(item => Array.isArray(item))[0] || [];
          }
        }
        if (!Array.isArray(projectList)) {
          console.warn("Project list is not an array, converting...", projectList);
          projectList = [];
        }
        setProjects(projectList);
      } catch (error) {
        console.error("Error fetching projects:", error);
        console.error("Error details:", error?.response?.data || error);
        setError(error?.response?.data?.detail || error?.response?.data?.message || error?.message || "Failed to fetch projects");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    getProject();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "default";
      case "Planning":
        return "warning";
      default:
        return "default";
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<Star key={i} color="warning" />);
      else if (i === full && half)
        stars.push(<Star key={i} color="warning" sx={{ opacity: 0.5 }} />);
      else stars.push(<Star key={i} sx={{ color: "#ddd" }} />);
    }
    return stars;
  };

  const filteredProjects = projects.filter((p) => {
    if (!p || typeof p !== 'object') return false;

    const s = searchTerm.toLowerCase();
    const projectName = (p.name || p.title || p.project_name || "").toString().toLowerCase();
    const projectCategory = (p.category || p.type || "").toString().toLowerCase();
    const projectStatus = (p.status || p.project_status || "").toString();
    const projectPriority = (p.priority || "").toString();
    const projectTeam = (p.team || p.team_name || "").toString();

    const matchesSearch = !s || projectName.includes(s) || projectCategory.includes(s);
    const matchesStatus = statusFilter === "all" || projectStatus === statusFilter;
    const matchesPriority = priorityFilter === "all" || projectPriority === priorityFilter;
    const matchesTeam = teamFilter === "all" || projectTeam === teamFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesTeam;
  });

  const handleOpen = (project) => {
    setSelectedProject(project);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProject(null);
  };

  const handleDeactivate = async () => {
    try {
      console.log("Deactivating project:", selectedProject?.id);
      setProjects((prev) =>
        prev.filter((p) => p.id !== selectedProject.id)
      );

      handleClose();
    } catch (err) {
      console.error("Deactivate failed", err);
    }
  };


  return (
    <>
      <Box sx={{ minHeight: "100vh" }}>
        {/* HEADER */}
        <Box
          sx={{
            bgcolor: DARK_BLUE,
            color: "white",
            py: 3,
            px: 3,
          }}
        >
          <Typography variant="h4">
            Projects
          </Typography>
          <Typography>Manage and track all your projects</Typography><br /><br />
          <Link to="/projects/Add-Project">
            <Button
              sx={{
                border: "1px solid #d2d0d0ff",
                color: "#d2d0d0ff"
              }}
            >
              + Add New Project
            </Button>
          </Link>
        </Box>


        {/* FILTERS */}
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, p: 2 }}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={8}>
                <TextField
                  fullWidth
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={3} lg={2}>
                <FormControl fullWidth>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Planning">Planning</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3} lg={2}>
                <FormControl fullWidth>
                  <Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Priority</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} lg={3}>
                <FormControl fullWidth>
                  <Select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Teams</MenuItem>
                    <MenuItem value="Design">Design</MenuItem>
                    <MenuItem value="Development">Development</MenuItem>
                    <MenuItem value="Analytics">Analytics</MenuItem>
                    <MenuItem value="Security">Security</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Card>

          {/* RESULTS */}
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Showing <b>{filteredProjects.length}</b> of{" "}
            <b>{projects.length}</b> projects
          </Typography>

          {/* LOADING STATE */}
          {loading && (
            <Card sx={{ p: 6, textAlign: "center", mt: 3 }}>
              <Typography variant="h6">Loading projects...</Typography>
            </Card>
          )}

          {/* ERROR STATE */}
          {error && !loading && (
            <Card sx={{ p: 6, textAlign: "center", mt: 3 }}>
              <Typography variant="h6" color="error">Error loading projects</Typography>
              <Typography color="text.secondary">{error}</Typography>
            </Card>
          )}

          {/* PROJECT CARDS */}
          {!loading && !error && (
            <Stack spacing={3} mt={3}>
              {filteredProjects.map((p) => (
                <Card key={p.id}>
                  <CardContent>
                    <Stack spacing={2}>
                      {/* Top Content */}
                      <Stack direction="row" spacing={3}>
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: "#e8f0ff",
                            fontSize: 15,
                            color: "#000",
                          }}
                        >
                          {p.id}
                        </Avatar>

                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: "16px" }}>
                            {p.name || p.title || p.project_name || "Unnamed Project"}
                          </Typography>
                          <Typography color="text.secondary" sx={{ fontSize: "10px" }}>
                            {p.code || p.type || p.project_category || "No Category"}
                          </Typography>

                          {(p.project_type) && (
                            <Stack direction="row" spacing={1} mt={1}>
                              {p.project_type && (
                                <Chip
                                  label={p.project_type}
                                  size="small"
                                  color="success"
                                  icon={<EmojiEvents />}
                                  sx={{ fontSize: "10px" }}
                                />
                              )}
                            </Stack>
                          )}

                          {(p.start_time !== undefined || p.end_time !== undefined) && (
                            <Stack direction="row" spacing={4} mt={2}>
                              {p.start_time !== undefined && (
                                <Typography sx={{ fontSize: "12px" }}>
                                  Start Time: {p.start_time}
                                </Typography>
                              )}
                              {p.end_time !== undefined && (
                                <Typography sx={{ fontSize: "12px" }}>
                                  End Time: {p.end_time}
                                </Typography>
                              )}
                            </Stack>
                          )}

                          {(p.reward_points || p.totalreward_points) && (
                            <Typography mt={2} sx={{ fontSize: "12px" }}>
                              reward_points: {p.reward_points || "N/A"}
                            </Typography>
                          )}

                          {(p.status || p.project_status) && (
                            <Chip
                              label={p.status || p.project_status}
                              color={getStatusColor(p.status || p.project_status)}
                              sx={{
                                mt: 1,
                                bgcolor: (p.status || p.project_status) === "In Progress" ? DARK_BLUE : undefined,
                                color: (p.status || p.project_status) === "In Progress" ? "white" : undefined,
                              }}
                            />
                          )}
                        </Box>
                      </Stack>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end", // RIGHT
                          alignItems: "flex-start",   // TOP
                        }}
                      >
                        <Stack direction="column" spacing={2}>
                          <Link
                            to={`/projects/${p.id}/edit`}
                            style={{ textDecoration: "none", width: "150px" }}
                          >
                            <Button
                              fullWidth
                              variant="contained"
                              sx={{
                                bgcolor: DARK_BLUE,
                                "&:hover": { bgcolor: "#08306A" },
                                fontSize: "11px",
                              }}
                            >
                              View Details
                            </Button>
                          </Link>

                          <Button
                            fullWidth
                            onClick={() => handleOpen(p)}
                            sx={{
                              border: "1px solid #f71313ff",
                              fontSize: "11px",
                              color: "#f71313ff",
                              "&:hover": {
                                backgroundColor: "#f7131314",
                              },
                            }}
                          >
                            Delete Project
                          </Button>
                        </Stack>
                      </Box>

                    </Stack>
                  </CardContent>
                </Card>

              ))}

              {/* NO DATA */}
              {filteredProjects.length === 0 && !loading && !error && (
                <Card sx={{ p: 6, textAlign: "center" }}>
                  <FilterList sx={{ fontSize: 50, color: "#ccc", mb: 2 }} />
                  <Typography variant="h6">No projects found</Typography>
                  <Typography color="text.secondary">
                    {projects.length === 0
                      ? "No projects available. Create your first project!"
                      : "Try adjusting your filters"}
                  </Typography>
                </Card>
              )}
            </Stack>
          )}
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Deactivate Project
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to deactivate the project{" "}
            <b>{selectedProject?.name || selectedProject?.project_name}</b>?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            This action can be reverted later.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleDeactivate}
            sx={{
              bgcolor: "#f71313ff",
              "&:hover": { bgcolor: "#c20f0fff" },
            }}
          >
            Deactivate Project
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectListPage;
