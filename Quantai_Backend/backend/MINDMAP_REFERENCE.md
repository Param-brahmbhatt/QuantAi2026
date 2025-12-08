# QuantAI Platform - Complete Mindmap Reference Documentation

**Source:** mindmap.svg
**Extracted:** 2025-11-08
**Purpose:** Complete reference for backend development

---

## Table of Contents
1. [Core Entities](#core-entities)
2. [Relationship Mappings](#relationship-mappings)
3. [Enums and Choices](#enums-and-choices)
4. [Complete Django Model Definitions](#complete-django-model-definitions)
5. [Business Logic & Validation Rules](#business-logic--validation-rules)
6. [Workflow Diagrams](#workflow-diagrams)
7. [API Endpoints](#api-endpoints)
8. [Database Constraints](#database-constraints)

---

## Core Entities

### 1. Profile
**Description:** User profiles for audience members, admins, and clients

**Attributes:**
- `id`: int (Primary Key)
- `uuid`: string (Unique identifier)
- `user`: OneToOne(auth.User) - Django authentication user
- `first_name`: string
- `last_name`: string
- `email`: string (unique)
- `phone`: string
- `citizen`: ForeignKey(Country)
- `social_id`: string
- `mobile_notification_id`: string
- `web_notification_id`: string
- `is_mobile_verified`: boolean
- `is_email_verified`: boolean
- `is_terms_accepted`: boolean
- `is_pp_accepted`: boolean (Privacy Policy)
- `profile_type`: char - Choices:
  - `AU` = Audience
  - `AD` = Admin
  - `CL` = Client
- `signup_type`: char - Choices:
  - `SO` = Standard
  - `SF` = Social/Facebook

**Relationships:**
- owns → Wallet (1:1)
- gives → Answer (1:*)
- initiates → Transaction (1:*)
- participates → ProjectAudianceDetails (1:*)

---

### 2. Wallet
**Description:** Manages user financial balances and rewards

**Attributes:**
- `id`: int (Primary Key)
- `profile`: OneToOne(Profile)
- `profiling_balance`: float
- `survey_balance`: float
- `total_withdrawal`: float
- `total_balance()`: property (calculated: profiling_balance + survey_balance - total_withdrawal)

**Relationships:**
- owned_by → Profile (1:1)

---

### 3. Project
**Description:** Survey or profiling questionnaire container

**Attributes:**
- `id`: int (Primary Key)
- `uuid`: string (Unique identifier)
- `title`: string
- `description`: text
- `languages`: ManyToMany(Language) - Multiple languages supported
- `active`: boolean - Is project active/live
- `start_time`: datetime
- `end_time`: datetime
- `reward_points`: float - Points awarded for completion
- `code`: string (unique) - Project identifier code
- `project_type`: char - Choices:
  - `SU` = Survey
  - `PR` = Profiling
- `mode`: char - Choices:
  - `DE` = Demo
  - `PR` = Production
  - `DM` = Development (inferred)
  - `LI` = Live (inferred)
  - `CO` = Completed (inferred)

**Note:** UI/logic fields omitted from diagram for brevity

**Relationships:**
- has → Question (1:*)
- groups → QuestionGroup (1:*)
- variable_for → Variable (1:*)
- filters → ProjectFilter (1:*)
- statuses → ProjectAudianceDetails (1:*)
- uses → Answer (1:*)
- relates → Transaction (1:*)

---

### 4. Question
**Description:** Individual survey question

**Attributes:**
- `id`: int (Primary Key)
- `project`: ForeignKey(Project) - Which project this question belongs to
- `variable_name`: string - Variable identifier for data collection
- `title`: text - Question text/prompt
- `description`: text - Additional context/help text
- `is_required`: boolean - Must be answered
- `is_initial_question`: boolean - First question in flow
- `display_index`: int - Order of display
- `question_type`: char - Type of question (multiple choice, text, etc.)
- `widget`: char - UI widget to render
- `file_upload_allowed_extention`: text - For file upload questions
- `option_rotation`: char - Randomize option order

**Relationships:**
- part_of → Project (1:1)
- answered_by → Answer (1:*)
- variable_of → Variable (1:1)
- related_transaction → Transaction (1:*)
- in_group → QuestionGroup (*:*)
- options → QuestionChoicesGroup (1:*)

---

### 5. QuestionGroup
**Description:** Groups questions into logical sections

**Attributes:**
- `id`: int (Primary Key)
- `project`: ForeignKey(Project)
- `title`: text
- `title_align`: char - Options: left, center, right
- `description`: text
- `description_align`: char - Options: left, center, right
- `questions`: ManyToMany(Question) - Multiple questions in group

**Relationships:**
- of → Project (*:1)
- includes → Question (*:*)
- group_for → Question (*:*)

---

### 6. QuestionChoicesGroup
**Description:** Groups answer options together

**Attributes:**
- `id`: int (Primary Key)
- `question`: ForeignKey(Question)
- `title`: text
- `title_align`: char
- `description`: text
- `description_align`: char
- `options`: ManyToMany(QuestionChoices)

**Relationships:**
- options → Question (*:1)
- part_of → Question (*:1)
- maps → QuestionChoices (*:*)

---

### 7. QuestionChoices
**Description:** Individual answer options for questions

**Attributes:**
- `id`: int (Primary Key)
- `text`: string - Display text for the choice
- `value`: string - Stored value
- `order`: int - Display order

**Relationships:**
- mapped_by → QuestionChoicesGroup (*:*)
- selected_in → Answer (*:*)

---

### 8. QuestionRow
**Description:** Rows for matrix-type questions

**Attributes:**
- `id`: int (Primary Key)
- `text`: string
- `order`: int

**Relationships:**
- used_in → ProjectAudianceDetails (*:*)

---

### 9. QuestionColumn
**Description:** Columns for matrix-type questions

**Attributes:**
- `id`: int (Primary Key)
- `text`: string
- `order`: int

**Relationships:**
- used_in → ProjectAudianceDetails (*:*)

---

### 10. Answer
**Description:** Stores survey responses from users

**Attributes:**
- `id`: int (Primary Key)
- `question`: ForeignKey(Question) - Which question was answered
- `project`: ForeignKey(Project) - Which project this answer belongs to
- `profile`: ForeignKey(Profile) - Who answered
- `variable`: ForeignKey(Variable) - Associated variable
- `option`: ManyToMany(QuestionChoices) - Selected options
- `input`: JSON - Free-text/custom input
- `input_row`: JSON - For matrix questions
- `is_demo`: boolean - Test/demo answer
- `is_last`: boolean - Last question answered

**Relationships:**
- answers → Question (*:1)
- for_project → Project (*:1)
- given_by → Profile (*:1)
- uses_variable → Variable (*:1)
- selects → QuestionChoices (*:*)

---

### 11. Variable
**Description:** Dynamic variables for logic and data

**Attributes:**
- `id`: int (Primary Key)
- `name`: string
- `project`: ForeignKey(Project)
- `question`: OneToOne(Question)
- `value`: text
- `type`: char - Choices:
  - `QV` = Question Variable
  - `SV` = Survey Variable
  - `PV` = Profile Variable
  - `CV` = Custom Variable

**Relationships:**
- variable_for → Project (*:1)
- variable_of → Question (1:1)
- used_by → Answer (1:*)

---

### 12. Transaction
**Description:** Financial/reward transactions

**Attributes:**
- `id`: int (Primary Key)
- `profile`: ForeignKey(Profile) - Who initiated
- `total_amount`: float
- `survey_amount`: float
- `profiling_amount`: float
- `project`: ForeignKey(Project, nullable=True)
- `question`: ForeignKey(Question, nullable=True)
- `t_type`: char - Transaction type:
  - `DEP` = Deposit
  - `WID` = Withdrawal
- `status`: char - Transaction status:
  - `PE` = Pending
  - `SU` = Success
  - `RE` = Rejected
  - `CA` = Cancelled

**Relationships:**
- initiated_by → Profile (*:1)
- for_project → Project (*:1, nullable)
- for_question → Question (*:1, nullable)

---

### 13. ProjectFilter
**Description:** Audience targeting criteria for projects

**Attributes:**
- `id`: int (Primary Key)
- `project`: ForeignKey(Project)
- `variable`: ForeignKey(Variable)
- `options`: ManyToMany(QuestionChoices)

**Relationships:**
- filters → Project (*:1)
- uses_variable → Variable (*:1)
- includes_options → QuestionChoices (*:*)

---

### 14. ProjectAudianceDetails
**Description:** Tracks individual participant progress through projects

**Attributes:**
- `id`: int (Primary Key)
- `project`: ForeignKey(Project)
- `profile`: ForeignKey(Profile)
- `next_options`: ManyToMany(QuestionChoices)
- `next_rows`: ManyToMany(QuestionRow)
- `next_columns`: ManyToMany(QuestionColumn)
- `status`: char - Current status
- `last_status`: char - Previous status
- `next_question`: ForeignKey(Question, nullable=True) - Next question in flow

**Relationships:**
- for_project → Project (*:1)
- for_profile → Profile (*:1)
- next_in_flow → Question (*:1, nullable)
- includes_options → QuestionChoices (*:*)
- includes_rows → QuestionRow (*:*)
- includes_columns → QuestionColumn (*:*)

---

## Relationship Mappings

### One-to-One Relationships
1. **Profile ↔ Wallet** (owns/owned_by)
2. **Question ↔ Variable** (variable_of/variable_for)
3. **Profile ↔ User** (Django auth.User)

### One-to-Many Relationships
1. **Profile → Answer** (gives/given_by)
2. **Profile → Transaction** (initiates/initiated_by)
3. **Profile → ProjectAudianceDetails** (participates/for_profile)
4. **Project → Question** (has/part_of)
5. **Project → QuestionGroup** (groups/of)
6. **Project → Variable** (variable_for/for_project)
7. **Project → ProjectFilter** (filters/for_project)
8. **Project → ProjectAudianceDetails** (statuses/for_project)
9. **Project → Answer** (uses/for_project)
10. **Project → Transaction** (relates/for_project)
11. **Question → Answer** (answered_by/answers)
12. **Question → Transaction** (related_transaction/for_question)
13. **Question → QuestionChoicesGroup** (options/part_of)

### Many-to-Many Relationships
1. **Project ↔ Language** (languages)
2. **Question ↔ QuestionGroup** (in_group/includes)
3. **QuestionChoicesGroup ↔ QuestionChoices** (maps)
4. **Answer ↔ QuestionChoices** (selects)
5. **ProjectFilter ↔ QuestionChoices** (includes_options)
6. **ProjectAudianceDetails ↔ QuestionChoices** (next_options)
7. **ProjectAudianceDetails ↔ QuestionRow** (next_rows)
8. **ProjectAudianceDetails ↔ QuestionColumn** (next_columns)

---

## Enums and Choices

### Profile Types
```python
PROFILE_TYPE_CHOICES = [
    ('AU', 'Audience'),
    ('AD', 'Admin'),
    ('CL', 'Client'),
]
```

### Signup Types
```python
SIGNUP_TYPE_CHOICES = [
    ('SO', 'Standard'),
    ('SF', 'Social/Facebook'),
]
```

### Project Types
```python
PROJECT_TYPE_CHOICES = [
    ('SU', 'Survey'),
    ('PR', 'Profiling'),
]
```

### Project Modes
```python
PROJECT_MODE_CHOICES = [
    ('DE', 'Demo'),
    ('PR', 'Production'),
    ('DM', 'Development'),
    ('LI', 'Live'),
    ('CO', 'Completed'),
]
```

### Transaction Types
```python
TRANSACTION_TYPE_CHOICES = [
    ('DEP', 'Deposit'),
    ('WID', 'Withdrawal'),
]
```

### Transaction Status
```python
TRANSACTION_STATUS_CHOICES = [
    ('PE', 'Pending'),
    ('SU', 'Success'),
    ('RE', 'Rejected'),
    ('CA', 'Cancelled'),
]
```

### Variable Types
```python
VARIABLE_TYPE_CHOICES = [
    ('QV', 'Question Variable'),
    ('SV', 'Survey Variable'),
    ('PV', 'Profile Variable'),
    ('CV', 'Custom Variable'),
]
```

---

## Complete Django Model Definitions

### Profile Model
```python
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    PROFILE_TYPE_CHOICES = [
        ('AU', 'Audience'),
        ('AD', 'Admin'),
        ('CL', 'Client'),
    ]

    SIGNUP_TYPE_CHOICES = [
        ('SO', 'Standard'),
        ('SF', 'Social/Facebook'),
    ]

    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    citizen = models.ForeignKey('Country', on_delete=models.SET_NULL, null=True)
    social_id = models.CharField(max_length=255, blank=True, null=True)
    mobile_notification_id = models.CharField(max_length=255, blank=True, null=True)
    web_notification_id = models.CharField(max_length=255, blank=True, null=True)
    is_mobile_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_terms_accepted = models.BooleanField(default=False)
    is_pp_accepted = models.BooleanField(default=False)
    profile_type = models.CharField(max_length=2, choices=PROFILE_TYPE_CHOICES, default='AU')
    signup_type = models.CharField(max_length=2, choices=SIGNUP_TYPE_CHOICES, default='SO')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['profile_type']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
```

### Wallet Model
```python
class Wallet(models.Model):
    id = models.AutoField(primary_key=True)
    profile = models.OneToOneField('Profile', on_delete=models.CASCADE, related_name='wallet')
    profiling_balance = models.FloatField(default=0.0)
    survey_balance = models.FloatField(default=0.0)
    total_withdrawal = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_balance(self):
        return self.profiling_balance + self.survey_balance - self.total_withdrawal

    class Meta:
        db_table = 'wallets'

    def __str__(self):
        return f"Wallet for {self.profile.email} - Balance: {self.total_balance}"
```

### Project Model
```python
class Project(models.Model):
    PROJECT_TYPE_CHOICES = [
        ('SU', 'Survey'),
        ('PR', 'Profiling'),
    ]

    PROJECT_MODE_CHOICES = [
        ('DE', 'Demo'),
        ('PR', 'Production'),
        ('DM', 'Development'),
        ('LI', 'Live'),
        ('CO', 'Completed'),
    ]

    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    languages = models.ManyToManyField('Language', related_name='projects')
    active = models.BooleanField(default=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    reward_points = models.FloatField(default=0.0)
    code = models.CharField(max_length=50, unique=True)
    project_type = models.CharField(max_length=2, choices=PROJECT_TYPE_CHOICES)
    mode = models.CharField(max_length=2, choices=PROJECT_MODE_CHOICES, default='DE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['project_type']),
            models.Index(fields=['active']),
        ]

    def __str__(self):
        return f"{self.title} ({self.code})"
```

### Question Model
```python
class Question(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='questions')
    variable_name = models.CharField(max_length=100)
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    is_required = models.BooleanField(default=False)
    is_initial_question = models.BooleanField(default=False)
    display_index = models.IntegerField(default=0)
    question_type = models.CharField(max_length=50)
    widget = models.CharField(max_length=50)
    file_upload_allowed_extention = models.TextField(blank=True, null=True)
    option_rotation = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'questions'
        ordering = ['display_index']
        indexes = [
            models.Index(fields=['project', 'display_index']),
            models.Index(fields=['is_initial_question']),
        ]

    def __str__(self):
        return f"Q{self.display_index}: {self.title[:50]}"
```

### QuestionGroup Model
```python
class QuestionGroup(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='question_groups')
    title = models.TextField()
    title_align = models.CharField(max_length=10, choices=[('left', 'Left'), ('center', 'Center'), ('right', 'Right')], default='left')
    description = models.TextField(blank=True, null=True)
    description_align = models.CharField(max_length=10, choices=[('left', 'Left'), ('center', 'Center'), ('right', 'Right')], default='left')
    questions = models.ManyToManyField('Question', related_name='groups')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'question_groups'

    def __str__(self):
        return f"Group: {self.title}"
```

### QuestionChoicesGroup Model
```python
class QuestionChoicesGroup(models.Model):
    id = models.AutoField(primary_key=True)
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name='choice_groups')
    title = models.TextField()
    title_align = models.CharField(max_length=10, default='left')
    description = models.TextField(blank=True, null=True)
    description_align = models.CharField(max_length=10, default='left')
    options = models.ManyToManyField('QuestionChoices', related_name='groups')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'question_choices_groups'

    def __str__(self):
        return f"Choices Group: {self.title}"
```

### QuestionChoices Model
```python
class QuestionChoices(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.CharField(max_length=255)
    value = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'question_choices'
        ordering = ['order']

    def __str__(self):
        return self.text
```

### QuestionRow Model
```python
class QuestionRow(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'question_rows'
        ordering = ['order']

    def __str__(self):
        return self.text
```

### QuestionColumn Model
```python
class QuestionColumn(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'question_columns'
        ordering = ['order']

    def __str__(self):
        return self.text
```

### Answer Model
```python
class Answer(models.Model):
    id = models.AutoField(primary_key=True)
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name='answers')
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='answers')
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='answers')
    variable = models.ForeignKey('Variable', on_delete=models.SET_NULL, null=True, related_name='answers')
    option = models.ManyToManyField('QuestionChoices', related_name='answers', blank=True)
    input = models.JSONField(blank=True, null=True)
    input_row = models.JSONField(blank=True, null=True)
    is_demo = models.BooleanField(default=False)
    is_last = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'answers'
        indexes = [
            models.Index(fields=['profile', 'project']),
            models.Index(fields=['question']),
        ]

    def __str__(self):
        return f"Answer by {self.profile.email} for Q{self.question.id}"
```

### Variable Model
```python
class Variable(models.Model):
    VARIABLE_TYPE_CHOICES = [
        ('QV', 'Question Variable'),
        ('SV', 'Survey Variable'),
        ('PV', 'Profile Variable'),
        ('CV', 'Custom Variable'),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='variables')
    question = models.OneToOneField('Question', on_delete=models.CASCADE, related_name='variable', null=True, blank=True)
    value = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=2, choices=VARIABLE_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'variables'
        indexes = [
            models.Index(fields=['project', 'name']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
```

### Transaction Model
```python
class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('DEP', 'Deposit'),
        ('WID', 'Withdrawal'),
    ]

    TRANSACTION_STATUS_CHOICES = [
        ('PE', 'Pending'),
        ('SU', 'Success'),
        ('RE', 'Rejected'),
        ('CA', 'Cancelled'),
    ]

    id = models.AutoField(primary_key=True)
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='transactions')
    total_amount = models.FloatField(default=0.0)
    survey_amount = models.FloatField(default=0.0)
    profiling_amount = models.FloatField(default=0.0)
    project = models.ForeignKey('Project', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    question = models.ForeignKey('Question', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    t_type = models.CharField(max_length=3, choices=TRANSACTION_TYPE_CHOICES)
    status = models.CharField(max_length=2, choices=TRANSACTION_STATUS_CHOICES, default='PE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        indexes = [
            models.Index(fields=['profile', 'status']),
            models.Index(fields=['t_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.get_t_type_display()} - {self.profile.email} - {self.total_amount}"
```

### ProjectFilter Model
```python
class ProjectFilter(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='filters')
    variable = models.ForeignKey('Variable', on_delete=models.CASCADE, related_name='filters')
    options = models.ManyToManyField('QuestionChoices', related_name='filters')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'project_filters'

    def __str__(self):
        return f"Filter for {self.project.title}"
```

### ProjectAudianceDetails Model
```python
class ProjectAudianceDetails(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='audience_details')
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='project_participations')
    next_options = models.ManyToManyField('QuestionChoices', related_name='next_in', blank=True)
    next_rows = models.ManyToManyField('QuestionRow', related_name='next_in', blank=True)
    next_columns = models.ManyToManyField('QuestionColumn', related_name='next_in', blank=True)
    status = models.CharField(max_length=50)
    last_status = models.CharField(max_length=50, blank=True, null=True)
    next_question = models.ForeignKey('Question', on_delete=models.SET_NULL, null=True, blank=True, related_name='next_for')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'project_audience_details'
        unique_together = [['project', 'profile']]
        indexes = [
            models.Index(fields=['project', 'profile']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.profile.email} - {self.project.title} - {self.status}"
```

---

## Business Logic & Validation Rules

### Profile Validation
- Email must be unique across all profiles
- Email verification required before participation in paid surveys
- Terms and Privacy Policy acceptance required for signup
- Profile type determines accessible features

### Project Validation
- start_time must be before end_time
- code must be unique
- Active projects cannot be deleted (must be deactivated first)
- Project must have at least one question before activation
- reward_points must be >= 0

### Question Validation
- Only one question per project can have is_initial_question = True
- display_index must be unique within a project
- Required questions cannot be skipped
- File upload questions must specify allowed extensions

### Answer Validation
- Profile must be eligible for the project (pass ProjectFilter criteria)
- Answer cannot be submitted for completed/closed projects
- Required questions must have valid input
- Demo answers (is_demo=True) don't count toward completion

### Transaction Validation
- Withdrawal amount cannot exceed available balance
- Transaction amounts must be >= 0
- Completed transactions cannot be modified
- Profile must have verified email for withdrawals

### Variable Validation
- Question Variables (QV) must have associated question
- Variable names must be unique within a project
- Survey Variables (SV) are project-level
- Profile Variables (PV) are user-specific

---

## Workflow Diagrams

### Survey Creation Workflow
```
1. Admin creates Project (title, description, dates, reward_points)
2. Admin adds Questions to Project
3. Admin organizes Questions into QuestionGroups (optional)
4. Admin configures Question logic (skip, branching)
5. Admin adds QuestionChoices for each question
6. Admin creates Variables for dynamic logic
7. Admin sets ProjectFilters for audience targeting
8. Admin activates Project (active=True)
9. System matches eligible Profiles
10. ProjectAudianceDetails created for each eligible Profile
```

### Survey Response Workflow
```
1. Profile logs in and sees available Projects
2. Profile starts Project → ProjectAudianceDetails status = "Started"
3. System shows initial question (is_initial_question=True)
4. Profile submits Answer
5. System creates Answer record
6. System evaluates logic/branching
7. System updates ProjectAudianceDetails.next_question
8. Repeat steps 3-7 until all questions answered
9. System marks ProjectAudianceDetails status = "Completed"
10. System creates Transaction (type=DEP) for reward_points
11. System updates Wallet balance
```

### Transaction Processing Workflow
```
1. Profile completes survey OR requests withdrawal
2. System creates Transaction record (status=PE)
3. System validates:
   - For Deposit: Project completion verified
   - For Withdrawal: Sufficient balance verified
4. If valid → status=SU, update Wallet
5. If invalid → status=RE, notify Profile
6. Profile can view transaction history
```

---

## API Endpoints (Inferred)

### Profile Endpoints
```
POST   /api/profiles/                    # Create profile (signup)
GET    /api/profiles/                    # List profiles (admin)
GET    /api/profiles/{id}/               # Get profile details
PUT    /api/profiles/{id}/               # Update profile
DELETE /api/profiles/{id}/               # Delete profile
GET    /api/profiles/{id}/wallet/       # Get wallet details
GET    /api/profiles/{id}/transactions/  # Get transaction history
GET    /api/profiles/{id}/answers/       # Get answer history
```

### Project Endpoints
```
POST   /api/projects/                    # Create project
GET    /api/projects/                    # List projects
GET    /api/projects/{id}/               # Get project details
PUT    /api/projects/{id}/               # Update project
DELETE /api/projects/{id}/               # Delete project
GET    /api/projects/{id}/questions/     # Get project questions
GET    /api/projects/{id}/participants/  # Get participant list
POST   /api/projects/{id}/activate/      # Activate project
POST   /api/projects/{id}/deactivate/    # Deactivate project
```

### Question Endpoints
```
POST   /api/questions/                   # Create question
GET    /api/questions/                   # List questions
GET    /api/questions/{id}/              # Get question details
PUT    /api/questions/{id}/              # Update question
DELETE /api/questions/{id}/              # Delete question
GET    /api/questions/{id}/choices/      # Get question choices
POST   /api/questions/{id}/choices/      # Add choice
```

### Answer Endpoints
```
POST   /api/answers/                     # Submit answer
GET    /api/answers/                     # List answers (admin)
GET    /api/answers/{id}/                # Get answer details
PUT    /api/answers/{id}/                # Update answer
DELETE /api/answers/{id}/                # Delete answer
```

### Transaction Endpoints
```
POST   /api/transactions/                # Create transaction
GET    /api/transactions/                # List transactions
GET    /api/transactions/{id}/           # Get transaction details
PUT    /api/transactions/{id}/status/    # Update status (admin)
```

### Wallet Endpoints
```
GET    /api/wallets/{profile_id}/        # Get wallet balance
POST   /api/wallets/{profile_id}/withdraw/ # Request withdrawal
GET    /api/wallets/{profile_id}/history/  # Transaction history
```

---

## Database Constraints

### Primary Keys
- All entities use auto-incrementing integer primary keys (id)

### Unique Constraints
- Profile.email (unique)
- Profile.uuid (unique)
- Project.code (unique)
- Project.uuid (unique)
- Wallet.profile (unique - enforced by OneToOne)
- Question.variable (unique - enforced by OneToOne)

### Unique Together
- ProjectAudianceDetails: (project, profile)

### Foreign Key Constraints
- Profile.citizen → Country (SET_NULL)
- Profile.user → User (CASCADE)
- Wallet.profile → Profile (CASCADE)
- Project relationships → CASCADE on delete
- Question.project → Project (CASCADE)
- Answer relationships → CASCADE (except variable: SET_NULL)
- Transaction.profile → Profile (CASCADE)
- Transaction.project → Project (SET_NULL)
- Transaction.question → Question (SET_NULL)
- Variable.project → Project (CASCADE)
- Variable.question → Question (CASCADE)

### Indexes (Recommended)
```sql
-- Profile
CREATE INDEX idx_profile_email ON profiles(email);
CREATE INDEX idx_profile_type ON profiles(profile_type);

-- Project
CREATE INDEX idx_project_code ON projects(code);
CREATE INDEX idx_project_type ON projects(project_type);
CREATE INDEX idx_project_active ON projects(active);

-- Question
CREATE INDEX idx_question_project_display ON questions(project_id, display_index);
CREATE INDEX idx_question_initial ON questions(is_initial_question);

-- Answer
CREATE INDEX idx_answer_profile_project ON answers(profile_id, project_id);
CREATE INDEX idx_answer_question ON answers(question_id);

-- Transaction
CREATE INDEX idx_transaction_profile_status ON transactions(profile_id, status);
CREATE INDEX idx_transaction_type ON transactions(t_type);
CREATE INDEX idx_transaction_created ON transactions(created_at);

-- Variable
CREATE INDEX idx_variable_project_name ON variables(project_id, name);
CREATE INDEX idx_variable_type ON variables(type);

-- ProjectAudianceDetails
CREATE INDEX idx_audience_project_profile ON project_audience_details(project_id, profile_id);
CREATE INDEX idx_audience_status ON project_audience_details(status);
```

---

## Additional Notes

### Security Considerations
- All user inputs must be sanitized
- Email verification required before withdrawals
- Transaction amounts validated server-side
- CSRF protection on all POST/PUT/DELETE endpoints
- Rate limiting on API endpoints
- Admin actions require elevated permissions

### Performance Optimization
- Use database indexes on frequently queried fields
- Implement caching for project lists and questions
- Lazy loading for related objects
- Pagination for large result sets
- Database connection pooling

### Future Enhancements (from documentation)
- Multi-language support for questions
- Blockchain integration for transaction transparency
- AI-powered question recommendations
- Advanced analytics dashboard
- Real-time collaboration features
- White-label customization

---

**End of Reference Documentation**

This document serves as the complete reference for implementing the QuantAI backend system based on the mindmap.svg schema diagram.