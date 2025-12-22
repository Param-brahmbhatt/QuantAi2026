from django.db import models
from Apps.Projects.models import Project


class Question(models.Model):
    """Individual survey question"""

    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='questions',
        null=True,
        blank=True,
        help_text="Project this question belongs to (null for profiling questions)"
    )
    is_profiling_question = models.BooleanField(
        default=False,
        help_text="True if this is a standalone profiling question (asked during onboarding)"
    )
    variable_name = models.CharField(max_length=100, help_text="Variable identifier for data collection")
    title = models.TextField(help_text="Question text/prompt")
    description = models.TextField(blank=True, null=True, help_text="Additional context/help text")
    is_required = models.BooleanField(default=False, help_text="Must be answered")
    is_initial_question = models.BooleanField(default=False, help_text="First question in flow")
    display_index = models.IntegerField(default=0, help_text="Order of display")
    QUESTION_TYPE_CHOICES = [
        ('RDO', 'Single Selection (Radio)'),
        ('CHB', 'Multiple Selection (Checkbox)'),
        ('DRP', 'Dropdown Menu'),
        ('TXT', 'Short Text Input'),
        ('TXTL', 'Long Text Input'),
        ('RAT', 'Rating Scale (Likert/Star)'),
        ('NPS', 'Net Promoter Score'),
        ('SLI', 'Slider Scale'),
        ('RNK', 'Ranking'),
        ('MTX', 'Matrix/Grid'),
        ('FIL', 'File Upload'),
        ('DT', 'Date/Time Picker'),
        ('IMG', 'Image Choice'),
        ('SIG', 'Signature Capture'),
        ('GEO', 'Geolocation'),
        ('AV', 'Audio/Video Response'),
        ('EML', 'Email Address'),
        ('PHN', 'Phone Number'),
        ('URL', 'Website URL'),
        ('NUM', 'Numeric Input'),
        ('ADR', 'Address'),
        ('CTI', 'Contact Information'),
    ]

    question_type = models.CharField(max_length=5, choices=QUESTION_TYPE_CHOICES, help_text="Type of question")
    widget = models.CharField(max_length=50, help_text="UI widget to render")
    file_upload_allowed_extention = models.TextField(
        blank=True,
        null=True,
        help_text="For file upload questions (comma-separated)"
    )
    option_rotation = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Randomize option order"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'questions'
        ordering = ['display_index']
        indexes = [
            models.Index(fields=['project', 'display_index']),
            models.Index(fields=['is_initial_question']),
            models.Index(fields=['is_profiling_question', 'display_index']),
        ]

    def __str__(self):
        return f"Q{self.display_index}: {self.title[:50]}"


class QuestionGroup(models.Model):
    """Groups questions into logical sections"""

    ALIGN_CHOICES = [
        ('left', 'Left'),
        ('center', 'Center'),
        ('right', 'Right'),
    ]

    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='question_groups'
    )
    title = models.TextField()
    title_align = models.CharField(max_length=10, choices=ALIGN_CHOICES, default='left')
    description = models.TextField(blank=True, null=True)
    description_align = models.CharField(max_length=10, choices=ALIGN_CHOICES, default='left')
    questions = models.ManyToManyField('Question', related_name='groups', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'question_groups'

    def __str__(self):
        return f"Group: {self.title}"


class QuestionChoices(models.Model):
    """Individual answer options for questions"""

    id = models.AutoField(primary_key=True)
    text = models.CharField(max_length=255, help_text="Display text for the choice")
    value = models.CharField(max_length=255, help_text="Stored value")
    order = models.IntegerField(default=0, help_text="Display order")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'question_choices'
        ordering = ['order']
        verbose_name_plural = 'Question Choices'

    def __str__(self):
        return self.text


class QuestionChoicesGroup(models.Model):
    """Groups answer options together"""

    ALIGN_CHOICES = [
        ('left', 'Left'),
        ('center', 'Center'),
        ('right', 'Right'),
    ]

    id = models.AutoField(primary_key=True)
    question = models.ForeignKey(
        'Question',
        on_delete=models.CASCADE,
        related_name='choice_groups'
    )
    title = models.TextField()
    title_align = models.CharField(max_length=10, default='left')
    description = models.TextField(blank=True, null=True)
    description_align = models.CharField(max_length=10, default='left')
    options = models.ManyToManyField(QuestionChoices, related_name='groups', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'question_choices_groups'

    def __str__(self):
        return f"Choices Group: {self.title}"


class QuestionRow(models.Model):
    """Rows for matrix-type questions"""

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


class QuestionColumn(models.Model):
    """Columns for matrix-type questions"""

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


class Answer(models.Model):
    id = models.AutoField(primary_key=True)
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name='answers')
    project = models.ForeignKey(
        'Projects.Project',
        on_delete=models.CASCADE,
        related_name='answers',
        null=True,
        blank=True,
        help_text="Project this answer belongs to (null for profiling answers)"
    )
    profile = models.ForeignKey('Users.Profile', on_delete=models.CASCADE, related_name='answers')
    variable = models.ForeignKey('Questionlogic.Variable', on_delete=models.SET_NULL, null=True, related_name='answers')
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

    @property
    def value(self):
        """
        Extract the actual answer value from option or input
        Returns the stored value regardless of answer type
        """
        # For choice-based questions (option is ManyToMany)
        options = self.option.all()
        if options.exists():
            if options.count() == 1:
                # Single choice - return the value
                return options.first().value
            else:
                # Multiple choice - return list of values
                return [opt.value for opt in options]

        # For text/number/date inputs
        if self.input is not None:
            return self.input

        # For matrix/grid questions
        if self.input_row is not None:
            return self.input_row

        return None

    def __str__(self):
        return f"Answer by {self.profile.email} for Q{self.question.id}"

