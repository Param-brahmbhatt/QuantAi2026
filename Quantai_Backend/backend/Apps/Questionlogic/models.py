from django.db import models

class Variable(models.Model):
    VARIABLE_TYPE_CHOICES = [
        ('QV', 'Question Variable'),
        ('SV', 'Survey Variable'),
        ('PV', 'Profile Variable'),
        ('CV', 'Custom Variable'),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    project = models.ForeignKey('Projects.Project', on_delete=models.CASCADE, related_name='variables')
    question = models.OneToOneField('Survey.Question', on_delete=models.CASCADE, related_name='variable', null=True, blank=True)
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


class LogicNode(models.Model):
    ACTION_TYPE_CHOICES = [
        ('SKIP_TO', 'Skip To'),
        ('DISPLAY_IF', 'Display If'),
        ('END_SURVEY', 'End Survey'),
        ('MASK_OPTIONS', 'Mask Options'),
    ]

    id = models.AutoField(primary_key=True)
    question = models.ForeignKey('Survey.Question', on_delete=models.CASCADE, related_name='logic_nodes')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPE_CHOICES)
    target_question = models.ForeignKey('Survey.Question', on_delete=models.SET_NULL, null=True, blank=True, related_name='targeted_by_logic')
    target_group = models.ForeignKey('Survey.QuestionGroup', on_delete=models.SET_NULL, null=True, blank=True, related_name='targeted_by_logic')
    priority = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'logic_nodes'
        ordering = ['priority']

    def __str__(self):
        return f"{self.get_action_type_display()} for {self.question}"


class Condition(models.Model):
    OPERATOR_CHOICES = [
        ('EQ', 'Equals'),
        ('NEQ', 'Not Equals'),
        ('GT', 'Greater Than'),
        ('LT', 'Less Than'),
        ('GTE', 'Greater Than or Equal'),
        ('LTE', 'Less Than or Equal'),
        ('CONTAINS', 'Contains'),
        ('SELECTED', 'Selected'),
        ('NOT_SELECTED', 'Not Selected'),
    ]

    COMPARISON_TYPE_CHOICES = [
        ('CONSTANT', 'Constant Value'),
        ('VARIABLE', 'Variable/Question'),
    ]

    LOGIC_OPERATOR_CHOICES = [
        ('AND', 'And'),
        ('OR', 'Or'),
    ]

    id = models.AutoField(primary_key=True)
    logic_node = models.ForeignKey(LogicNode, on_delete=models.CASCADE, related_name='conditions')
    source_question = models.ForeignKey('Survey.Question', on_delete=models.CASCADE, related_name='source_conditions')
    operator = models.CharField(max_length=20, choices=OPERATOR_CHOICES)
    value = models.TextField(blank=True, null=True, help_text="Value for CONSTANT comparison")
    target_question = models.ForeignKey('Survey.Question', on_delete=models.SET_NULL, null=True, blank=True, related_name='target_conditions', help_text="Question for VARIABLE comparison")
    comparison_type = models.CharField(max_length=20, choices=COMPARISON_TYPE_CHOICES, default='CONSTANT')
    logic_operator = models.CharField(max_length=3, choices=LOGIC_OPERATOR_CHOICES, default='AND')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conditions'

    def __str__(self):
        return f"Condition for {self.logic_node}"

