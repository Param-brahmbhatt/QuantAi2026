s like # QuantAI Survey Workflow & Logic Builder Guide

## Table of Contents
1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Variables System](#variables-system)
4. [Logic Nodes](#logic-nodes)
5. [Conditions](#conditions)
6. [Building Workflows](#building-workflows)
7. [Advanced Examples](#advanced-examples)
8. [Best Practices](#best-practices)

---

## Overview

The QuantAI workflow system allows you to create dynamic, conditional survey flows using a node-based logic system. You can control question display, skip patterns, survey termination, and option masking based on user responses.

### Key Features
- **Conditional Display**: Show/hide questions based on previous answers
- **Skip Logic**: Jump to different questions based on responses
- **Survey Termination**: End surveys early based on disqualifying answers
- **Option Masking**: Hide specific answer choices dynamically
- **Variable Tracking**: Store and reference answer data throughout the survey

---

## Core Concepts

### 1. Variables
Variables store answer data and can be referenced throughout your survey workflow.

**Variable Types:**
- `QV` - Question Variable (linked to a specific question)
- `SV` - Survey Variable (project-level custom variable)
- `PV` - Profile Variable (user profiling data)
- `CV` - Custom Variable (arbitrary calculated values)

### 2. Logic Nodes
Logic nodes define **actions** that occur when **conditions** are met.

### 3. Conditions
Conditions define the **rules** that determine when a logic node's action executes.

### 4. Workflow Flow
```
Question → User Answers → Conditions Evaluated → Logic Node Action Executed → Next Question
```

---

## Variables System

### Variable Structure
```json
{
  "id": 1,
  "name": "user_age",
  "display_name": "User Age",
  "type": "QV",
  "project": 5,
  "question": 12,
  "value": "25"
}
```

### Variable Types Explained

#### Question Variable (QV)
- **Purpose**: Stores answer to a specific survey question
- **Creation**: Auto-created when question is answered
- **Usage**: Reference in conditions to check user's answer
- **Example**:
  ```json
  {
    "name": "q1_favorite_color",
    "type": "QV",
    "question": 1,
    "value": "Blue"
  }
  ```

#### Survey Variable (SV)
- **Purpose**: Project-level variables for calculations
- **Creation**: Manually created by admin
- **Usage**: Store computed values, counters, flags
- **Example**:
  ```json
  {
    "name": "survey_completion_percentage",
    "type": "SV",
    "value": "75"
  }
  ```

#### Profile Variable (PV)
- **Purpose**: User profile/demographic data
- **Creation**: Created from profiling questions
- **Usage**: Filter/segment users, personalize surveys
- **Example**:
  ```json
  {
    "name": "user_country",
    "type": "PV",
    "value": "India"
  }
  ```

#### Custom Variable (CV)
- **Purpose**: Arbitrary data storage
- **Creation**: API or admin panel
- **Usage**: Advanced logic, integrations
- **Example**:
  ```json
  {
    "name": "campaign_source",
    "type": "CV",
    "value": "email_blast_2025"
  }
  ```

### API Endpoints

**List Variables**
```http
GET /api/variables/
Authorization: Bearer <token>
```

**Create Variable**
```http
POST /api/variables/
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "custom_score",
  "type": "CV",
  "project": 5,
  "value": "0"
}
```

**Update Variable**
```http
PATCH /api/variables/{id}/
Content-Type: application/json

{
  "value": "100"
}
```

---

## Logic Nodes

### Available Actions

| Action Type | Code | Description | Use Case |
|------------|------|-------------|----------|
| **Skip To** | `SKIP_TO` | Jump to a specific question | Age screening: If age < 18, skip to end |
| **Display If** | `DISPLAY_IF` | Show question only if condition is true | Show "Smoker habits" only if "Do you smoke?" = Yes |
| **End Survey** | `END_SURVEY` | Terminate survey immediately | Disqualify users who don't meet criteria |
| **Mask Options** | `MASK_OPTIONS` | Hide specific answer choices | Filter product list based on previous selection |

### Logic Node Structure
```json
{
  "id": 1,
  "question": 5,
  "action_type": "SKIP_TO",
  "target_question": 10,
  "target_group": null,
  "priority": 1,
  "conditions": [...]
}
```

### 1. Skip To Logic

**Purpose**: Skip questions based on answers

**Example**: Skip to question 10 if user selects "Yes"
```json
{
  "question": 3,
  "action_type": "SKIP_TO",
  "target_question": 10,
  "priority": 1,
  "conditions": [
    {
      "source_question": 3,
      "operator": "SELECTED",
      "value": "1",
      "comparison_type": "CONSTANT"
    }
  ]
}
```

**Use Cases:**
- Age/demographic screening
- Product relevance filtering
- Conditional deep-dives

### 2. Display If Logic

**Purpose**: Show questions conditionally

**Example**: Show question 7 only if user answered > 5
```json
{
  "question": 7,
  "action_type": "DISPLAY_IF",
  "priority": 1,
  "conditions": [
    {
      "source_question": 4,
      "operator": "GT",
      "value": "5",
      "comparison_type": "CONSTANT"
    }
  ]
}
```

**Use Cases:**
- Follow-up questions
- Branching narratives
- Personalized content

### 3. End Survey Logic

**Purpose**: Terminate survey early

**Example**: End survey if user is under 18
```json
{
  "question": 2,
  "action_type": "END_SURVEY",
  "priority": 1,
  "conditions": [
    {
      "source_question": 2,
      "operator": "LT",
      "value": "18",
      "comparison_type": "CONSTANT"
    }
  ]
}
```

**Use Cases:**
- Screening/qualification
- Quota management
- Fraud detection

### 4. Mask Options Logic

**Purpose**: Hide answer choices dynamically

**Example**: Hide already selected items
```json
{
  "question": 8,
  "action_type": "MASK_OPTIONS",
  "priority": 1,
  "conditions": [
    {
      "source_question": 6,
      "operator": "SELECTED",
      "value": "Option_A",
      "comparison_type": "CONSTANT"
    }
  ]
}
```

**Use Cases:**
- Product filtering
- Duplicate prevention
- Multi-stage selection

---

## Conditions

### Operators

| Operator | Code | Input Type | Example | Description |
|----------|------|------------|---------|-------------|
| **Equals** | `EQ` | Any | `answer == "Yes"` | Exact match |
| **Not Equals** | `NEQ` | Any | `answer != "No"` | Not equal to |
| **Greater Than** | `GT` | Number | `age > 18` | Numeric comparison |
| **Less Than** | `LT` | Number | `score < 50` | Numeric comparison |
| **Greater/Equal** | `GTE` | Number | `income >= 50000` | Numeric comparison |
| **Less/Equal** | `LTE` | Number | `age <= 65` | Numeric comparison |
| **Contains** | `CONTAINS` | Text | `country contains "United"` | Substring match |
| **Selected** | `SELECTED` | Choice | `option_id in choices` | Choice is selected |
| **Not Selected** | `NOT_SELECTED` | Choice | `option_id not in choices` | Choice not selected |

### Comparison Types

#### 1. CONSTANT (Compare to fixed value)
```json
{
  "source_question": 5,
  "operator": "EQ",
  "value": "Yes",
  "comparison_type": "CONSTANT"
}
```
**Meaning**: "If answer to Q5 equals 'Yes'"

#### 2. VARIABLE (Compare to another question)
```json
{
  "source_question": 7,
  "operator": "GT",
  "target_question": 3,
  "comparison_type": "VARIABLE"
}
```
**Meaning**: "If answer to Q7 is greater than answer to Q3"

### Logic Operators (Combining Conditions)

| Operator | Code | Description |
|----------|------|-------------|
| **AND** | `AND` | All conditions must be true |
| **OR** | `OR` | At least one condition must be true |

### Condition Structure
```json
{
  "source_question": 3,
  "operator": "EQ",
  "value": "25",
  "target_question": null,
  "comparison_type": "CONSTANT",
  "logic_operator": "AND"
}
```

---

## Building Workflows

### Workflow 1: Age Screening

**Scenario**: Show adult content only to users 18+, otherwise end survey

**Questions:**
- Q1: What is your age? (Number Input)
- Q2: Adult content question

**Logic Setup:**

1. **Create Logic Node on Q2**
```http
POST /api/logic-nodes/
{
  "question": 2,
  "action_type": "DISPLAY_IF",
  "priority": 1
}
```

2. **Add Condition**
```http
POST /api/conditions/
{
  "logic_node": 1,
  "source_question": 1,
  "operator": "GTE",
  "value": "18",
  "comparison_type": "CONSTANT"
}
```

**Result**: Q2 only displays if Q1 answer >= 18

---

### Workflow 2: Product Interest Path

**Scenario**: Based on selected product category, skip to relevant section

**Questions:**
- Q1: Which product category interests you? (Radio)
  - Option A: Electronics (ID: 1)
  - Option B: Clothing (ID: 2)
  - Option C: Food (ID: 3)
- Q2-Q5: Electronics questions
- Q6-Q9: Clothing questions
- Q10-Q13: Food questions

**Logic Setup:**

**Skip to Electronics Section**
```http
POST /api/logic-nodes/
{
  "question": 1,
  "action_type": "SKIP_TO",
  "target_question": 2,
  "priority": 1
}

POST /api/conditions/
{
  "logic_node": <node_id>,
  "source_question": 1,
  "operator": "SELECTED",
  "value": "1",
  "comparison_type": "CONSTANT"
}
```

**Skip to Clothing Section**
```http
POST /api/logic-nodes/
{
  "question": 1,
  "action_type": "SKIP_TO",
  "target_question": 6,
  "priority": 2
}

POST /api/conditions/
{
  "logic_node": <node_id>,
  "source_question": 1,
  "operator": "SELECTED",
  "value": "2",
  "comparison_type": "CONSTANT"
}
```

**Result**: Survey branches based on selected category

---

### Workflow 3: Multi-Condition Qualification

**Scenario**: Show special offer only if user is premium member AND spends > $1000/month

**Questions:**
- Q1: Are you a premium member? (Yes/No)
- Q2: Monthly spending? (Number)
- Q3: Special offer details

**Logic Setup:**

```http
POST /api/logic-nodes/
{
  "question": 3,
  "action_type": "DISPLAY_IF",
  "priority": 1
}

POST /api/conditions/
{
  "logic_node": <node_id>,
  "source_question": 1,
  "operator": "EQ",
  "value": "Yes",
  "comparison_type": "CONSTANT",
  "logic_operator": "AND"
}

POST /api/conditions/
{
  "logic_node": <node_id>,
  "source_question": 2,
  "operator": "GT",
  "value": "1000",
  "comparison_type": "CONSTANT",
  "logic_operator": "AND"
}
```

**Result**: Q3 displays only if BOTH conditions are true

---

### Workflow 4: Option Masking

**Scenario**: In a "top 3 favorite brands" survey, mask brands already selected in previous rounds

**Questions:**
- Q1: What's your #1 favorite brand?
- Q2: What's your #2 favorite brand? (exclude Q1 answer)
- Q3: What's your #3 favorite brand? (exclude Q1 & Q2 answers)

**Logic for Q2:**
```http
POST /api/logic-nodes/
{
  "question": 2,
  "action_type": "MASK_OPTIONS",
  "priority": 1
}

POST /api/conditions/
{
  "logic_node": <node_id>,
  "source_question": 1,
  "operator": "SELECTED",
  "value": "<option_id>",
  "comparison_type": "CONSTANT"
}
```

**Note**: You need to create one condition per option to mask

---

## Advanced Examples

### Example 1: NPS Score-Based Logic

**Scenario**: Based on NPS score (0-10), show different follow-up questions

**Questions:**
- Q1: How likely are you to recommend us? (0-10)
- Q2: What did we do well? (Promoters: 9-10)
- Q3: What can we improve? (Detractors: 0-6)
- Q4: What would make you recommend us? (Passives: 7-8)

**Logic Nodes:**

**Promoters (9-10) → Q2**
```json
{
  "question": 2,
  "action_type": "DISPLAY_IF",
  "conditions": [{
    "source_question": 1,
    "operator": "GTE",
    "value": "9",
    "comparison_type": "CONSTANT"
  }]
}
```

**Detractors (0-6) → Q3**
```json
{
  "question": 3,
  "action_type": "DISPLAY_IF",
  "conditions": [{
    "source_question": 1,
    "operator": "LTE",
    "value": "6",
    "comparison_type": "CONSTANT"
  }]
}
```

**Passives (7-8) → Q4**
```json
{
  "question": 4,
  "action_type": "DISPLAY_IF",
  "conditions": [
    {
      "source_question": 1,
      "operator": "GTE",
      "value": "7",
      "comparison_type": "CONSTANT",
      "logic_operator": "AND"
    },
    {
      "source_question": 1,
      "operator": "LTE",
      "value": "8",
      "comparison_type": "CONSTANT",
      "logic_operator": "AND"
    }
  ]
}
```

---

### Example 2: Complex Screening Flow

**Scenario**: Multi-stage qualification with early termination

**Questions:**
- Q1: Country (Dropdown)
- Q2: Age (Number)
- Q3: Income (Number)
- Q4: Main survey starts...

**Logic:**

**Terminate if not target country**
```json
{
  "question": 1,
  "action_type": "END_SURVEY",
  "priority": 1,
  "conditions": [{
    "source_question": 1,
    "operator": "NEQ",
    "value": "India",
    "comparison_type": "CONSTANT"
  }]
}
```

**Terminate if age out of range**
```json
{
  "question": 2,
  "action_type": "END_SURVEY",
  "priority": 1,
  "conditions": [
    {
      "source_question": 2,
      "operator": "LT",
      "value": "18",
      "comparison_type": "CONSTANT",
      "logic_operator": "OR"
    },
    {
      "source_question": 2,
      "operator": "GT",
      "value": "65",
      "comparison_type": "CONSTANT",
      "logic_operator": "OR"
    }
  ]
}
```

**Terminate if income too low**
```json
{
  "question": 3,
  "action_type": "END_SURVEY",
  "priority": 1,
  "conditions": [{
    "source_question": 3,
    "operator": "LT",
    "value": "50000",
    "comparison_type": "CONSTANT"
  }]
}
```

---

### Example 3: Variable Comparison

**Scenario**: Show question only if Q7 answer is greater than Q3 answer

**Questions:**
- Q3: How many products did you buy last month?
- Q7: How many products do you plan to buy next month?
- Q8: Why the increase? (Show only if Q7 > Q3)

**Logic:**
```json
{
  "question": 8,
  "action_type": "DISPLAY_IF",
  "priority": 1,
  "conditions": [{
    "source_question": 7,
    "operator": "GT",
    "target_question": 3,
    "comparison_type": "VARIABLE"
  }]
}
```

---

## Best Practices

### 1. Priority Management
- **Lower numbers = Higher priority** (Priority 1 executes before Priority 2)
- Use priorities when multiple logic nodes can apply to the same question
- Common pattern: Termination logic = Priority 1, Skip logic = Priority 2, Display logic = Priority 3

### 2. Condition Ordering
- **AND logic**: Most restrictive condition first
- **OR logic**: Most likely condition first
- Group related conditions together

### 3. Variable Naming
- Use descriptive names: `user_age` instead of `var1`
- Include question number: `q5_satisfaction_score`
- Use snake_case: `favorite_product_category`

### 4. Testing Workflows
1. **Test each path**: Manually test all possible branching paths
2. **Edge cases**: Test boundary values (age = 18, score = 0, etc.)
3. **Combination testing**: Test multiple conditions together
4. **Negative testing**: Ensure disqualification works correctly

### 5. Performance Optimization
- Minimize nested logic (avoid logic on top of logic)
- Use SKIP_TO instead of multiple DISPLAY_IF when possible
- Keep condition count reasonable (< 5 per node)

### 6. User Experience
- **Clear termination messages**: Explain why survey ended
- **Logical flow**: Ensure question order makes sense
- **Avoid loops**: Don't create circular skip patterns
- **Progressive disclosure**: Show simple questions first

### 7. Common Patterns

**Disqualification Pattern**
```
Screening Question → END_SURVEY if criteria not met → Continue
```

**Branching Pattern**
```
Category Selection → SKIP_TO relevant section → Return to main flow
```

**Conditional Deep-Dive**
```
Yes/No Question → DISPLAY_IF details if Yes → Continue
```

**Progressive Filtering**
```
Broad Question → MASK_OPTIONS → Narrower Question → Final Selection
```

---

## API Quick Reference - Logic Engine

This guide covers the **Logic Engine APIs** for building visual workflow designers. These APIs allow frontend developers to create drag-and-drop survey flow builders where users can design conditional survey logic visually.

### 1. Variables API

Variables track answer data and are referenced in conditions.

**List Variables**
```http
GET /api/variables/
Authorization: Bearer {{access_token}}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "user_age",
    "display_name": "User Age",
    "type": "QV",
    "project": 5,
    "question": 12,
    "value": "25"
  }
]
```

---

### 2. Logic Nodes API

Logic nodes define **actions** that execute when **conditions** are met.

**List Logic Nodes for a Question**
```http
GET /api/logic-nodes/?question=5
Authorization: Bearer {{access_token}}
```

**Create Logic Node**
```http
POST /api/logic-nodes/
Content-Type: application/json
Authorization: Bearer {{access_token}}

{
  "question": 5,
  "action_type": "SKIP_TO",
  "target_question": 10,
  "priority": 1
}
```

**Action Types:**
- `SKIP_TO` - Jump to specific question (requires `target_question`)
- `DISPLAY_IF` - Show question conditionally
- `END_SURVEY` - Terminate survey immediately
- `MASK_OPTIONS` - Hide specific answer choices

**Update Logic Node**
```http
PATCH /api/logic-nodes/{id}/
Content-Type: application/json
Authorization: Bearer {{access_token}}

{
  "priority": 2,
  "action_type": "DISPLAY_IF"
}
```

**Delete Logic Node**
```http
DELETE /api/logic-nodes/{id}/
Authorization: Bearer {{access_token}}
```

**Response:**
```json
{
  "id": 1,
  "question": 5,
  "action_type": "SKIP_TO",
  "target_question": 10,
  "target_group": null,
  "priority": 1,
  "conditions": [...]
}
```

---

### 3. Conditions API

Conditions define **rules** that trigger logic node actions.

**List Conditions for a Logic Node**
```http
GET /api/conditions/?logic_node=1
Authorization: Bearer {{access_token}}
```

**Create Condition**
```http
POST /api/conditions/
Content-Type: application/json
Authorization: Bearer {{access_token}}

{
  "logic_node": 1,
  "source_question": 3,
  "operator": "EQ",
  "value": "Yes",
  "comparison_type": "CONSTANT",
  "logic_operator": "AND"
}
```

**Available Operators:**
- `EQ` - Equals
- `NEQ` - Not Equals
- `GT` - Greater Than
- `LT` - Less Than
- `GTE` - Greater Than or Equal
- `LTE` - Less Than or Equal
- `CONTAINS` - Contains substring
- `SELECTED` - Option is selected (for choice questions)
- `NOT_SELECTED` - Option not selected

**Comparison Types:**
- `CONSTANT` - Compare to fixed value (e.g., "Yes", "25")
- `VARIABLE` - Compare to another question's answer (use `target_question`)

**Logic Operators (for multiple conditions):**
- `AND` - All conditions must be true
- `OR` - At least one condition must be true

**Update Condition**
```http
PATCH /api/conditions/{id}/
Content-Type: application/json
Authorization: Bearer {{access_token}}

{
  "value": "No",
  "operator": "NEQ"
}
```

**Delete Condition**
```http
DELETE /api/conditions/{id}/
Authorization: Bearer {{access_token}}
```

**Response:**
```json
{
  "id": 1,
  "logic_node": 1,
  "source_question": 3,
  "operator": "EQ",
  "value": "Yes",
  "target_question": null,
  "comparison_type": "CONSTANT",
  "logic_operator": "AND"
}
```

---

### 4. Next Question Calculation (Logic Execution)

The logic engine evaluates all conditions and returns the next question to display.

**Calculate Next Question**
```http
POST /api/next-question/
Content-Type: application/json
Authorization: Bearer {{access_token}}

{
  "question_id": 1,
  "answer_data": {"value": "Yes"}
}
```

**Response:**
```json
{
  "next_question_id": 5,
  "action": "SKIP_TO",
  "end_survey": false,
  "message": "Skipping to question 5 based on logic condition"
}
```

**Response Fields:**
- `next_question_id` - ID of next question (null if survey ends)
- `action` - Action triggered (SKIP_TO, DISPLAY_IF, END_SURVEY, null)
- `end_survey` - Boolean, true if survey should terminate
- `message` - Human-readable explanation

---

### Complete API Documentation

For other APIs (Questions, Projects, Profiling, Quotas, Filters), refer to:
- **QuantAi_Complete_API.postman_collection.json** - Full collection with 75+ endpoints
- **NEW_FEATURES_SUMMARY.md** - Complete feature documentation

---

## Troubleshooting

### Common Issues

**1. Logic Not Triggering**
- ✓ Verify condition values match exactly (case-sensitive)
- ✓ Check operator is correct (EQ vs SELECTED for choices)
- ✓ Ensure source_question has been answered
- ✓ Verify comparison_type matches (CONSTANT vs VARIABLE)

**2. Multiple Actions Firing**
- ✓ Check priorities - only highest priority should execute
- ✓ Review condition overlap
- ✓ Ensure mutually exclusive conditions

**3. Variable Not Found**
- ✓ Verify variable was created for the question
- ✓ Check variable name spelling
- ✓ Ensure answer was submitted before logic evaluation

**4. Infinite Loops**
- ✓ Don't create circular skip patterns (Q1→Q2→Q1)
- ✓ Use END_SURVEY as escape condition
- ✓ Map out flow diagram before implementing

---

## Conclusion

The QuantAI workflow system provides powerful tools for creating dynamic, intelligent surveys. By combining logic nodes, conditions, and variables, you can build sophisticated survey flows that adapt to each respondent's answers.

### Key Takeaways
1. **Start Simple**: Build basic skip logic first, then add complexity
2. **Test Thoroughly**: Every path should be tested with real data
3. **Document Flows**: Keep a visual diagram of your survey logic
4. **Monitor Performance**: Track completion rates and drop-off points
5. **Iterate**: Refine logic based on respondent behavior

For additional support, consult the API documentation or contact the QuantAI development team.

---

**Version**: 1.0
**Last Updated**: December 2025
**Maintained by**: QuantAI Development Team