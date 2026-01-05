# QuantAI Question Types - Comprehensive Guide

**Version:** 1.0
**Last Updated:** December 2025
**Total Question Types:** 22

---

## Table of Contents

1. [Overview](#overview)
2. [Selection-Based Questions](#selection-based-questions)
3. [Text Input Questions](#text-input-questions)
4. [Specialized Text Questions](#specialized-text-questions)
5. [Numeric & Scale Questions](#numeric--scale-questions)
6. [Special Question Types](#special-question-types)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)

---

## Overview

The QuantAI platform supports 22 different question types, each designed for specific data collection needs. Questions can be used in:
- **Project Surveys** - Questions within a specific project/survey
- **Profiling Questions** - Standalone questions for user onboarding and profiling

### Question Model Core Fields

```json
{
  "id": 1,
  "project": 1,                    // null for profiling questions
  "is_profiling_question": false,
  "variable_name": "age_group",
  "title": "What is your age group?",
  "description": "Select the range that includes your age",
  "is_required": true,
  "is_initial_question": false,
  "display_index": 0,
  "question_type": "RDO",
  "widget": "radio",
  "file_upload_allowed_extention": "",
  "option_rotation": null
}
```

---

## Selection-Based Questions

### 1. Single Selection (Radio) - `RDO`

**Description:** User selects exactly one option from a list.

**Use Cases:**
- Demographic questions (gender, age group)
- Yes/No questions
- Single choice preferences
- Agreement scales (Strongly Disagree → Strongly Agree)

**Widget:** `radio`

**API Example - Creating a Radio Question:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "gender",
    "title": "What is your gender?",
    "description": "Select one option",
    "question_type": "RDO",
    "widget": "radio",
    "is_required": true,
    "display_index": 1,
    "choice_groups": [
      {
        "title": "Gender Options",
        "title_align": "left",
        "options": [
          {"text": "Male", "value": "male", "order": 1},
          {"text": "Female", "value": "female", "order": 2},
          {"text": "Non-binary", "value": "non_binary", "order": 3},
          {"text": "Prefer not to say", "value": "prefer_not", "order": 4}
        ]
      }
    ]
  }'
```

**Answer Format:**

```json
{
  "question": 1,
  "profile": 5,
  "option": [2],  // Array with single QuestionChoice ID
  "input": null
}
```

---

### 2. Multiple Selection (Checkbox) - `CHB`

**Description:** User can select multiple options from a list.

**Use Cases:**
- "Select all that apply" questions
- Multi-interest selection
- Feature preferences
- Multi-symptom tracking

**Widget:** `checkbox`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "interests",
    "title": "What are your interests? (Select all that apply)",
    "question_type": "CHB",
    "widget": "checkbox",
    "is_required": false,
    "display_index": 2,
    "choice_groups": [
      {
        "title": "Interest Categories",
        "options": [
          {"text": "Technology", "value": "tech", "order": 1},
          {"text": "Sports", "value": "sports", "order": 2},
          {"text": "Music", "value": "music", "order": 3},
          {"text": "Travel", "value": "travel", "order": 4},
          {"text": "Reading", "value": "reading", "order": 5},
          {"text": "Gaming", "value": "gaming", "order": 6}
        ]
      }
    ]
  }'
```

**Answer Format:**

```json
{
  "question": 2,
  "profile": 5,
  "option": [1, 3, 5],  // Multiple QuestionChoice IDs
  "input": null
}
```

---

### 3. Dropdown Menu - `DRP`

**Description:** User selects one option from a dropdown list.

**Use Cases:**
- Long lists of options (countries, states, cities)
- Category selection
- Single choice when many options available
- Compact UI required

**Widget:** `dropdown` or `select`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "country",
    "title": "Select your country of residence",
    "question_type": "DRP",
    "widget": "dropdown",
    "is_required": true,
    "display_index": 3,
    "choice_groups": [
      {
        "title": "Countries",
        "options": [
          {"text": "United States", "value": "US", "order": 1},
          {"text": "United Kingdom", "value": "UK", "order": 2},
          {"text": "Canada", "value": "CA", "order": 3},
          {"text": "Australia", "value": "AU", "order": 4},
          {"text": "Germany", "value": "DE", "order": 5},
          {"text": "France", "value": "FR", "order": 6},
          {"text": "India", "value": "IN", "order": 7},
          {"text": "Japan", "value": "JP", "order": 8}
        ]
      }
    ]
  }'
```

**Answer Format:**

```json
{
  "question": 3,
  "profile": 5,
  "option": [7],  // Single selection
  "input": null
}
```

---

### 4. Image Choice - `IMG`

**Description:** User selects option(s) represented by images.

**Use Cases:**
- Product selection
- Logo/brand recognition
- Visual preferences
- Design choices

**Widget:** `image-grid` or `image-radio`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "product_choice",
    "title": "Which product design do you prefer?",
    "question_type": "IMG",
    "widget": "image-radio",
    "is_required": true,
    "display_index": 4,
    "choice_groups": [
      {
        "title": "Product Designs",
        "options": [
          {
            "text": "Design A",
            "value": "design_a",
            "order": 1,
            "image_url": "https://example.com/images/design_a.png"
          },
          {
            "text": "Design B",
            "value": "design_b",
            "order": 2,
            "image_url": "https://example.com/images/design_b.png"
          },
          {
            "text": "Design C",
            "value": "design_c",
            "order": 3,
            "image_url": "https://example.com/images/design_c.png"
          }
        ]
      }
    ]
  }'
```

**Note:** Store image URLs in the choice `text` field or extend QuestionChoices model with `image_url` field.

**Answer Format:**

```json
{
  "question": 4,
  "profile": 5,
  "option": [1],
  "input": null
}
```

---

## Text Input Questions

### 5. Short Text Input - `TXT`

**Description:** Single-line text input for brief responses.

**Use Cases:**
- Name, job title
- Short answers
- Keywords
- Single-word responses

**Widget:** `text` or `input`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "job_title",
    "title": "What is your current job title?",
    "description": "Please provide your official job title",
    "question_type": "TXT",
    "widget": "text",
    "is_required": true,
    "display_index": 5
  }'
```

**Answer Format:**

```json
{
  "question": 5,
  "profile": 5,
  "option": [],
  "input": "Senior Software Engineer"
}
```

---

### 6. Long Text Input - `TXTL`

**Description:** Multi-line text area for lengthy responses.

**Use Cases:**
- Comments/feedback
- Detailed explanations
- Open-ended questions
- Descriptions

**Widget:** `textarea`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "feedback",
    "title": "Please share your detailed feedback about our product",
    "description": "Be as specific as possible",
    "question_type": "TXTL",
    "widget": "textarea",
    "is_required": false,
    "display_index": 6
  }'
```

**Answer Format:**

```json
{
  "question": 6,
  "profile": 5,
  "option": [],
  "input": "I've been using your product for 6 months and overall I'm very satisfied. The user interface is intuitive and the features are comprehensive. However, I would suggest improving the mobile responsiveness and adding dark mode support."
}
```

---

## Specialized Text Questions

### 7. Email Address - `EML`

**Description:** Validated email input field.

**Use Cases:**
- Contact email
- Secondary email
- Work email
- Newsletter subscription

**Widget:** `email`

**Validation:** Django EmailValidator (RFC 5322)

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "work_email",
    "title": "What is your work email address?",
    "question_type": "EML",
    "widget": "email",
    "is_required": true,
    "display_index": 7
  }'
```

**Answer Format:**

```json
{
  "question": 7,
  "profile": 5,
  "option": [],
  "input": "john.doe@company.com"
}
```

**Validation Error Example:**

```json
{
  "input": ["Enter a valid email address."]
}
```

---

### 8. Phone Number - `PHN`

**Description:** Validated phone number input.

**Use Cases:**
- Contact phone
- Emergency contact
- Mobile number
- Verification

**Widget:** `phone` or `tel`

**Validation:** E.164 format via django-phonenumber-field

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "mobile_phone",
    "title": "What is your mobile phone number?",
    "description": "Include country code (e.g., +1234567890)",
    "question_type": "PHN",
    "widget": "phone",
    "is_required": true,
    "display_index": 8
  }'
```

**Answer Format:**

```json
{
  "question": 8,
  "profile": 5,
  "option": [],
  "input": "+14155552671"
}
```

**Validation Error Example:**

```json
{
  "input": ["Enter a valid phone number (e.g. +12125552368)."]
}
```

---

### 9. Website URL - `URL`

**Description:** Validated URL input field.

**Use Cases:**
- Company website
- Portfolio link
- Social media profiles
- Reference links

**Widget:** `url`

**Validation:** Django URLValidator (http/https only)

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "company_website",
    "title": "What is your company website?",
    "question_type": "URL",
    "widget": "url",
    "is_required": false,
    "display_index": 9
  }'
```

**Answer Format:**

```json
{
  "question": 9,
  "profile": 5,
  "option": [],
  "input": "https://www.company.com"
}
```

**Validation Error Example:**

```json
{
  "input": ["Enter a valid URL (must start with http:// or https://)."]
}
```

---

### 10. Address - `ADR`

**Description:** Structured address input with validation.

**Use Cases:**
- Shipping address
- Billing address
- Office location
- Residence address

**Widget:** `address-form`

**Validation:** JSON structure with required fields

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "shipping_address",
    "title": "What is your shipping address?",
    "question_type": "ADR",
    "widget": "address-form",
    "is_required": true,
    "display_index": 10
  }'
```

**Answer Format:**

```json
{
  "question": 10,
  "profile": 5,
  "option": [],
  "input": {
    "street": "123 Main Street",
    "apartment": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  }
}
```

**Required Fields:**
- `street` (string)
- `city` (string)
- `state` (string, 2 letters)
- `zip` (string, 5 digits or 5+4 format)
- `country` (string)

**Optional Fields:**
- `apartment` (string)

**Validation Error Example:**

```json
{
  "input": ["Invalid ZIP code format. Expected 12345 or 12345-6789."]
}
```

---

### 11. Contact Information - `CTI`

**Description:** Structured contact info with sub-field validation.

**Use Cases:**
- Emergency contact
- Reference contact
- Next of kin
- Business contact

**Widget:** `contact-form`

**Validation:** JSON structure with email/phone validation

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "emergency_contact",
    "title": "Emergency Contact Information",
    "description": "Provide contact details for emergency situations",
    "question_type": "CTI",
    "widget": "contact-form",
    "is_required": true,
    "display_index": 11
  }'
```

**Answer Format:**

```json
{
  "question": 11,
  "profile": 5,
  "option": [],
  "input": {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+14155552672",
    "relationship": "Spouse"
  }
}
```

**Required Fields:**
- `name` (string)
- `email` (valid email)
- `phone` (valid phone number)

**Optional Fields:**
- `relationship` (string)

**Validation Error Example:**

```json
{
  "input": ["Contact info email is invalid."]
}
```

---

## Numeric & Scale Questions

### 12. Numeric Input - `NUM`

**Description:** Validated numeric input with optional range constraints.

**Use Cases:**
- Age
- Quantity
- Years of experience
- Budget/salary ranges

**Widget:** `number`

**Validation:** Number format, optional min/max range

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "age",
    "title": "What is your age?",
    "question_type": "NUM",
    "widget": "number",
    "is_required": true,
    "display_index": 12,
    "min_value": 18,
    "max_value": 120
  }'
```

**Answer Format:**

```json
{
  "question": 12,
  "profile": 5,
  "option": [],
  "input": 32
}
```

**Validation Error Example:**

```json
{
  "input": ["Value must be between 18 and 120."]
}
```

---

### 13. Rating Scale - `RAT`

**Description:** Likert scale or star rating.

**Use Cases:**
- Satisfaction rating (1-5 stars)
- Agreement scale (Strongly Disagree → Strongly Agree)
- Quality rating
- Performance evaluation

**Widget:** `rating-stars`, `rating-scale`, or `likert`

**API Example - Star Rating:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "product_satisfaction",
    "title": "How satisfied are you with our product?",
    "question_type": "RAT",
    "widget": "rating-stars",
    "is_required": true,
    "display_index": 13,
    "choice_groups": [
      {
        "title": "Rate from 1 to 5 stars",
        "options": [
          {"text": "1 Star", "value": "1", "order": 1},
          {"text": "2 Stars", "value": "2", "order": 2},
          {"text": "3 Stars", "value": "3", "order": 3},
          {"text": "4 Stars", "value": "4", "order": 4},
          {"text": "5 Stars", "value": "5", "order": 5}
        ]
      }
    ]
  }'
```

**Answer Format (using options):**

```json
{
  "question": 13,
  "profile": 5,
  "option": [4],  // 4 stars
  "input": null
}
```

**Alternative Answer Format (using input for numeric scale):**

```json
{
  "question": 13,
  "profile": 5,
  "option": [],
  "input": 4
}
```

---

### 14. Net Promoter Score - `NPS`

**Description:** Standard NPS question (0-10 scale).

**Use Cases:**
- Customer loyalty measurement
- Product recommendation likelihood
- Brand advocacy

**Widget:** `nps-scale`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "nps_score",
    "title": "How likely are you to recommend our product to a friend or colleague?",
    "description": "0 = Not at all likely, 10 = Extremely likely",
    "question_type": "NPS",
    "widget": "nps-scale",
    "is_required": true,
    "display_index": 14,
    "choice_groups": [
      {
        "title": "Select a score from 0 to 10",
        "options": [
          {"text": "0", "value": "0", "order": 1},
          {"text": "1", "value": "1", "order": 2},
          {"text": "2", "value": "2", "order": 3},
          {"text": "3", "value": "3", "order": 4},
          {"text": "4", "value": "4", "order": 5},
          {"text": "5", "value": "5", "order": 6},
          {"text": "6", "value": "6", "order": 7},
          {"text": "7", "value": "7", "order": 8},
          {"text": "8", "value": "8", "order": 9},
          {"text": "9", "value": "9", "order": 10},
          {"text": "10", "value": "10", "order": 11}
        ]
      }
    ]
  }'
```

**Answer Format:**

```json
{
  "question": 14,
  "profile": 5,
  "option": [9],  // Score of 8
  "input": null
}
```

**NPS Category Calculation:**
- 0-6: Detractors
- 7-8: Passives
- 9-10: Promoters

---

### 15. Slider Scale - `SLI`

**Description:** Visual slider for numeric range selection.

**Use Cases:**
- Satisfaction level
- Price range
- Preference intensity
- Continuous scales

**Widget:** `slider`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "budget_range",
    "title": "What is your monthly budget for this category?",
    "question_type": "SLI",
    "widget": "slider",
    "is_required": true,
    "display_index": 15,
    "slider_config": {
      "min": 0,
      "max": 1000,
      "step": 50,
      "default": 250,
      "currency": "USD"
    }
  }'
```

**Answer Format:**

```json
{
  "question": 15,
  "profile": 5,
  "option": [],
  "input": 500
}
```

---

## Special Question Types

### 16. Ranking - `RNK`

**Description:** User ranks options in order of preference.

**Use Cases:**
- Priority ranking
- Preference ordering
- Feature importance
- Value hierarchy

**Widget:** `ranking` or `drag-drop`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "feature_priority",
    "title": "Rank these features in order of importance to you (1 = most important)",
    "question_type": "RNK",
    "widget": "ranking",
    "is_required": true,
    "display_index": 16,
    "choice_groups": [
      {
        "title": "Features to Rank",
        "options": [
          {"text": "Performance", "value": "performance", "order": 1},
          {"text": "User Interface", "value": "ui", "order": 2},
          {"text": "Customer Support", "value": "support", "order": 3},
          {"text": "Price", "value": "price", "order": 4},
          {"text": "Features", "value": "features", "order": 5}
        ]
      }
    ]
  }'
```

**Answer Format:**

```json
{
  "question": 16,
  "profile": 5,
  "option": [],
  "input": {
    "rankings": [
      {"choice_id": 4, "rank": 1},  // Price is #1
      {"choice_id": 1, "rank": 2},  // Performance is #2
      {"choice_id": 5, "rank": 3},  // Features is #3
      {"choice_id": 2, "rank": 4},  // UI is #4
      {"choice_id": 3, "rank": 5}   // Support is #5
    ]
  }
}
```

---

### 17. Matrix/Grid - `MTX`

**Description:** Table format with rows and columns for multiple related questions.

**Use Cases:**
- Multiple attributes rating
- Feature comparisons
- Multi-item evaluation
- Systematic assessment

**Widget:** `matrix-grid`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "service_quality",
    "title": "Please rate the following aspects of our service",
    "question_type": "MTX",
    "widget": "matrix-grid",
    "is_required": true,
    "display_index": 17
  }'
```

**Create Matrix Rows:**

```bash
curl -X POST http://localhost:8000/api/question-rows/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Response Time",
    "order": 1
  }'

# Repeat for: "Quality of Service", "Professionalism", "Value for Money"
```

**Create Matrix Columns:**

```bash
curl -X POST http://localhost:8000/api/question-columns/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Very Poor",
    "order": 1
  }'

# Repeat for: "Poor", "Average", "Good", "Excellent"
```

**Answer Format:**

```json
{
  "question": 17,
  "profile": 5,
  "option": [],
  "input_row": {
    "selections": [
      {"row_id": 1, "column_id": 4},  // Response Time: Good
      {"row_id": 2, "column_id": 5},  // Quality: Excellent
      {"row_id": 3, "column_id": 4},  // Professionalism: Good
      {"row_id": 4, "column_id": 3}   // Value: Average
    ]
  }
}
```

---

### 18. File Upload - `FIL`

**Description:** Allow users to upload files/documents.

**Use Cases:**
- Resume/CV upload
- Document submission
- Image upload
- Proof of identity

**Widget:** `file-upload`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "resume",
    "title": "Please upload your resume",
    "question_type": "FIL",
    "widget": "file-upload",
    "is_required": true,
    "display_index": 18,
    "file_upload_allowed_extention": "pdf,doc,docx"
  }'
```

**Allowed Extensions Examples:**
- Documents: `pdf,doc,docx,txt`
- Images: `jpg,jpeg,png,gif,webp`
- Spreadsheets: `xls,xlsx,csv`
- Archives: `zip,rar,7z`

**Answer Format:**

```json
{
  "question": 18,
  "profile": 5,
  "option": [],
  "input": {
    "file_id": "f7a8b9c0-1234-5678-90ab-cdef12345678",
    "file_name": "john_doe_resume.pdf",
    "file_size": 245760,
    "file_url": "/media/uploads/resumes/john_doe_resume.pdf",
    "uploaded_at": "2025-12-30T10:30:00Z"
  }
}
```

---

### 19. Date/Time Picker - `DT`

**Description:** Calendar/time selector for date and time input.

**Use Cases:**
- Birth date
- Appointment scheduling
- Event dates
- Availability windows

**Widget:** `date`, `datetime`, `time`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "birth_date",
    "title": "What is your date of birth?",
    "question_type": "DT",
    "widget": "date",
    "is_required": true,
    "display_index": 19,
    "date_config": {
      "format": "YYYY-MM-DD",
      "min_date": "1920-01-01",
      "max_date": "2007-12-31"
    }
  }'
```

**Answer Format (Date Only):**

```json
{
  "question": 19,
  "profile": 5,
  "option": [],
  "input": "1990-05-15"
}
```

**Answer Format (Date and Time):**

```json
{
  "question": 19,
  "profile": 5,
  "option": [],
  "input": "2025-12-30T14:30:00Z"
}
```

**Answer Format (Time Only):**

```json
{
  "question": 19,
  "profile": 5,
  "option": [],
  "input": "14:30:00"
}
```

---

### 20. Signature Capture - `SIG`

**Description:** Digital signature or drawing pad.

**Use Cases:**
- Agreement signatures
- Authorization forms
- Consent forms
- Legal documents

**Widget:** `signature-pad`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "consent_signature",
    "title": "Please sign to confirm your consent",
    "description": "By signing, you agree to the terms and conditions",
    "question_type": "SIG",
    "widget": "signature-pad",
    "is_required": true,
    "display_index": 20
  }'
```

**Answer Format:**

```json
{
  "question": 20,
  "profile": 5,
  "option": [],
  "input": {
    "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "signed_at": "2025-12-30T10:30:00Z",
    "ip_address": "192.168.1.100"
  }
}
```

---

### 21. Geolocation - `GEO`

**Description:** Capture user's geographic coordinates.

**Use Cases:**
- Location-based services
- Store finder
- Delivery address verification
- Geographic research

**Widget:** `map-picker` or `location`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "store_location",
    "title": "Select your nearest store location",
    "question_type": "GEO",
    "widget": "map-picker",
    "is_required": true,
    "display_index": 21
  }'
```

**Answer Format:**

```json
{
  "question": 21,
  "profile": 5,
  "option": [],
  "input": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10,
    "address": "New York, NY, USA",
    "captured_at": "2025-12-30T10:30:00Z"
  }
}
```

---

### 22. Audio/Video Response - `AV`

**Description:** Record audio or video responses.

**Use Cases:**
- Video testimonials
- Voice feedback
- Interview responses
- Qualitative research

**Widget:** `audio-recorder` or `video-recorder`

**API Example:**

```bash
curl -X POST http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": 1,
    "variable_name": "video_testimonial",
    "title": "Please record a short video testimonial about our product",
    "description": "Maximum 2 minutes",
    "question_type": "AV",
    "widget": "video-recorder",
    "is_required": false,
    "display_index": 22,
    "media_config": {
      "max_duration": 120,
      "format": "mp4",
      "max_size_mb": 50
    }
  }'
```

**Answer Format:**

```json
{
  "question": 22,
  "profile": 5,
  "option": [],
  "input": {
    "media_id": "v7a8b9c0-1234-5678-90ab-cdef12345678",
    "media_type": "video",
    "file_name": "testimonial_20251230.mp4",
    "duration_seconds": 87,
    "file_size": 15728640,
    "media_url": "/media/uploads/videos/testimonial_20251230.mp4",
    "thumbnail_url": "/media/uploads/thumbnails/testimonial_20251230.jpg",
    "uploaded_at": "2025-12-30T10:30:00Z"
  }
}
```

---

## API Reference

### Base URL

```
http://localhost:8000/api/
```

### Authentication

All endpoints require authentication via OAuth2 Bearer token:

```bash
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Endpoints

#### Question Types (New)

Get information about available question types:

```bash
# Get All Question Types
GET /api/questions/question-types/

# Response:
[
  {"code": "RDO", "name": "Single Selection (Radio)"},
  {"code": "CHB", "name": "Multiple Selection (Checkbox)"},
  {"code": "DRP", "name": "Dropdown Menu"},
  ...
]

# Get Question Type Details (including sample payload and answer format)
GET /api/questions/question-types/{type_code}

# Example:
GET /api/questions/question-types/RDO

# Response:
{
  "code": "RDO",
  "name": "Single Selection (Radio)",
  "description": "User selects exactly one option from a list",
  "use_cases": [
    "Demographic questions (gender, age group)",
    "Yes/No questions",
    ...
  ],
  "widget": "radio",
  "sample_payload": {
    "project": 1,
    "variable_name": "gender",
    "title": "What is your gender?",
    ...
  },
  "answer_format": {
    "question": 1,
    "profile": 5,
    "option": [2],
    "input": null
  }
}
```

#### Questions

```bash
# Create Question
POST /api/questions/

# List Questions
GET /api/questions/
GET /api/questions/?project=1
GET /api/questions/?question_type=RDO
GET /api/questions/?is_required=true
GET /api/questions/?search=age

# Get Question
GET /api/questions/{id}/

# Update Question
PATCH /api/questions/{id}/
PUT /api/questions/{id}/

# Delete Question
DELETE /api/questions/{id}/

# Get Question Choices
GET /api/questions/{id}/choices/
```

#### Question Groups

```bash
POST /api/question-groups/
GET /api/question-groups/
GET /api/question-groups/{id}/
PATCH /api/question-groups/{id}/
DELETE /api/question-groups/{id}/
```

**Note:** Question choices and choice groups are managed through nested creation when creating/updating questions. Use the `choice_groups` field in the question payload.

#### Answers


```bash
# Submit Answer
POST /api/answers/

# List Answers
GET /api/answers/
GET /api/answers/?profile=5
GET /api/answers/?project=1
GET /api/answers/?question=10

# Get Answer
GET /api/answers/{id}/

# Update Answer
PATCH /api/answers/{id}/

# Delete Answer
DELETE /api/answers/{id}/
```

### Common Query Parameters

- `?project=1` - Filter by project
- `?question_type=RDO` - Filter by question type
- `?is_required=true` - Filter required questions
- `?is_profiling_question=true` - Filter profiling questions
- `?search=keyword` - Search in title/description/variable_name

---

## Best Practices

### 1. Question Design

**Clear and Concise:**
```json
{
  "title": "What is your age?",
  "description": "Enter your age in years"
}
```

**Avoid:**
```json
{
  "title": "We would like to know, if you don't mind sharing, what might your age be, approximately?"
}
```

### 2. Required vs Optional

- Mark demographic questions as **required** for complete profiling
- Mark feedback/opinion questions as **optional** to reduce drop-off
- Use `is_required: true` sparingly

### 3. Choice Organization

**Group Related Choices:**
```json
{
  "choice_groups": [
    {
      "title": "Strongly Disagree",
      "options": [...]
    },
    {
      "title": "Neutral",
      "options": [...]
    },
    {
      "title": "Strongly Agree",
      "options": [...]
    }
  ]
}
```

### 4. Display Order

- Use `display_index` to control question flow
- Start with easy, engaging questions
- Place sensitive questions later in the survey
- End with open-ended feedback questions

### 5. Variable Naming

**Good:**
```
age, gender, job_title, product_satisfaction
```

**Avoid:**
```
q1, q2, question_about_age, user_response_field
```

### 6. Validation

- Use specific question types (EML, PHN, URL) for automatic validation
- Leverage `NUM` type with min/max for numeric ranges
- Use `ADR` and `CTI` for structured data collection

### 7. Mobile Optimization

- Avoid `MTX` (matrix) on mobile - use separate questions instead
- Use `DRP` (dropdown) for long option lists
- Keep `TXTL` (textarea) descriptions short

### 8. Conditional Logic

Use LogicNode for skip logic:
```json
{
  "condition": "IF age < 18",
  "action": "SKIP_TO question_id=50"
}
```

### 9. Profiling Questions

Set `is_profiling_question: true` for onboarding:
```json
{
  "is_profiling_question": true,
  "project": null,
  "variable_name": "country",
  "title": "What is your country?"
}
```

### 10. Option Rotation

Reduce bias with randomized options:
```json
{
  "option_rotation": "random"
}
```

---

## Quick Reference Table

| Type | Code | Widget | Use Case | Answer Storage |
|------|------|--------|----------|----------------|
| Radio | RDO | radio | Single choice | option (array) |
| Checkbox | CHB | checkbox | Multiple choice | option (array) |
| Dropdown | DRP | dropdown | Single from many | option (array) |
| Image Choice | IMG | image-radio | Visual selection | option (array) |
| Short Text | TXT | text | Brief text | input (string) |
| Long Text | TXTL | textarea | Detailed text | input (string) |
| Email | EML | email | Email address | input (string) |
| Phone | PHN | phone | Phone number | input (string) |
| URL | URL | url | Website link | input (string) |
| Address | ADR | address-form | Full address | input (JSON) |
| Contact Info | CTI | contact-form | Contact details | input (JSON) |
| Number | NUM | number | Numeric value | input (number) |
| Rating | RAT | rating-stars | Star/Likert scale | option or input |
| NPS | NPS | nps-scale | 0-10 loyalty | option or input |
| Slider | SLI | slider | Range selection | input (number) |
| Ranking | RNK | ranking | Order preferences | input (JSON) |
| Matrix | MTX | matrix-grid | Multi-attribute | input_row (JSON) |
| File Upload | FIL | file-upload | Document upload | input (JSON) |
| Date/Time | DT | date/datetime | Calendar picker | input (string) |
| Signature | SIG | signature-pad | Digital signature | input (JSON) |
| Geolocation | GEO | map-picker | Location data | input (JSON) |
| Audio/Video | AV | video-recorder | Media response | input (JSON) |

---

## Support

For additional help:
- API Documentation: `/api/schema/swagger/`
- Django Admin: `/admin/`
- GitHub Issues: [Report Issue](https://github.com/your-repo/issues)

**Document Version:** 1.0
**Last Updated:** December 30, 2025
**Maintained By:** QuantAI Backend Team
