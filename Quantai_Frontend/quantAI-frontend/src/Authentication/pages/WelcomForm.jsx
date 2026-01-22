import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Typography,
  Button,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  FormControl,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";

const UserDetailsForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dob: "",
    country: "",
    state: "",
    city: "",
    language: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target; 
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Form Submitted! Check console for data.");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8f9fb",
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container 
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: { xs: 'auto', md: '100vh' },
          py: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: { xs: 2, sm: 3 },
            width: "100%",
            maxWidth: 600,
            maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 48px)', md: '90vh' },
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              mb: { xs: 2.5, sm: 3 },
              textAlign: "center",
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              color: "#1a202c",
            }}
          >
            User Details Form
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <TextField
              fullWidth
              label="What is your full name?"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              sx={{ mb: { xs: 2, sm: 2.5 } }}
              size={isMobile ? "small" : "medium"}
            />

            {/* Gender */}
            <FormControl fullWidth sx={{ mb: { xs: 2, sm: 2.5 } }}>
              <FormLabel 
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  mb: 0.5,
                }}
              >
                What is your gender?
              </FormLabel>
              <RadioGroup
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                row={!isMobile}
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <FormControlLabel 
                  value="Male" 
                  control={<Radio size={isMobile ? "small" : "medium"} />} 
                  label="Male"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
                />
                <FormControlLabel 
                  value="Female" 
                  control={<Radio size={isMobile ? "small" : "medium"} />} 
                  label="Female"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
                />
                <FormControlLabel 
                  value="Other" 
                  control={<Radio size={isMobile ? "small" : "medium"} />} 
                  label="Other"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
                />
              </RadioGroup>
            </FormControl>

            {/* DOB */}
            <TextField
              fullWidth
              type="date"
              label="What is your date of birth?"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: { xs: 2, sm: 2.5 } }}
              size={isMobile ? "small" : "medium"}
            />

            {/* Country */}
            <TextField
              select
              fullWidth
              label="What is your country of residence?"
              name="country"
              value={formData.country}
              onChange={handleChange}
              sx={{ mb: { xs: 2, sm: 2.5 } }}
              size={isMobile ? "small" : "medium"}
            >
              <MenuItem value="India">India</MenuItem>
              <MenuItem value="USA">USA</MenuItem>
              <MenuItem value="UK">UK</MenuItem>
              <MenuItem value="Australia">Australia</MenuItem>
            </TextField>

            {/* State/Region */}
            <TextField
              fullWidth
              label="Which state/region do you live in?"
              name="state"
              value={formData.state}
              onChange={handleChange}
              sx={{ mb: { xs: 2, sm: 2.5 } }}
              size={isMobile ? "small" : "medium"}
            />

            {/* City */}
            <TextField
              fullWidth
              label="What is your city of residence?"
              name="city"
              value={formData.city}
              onChange={handleChange}
              sx={{ mb: { xs: 2, sm: 2.5 } }}
              size={isMobile ? "small" : "medium"}
            />

            {/* Primary Language */}
            <TextField
              fullWidth
              label="What is your primary language?"
              name="language"
              value={formData.language}
              onChange={handleChange}
              sx={{ mb: { xs: 2.5, sm: 3 } }}
              size={isMobile ? "small" : "medium"}
            />

            {/* Submit Button */}
            <Link 
              to='/' 
              style={{ 
                textDecoration: 'none',
                width: isMobile ? '100%' : 'auto',
                display: isMobile ? 'block' : 'inline-block',
              }}
            >
              <Button
                type="submit"
                fullWidth={isMobile}
                sx={{
                  color: "#000",
                  border: "1px solid black",
                  width: { xs: '100%', sm: 200 },
                  py: { xs: 1.2, sm: 1 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 500,
                  textTransform: "none",
                  borderRadius: { xs: 1.5, sm: 1 },
                  '&:hover': {
                    background: "#f5f5f5",
                    borderColor: "#000",
                  }
                }}
              >
                Submit
              </Button>
            </Link>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default UserDetailsForm;