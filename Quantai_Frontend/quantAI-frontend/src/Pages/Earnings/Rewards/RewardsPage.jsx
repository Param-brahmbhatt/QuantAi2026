import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { EmojiEvents, CalendarMonth, Stars, BusinessCenter } from "@mui/icons-material";

const sampleRewards = [
  { id: 1, name: "Amazon Gift Card $10", points: 500, expiry: "2025-12-31", category: "Gift Cards" },
  { id: 2, name: "Amazon Gift Card $25", points: 1200, expiry: "2025-10-15", category: "Gift Cards" },
  { id: 3, name: "Premium Coffee Voucher", points: 300, expiry: "2025-09-30", category: "Food & Beverage" },
  { id: 4, name: "Wireless Headphones", points: 2200, expiry: "2026-01-30", category: "Electronics" },
];

const RewardsPage = () => {
  const [userPoints] = useState(900);
  const [isAdmin] = useState(true);
  const [form, setForm] = useState({ name: "", points: "", expiry: "", category: "" });

  const canRedeem = (required) => userPoints >= required;
  const totalRewards = useMemo(() => sampleRewards.length, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Reward:", form);
    setForm({ name: "", points: "", expiry: "", category: "" });
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Professional Header */}
        <Paper
          elevation={0}
          sx={{
            mb: 6,
            p: 4,
            borderRadius: 2,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: "linear-gradient(90deg, #325b8aff 0%, #1d69b6ff 50%, #42a5f5 100%)",
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f0f0f0ff",
                  color: "rgb(103, 116, 142)",
                }}
              >
                <BusinessCenter sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    color: "rgba(61, 81, 114, 1)",
                    mb: 0.5,
                    fontSize: { xs: "1.75rem", md: "2.125rem" },
                  }}
                >
                  Rewards Center
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "rgb(103, 116, 142)", fontWeight: 400 }}
                >
                  Exchange your earned points for exclusive rewards and benefits
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                textAlign: "right",
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f1f5f9",
                minWidth: 160,
              }}
            >
              <Typography variant="body2" sx={{ color: "rgb(103, 116, 142)", mb: 0.5 }}>
                Available Points
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                <Stars sx={{ color: "rgb(61,81,114,1)", fontSize: 20 }} />
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "rgb(61,81,114,1)" }}
                >
                  {userPoints.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              icon={<EmojiEvents sx={{ fontSize: 18 }} />}
              label={`${totalRewards} Rewards Available`}
              sx={{
                backgroundColor: "#2e354fff",
                color: "white",
                fontWeight: 500,
                height: 36,
                "& .MuiChip-icon": {
                  color: "white",
                },
              }}
            />

            <Chip
              label="Updated Daily"
              sx={{
                backgroundColor: "#f1f5f9",
                color: "#2e354fff",
                fontWeight: 600,
                height: 36,
              }}
            />
          </Box>
        </Paper>

        {/* Rewards Grid */}
        <Grid container spacing={3}>
          {sampleRewards.map((reward) => (
            <Grid key={reward.id} item xs={12} sm={6} md={4} lg={3}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardHeader
                  sx={{ pb: 2 }}
                  title={
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        color: "rgba(66, 84, 113, 1)",
                        lineHeight: 1.3,
                      }}
                    >
                      {reward.name}
                    </Typography>
                  }
                  subheader={
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", mt: 0.5, fontWeight: 500 }}
                    >
                      {reward.category}
                    </Typography>
                  }
                />

                <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "#5e3737ff" }}>
                        Points Required:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "rgb(61,81,114,1)" }}
                      >
                        {reward.points.toLocaleString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarMonth sx={{ fontSize: 16, color: "#94a3b8" }} />
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Expires {new Date(reward.expiry).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  {canRedeem(reward.points) ? (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: "#3c4c6aff",
                        border: "1px solid #bae6fd",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#fff", fontWeight: 500 }}
                      >
                        ✓ Ready to redeem
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: "#fff",
                        border: "1px solid #ddd",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#92400e", fontWeight: 500 }}
                      >
                        Need {(reward.points - userPoints).toLocaleString()} more points
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant={canRedeem(reward.points) ? "contained" : "outlined"}
                    disabled={!canRedeem(reward.points)}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                      py: 1.2,
                      fontSize: "0.9rem",
                      ...(canRedeem(reward.points)
                        ? {
                          backgroundColor: "#fbfdffff",
                          color: "#3d5872ff",
                          "&:hover": { backgroundColor: "#eef0f2ff" },
                        }
                        : {
                          borderColor: "#cbd5e1",
                          color: "#233042ff",
                        }),
                    }}
                  >
                    {canRedeem(reward.points) ? "Redeem Now" : "Insufficient Points"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>


        {isAdmin && (
          <Paper
            elevation={0}
            sx={{
              mt: 6,
              p: 4,
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "#435c84ff",
                  mb: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 24,
                    backgroundColor: "#335283ff",
                    borderRadius: 1,
                  }}
                />
                Administrator Panel
              </Typography>
              <Typography variant="body2" sx={{ color: "#495c76ff" }}>
                Create and manage reward offerings for your team
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Box component="form" onSubmit={onSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "#283b59ff" }}
                  >
                    Reward Details
                  </Typography>
                  <TextField
                    fullWidth
                    label="Reward Name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    variant="outlined"
                    placeholder="e.g., Premium Coffee Voucher"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#F5F2F2',
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
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "#374151"}}
                  >
                    Point Value
                  </Typography>
                  <TextField
                    fullWidth
                    label="Points Required"
                    name="points"
                    type="number"
                    value={form.points}
                    onChange={onChange}
                    variant="outlined"
                    placeholder="500"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#F5F2F2',
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
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "#374151"}}
                  >
                    Expiration
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    label="Expiry Date"
                    name="expiry"
                    value={form.expiry}
                    onChange={onChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#F5F2F2',
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
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "#374151"}}
                  >
                    Category
                  </Typography>
                  <TextField
                    fullWidth
                    label="Category"
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    variant="outlined"
                    placeholder="e.g., Gift Cards, Electronics, Food & Beverage"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#F5F2F2',
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
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        backgroundColor: "#27394eff",
                        borderRadius: 1.5,
                        textTransform: "none",
                        px: 4,
                        py: 1.5,
                        fontSize: "0.95rem",
                        "&:hover": { backgroundColor: "#1d2b3fff" },
                      }}
                    >
                      Create Reward
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: "#cbd5e1",
                        color: "#64748b",
                        borderRadius: 1.5,
                        textTransform: "none",
                        px: 4,
                        py: 1.5,
                        fontSize: "0.95rem",
                        "&:hover": {
                          borderColor: "#94a3b8",
                          backgroundColor: "#f8fafc",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default RewardsPage