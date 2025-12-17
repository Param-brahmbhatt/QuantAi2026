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
  FormControl
} from "@mui/material";
import { Link } from "react-router-dom";

const UserDetailsForm = () => {
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
    <Container maxWidth="sm">
      <Box
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: "#fff",
        }}
      >
        <Typography variant="h5" mb={3} textAlign="center">
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
            sx={{ mb: 3 }}
          />

          {/* Gender */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>What is your gender?</FormLabel>
            <RadioGroup
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              row
            >
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
              <FormControlLabel value="Other" control={<Radio />} label="Other" />
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
            sx={{ mb: 3 }}
          />

          {/* Country */}
          <TextField
            select
            fullWidth
            label="What is your country of residence?"
            name="country"
            value={formData.country}
            onChange={handleChange}
            sx={{ mb: 3 }}
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
            sx={{ mb: 3 }}
          />

          {/* City */}
          <TextField
            fullWidth
            label="What is your city of residence?"
            name="city"
            value={formData.city}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          {/* Primary Language */}
          <TextField
            fullWidth
            label="What is your primary language?"
            name="language"
            value={formData.language}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          {/* Submit Button */}
          <Link to='/'><Button
            type="submit"
            sx={{
               color: "#000",
               border: "1px solid black",
               width: "200px"
            }}
          >
            Submit
          </Button></Link>
        </form>
      </Box>
    </Container>
  );
};

export default UserDetailsForm;
