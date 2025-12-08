from django.db import models
from django.core.validators import MinValueValidator
import uuid as uuid_lib


class Language(models.Model):
    """Supported languages for projects"""
    code = models.CharField(max_length=10, unique=True)  # e.g., 'en', 'es', 'fr'
    name = models.CharField(max_length=100)  # e.g., 'English', 'Spanish'
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'languages'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class Project(models.Model):
    """Survey or Profiling Project"""

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

    LOGO_LOCATION_CHOICES = [
        ('center', 'Center'),
        ('left', 'Left'),
        ('right', 'Right'),
    ]

    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid_lib.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    languages = models.ManyToManyField(Language, related_name='projects', blank=True)
    active = models.BooleanField(default=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    reward_points = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0)],
        help_text="Points awarded for completion"
    )
    code = models.CharField(max_length=50, unique=True, help_text="Unique project identifier")
    project_type = models.CharField(max_length=2, choices=PROJECT_TYPE_CHOICES)
    mode = models.CharField(max_length=2, choices=PROJECT_MODE_CHOICES, default='DE')

    # Logo configuration
    logo = models.ImageField(
        upload_to='projects/logos/',
        blank=True,
        null=True,
        help_text="Project logo image file"
    )
    logo_width = models.IntegerField(blank=True, null=True, help_text="Logo width in pixels")
    logo_height = models.IntegerField(blank=True, null=True, help_text="Logo height in pixels")
    logo_location = models.CharField(
        max_length=10,
        choices=LOGO_LOCATION_CHOICES,
        blank=True,
        null=True,
        help_text="Logo position on screen"
    )
    fit_logo = models.BooleanField(default=True, help_text="Fit logo to specified dimensions")

    # Welcome message configuration
    display_welcome_message = models.BooleanField(default=False, help_text="Show welcome message")
    welcome_message = models.TextField(blank=True, null=True, help_text="Welcome message text")

    # Other messages
    display_thankyou_message = models.BooleanField(default=False, help_text="Show thank you message")
    thankyou_message = models.TextField(blank=True, null=True, help_text="Thank you message text")
    quotafull_message = models.TextField(blank=True, null=True, help_text="Message when participant limit is reached")
    terminate_message = models.TextField(blank=True, null=True, help_text="Message when survey is closed/terminated")
    navigation_message = models.TextField(blank=True, null=True, help_text="Navigation instructions")
    
    # Participant management
    participant_limit = models.IntegerField(
        blank=True, 
        null=True, 
        validators=[MinValueValidator(1)],
        help_text="Maximum number of participants allowed (e.g., 10000, 50000)"
    )

    # Button text customization
    start_btn_text = models.CharField(max_length=50, default="Start", help_text="Start button text")
    complete_btn_text = models.CharField(max_length=50, default="Complete", help_text="Complete button text")
    previous_btn_text = models.CharField(max_length=50, default="Previous", help_text="Previous button text")
    next_btn_text = models.CharField(max_length=50, default="Next", help_text="Next button text")

    # UI preferences
    show_progress_bar = models.BooleanField(default=True, help_text="Display progress bar")
    answer_preview = models.BooleanField(default=False, help_text="Allow answer preview before submission")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['project_type']),
            models.Index(fields=['active']),
            models.Index(fields=['start_time', 'end_time']),
        ]

    def __str__(self):
        return f"{self.title} ({self.code})"

    def clean(self):
        """Validate that start_time is before end_time"""
        from django.core.exceptions import ValidationError
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError('Start time must be before end time')

    def is_active_now(self):
        """Check if project is currently active and within time range"""
        from django.utils import timezone
        now = timezone.now()
        return self.active and self.start_time <= now <= self.end_time

    @property
    def logo_url(self):
        """Return the full URL of the logo file if it exists"""
        if self.logo:
            return self.logo.url
        return None


class ProjectFilter(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='filters')
    variable = models.ForeignKey('Questionlogic.Variable', on_delete=models.CASCADE, related_name='filters')
    options = models.ManyToManyField('Survey.QuestionChoices', related_name='filters')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'project_filters'

    def __str__(self):
        return f"Filter for {self.project.title}"


class ProjectAudianceDetails(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='audience_details')
    profile = models.ForeignKey('Users.Profile', on_delete=models.CASCADE, related_name='project_participations')
    next_options = models.ManyToManyField('Survey.QuestionChoices', related_name='next_in', blank=True)
    next_rows = models.ManyToManyField('Survey.QuestionRow', related_name='next_in', blank=True)
    next_columns = models.ManyToManyField('Survey.QuestionColumn', related_name='next_in', blank=True)
    status = models.CharField(max_length=50)
    last_status = models.CharField(max_length=50, blank=True, null=True)
    next_question = models.ForeignKey('Survey.Question', on_delete=models.SET_NULL, null=True, blank=True, related_name='next_for')
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

