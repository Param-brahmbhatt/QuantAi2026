from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.apps import apps
from django.db.models import Q

from model_utils import FieldTracker

from libs.models import (
    AbstractLoggingModel,
)


class Question(AbstractLoggingModel):
    project = models.ForeignKey(
        'Projects.Project',
        on_delete=models.CASCADE,
        related_name='questions',
    )
    variable_name = models.CharField(
        max_length=50,
    )
    title = models.TextField()
    description = models.TextField(
        null=True,
        blank=True,
    )
    is_required = models.BooleanField(
        default=True,
    )
    is_initial_question = models.BooleanField(
        default=False
    )
    display_index = models.PositiveIntegerField(
        default=1
    )
    question_type = models.CharField(
        max_length=3,
        choices=(
            ("RDO", "Radio"),
            ("RAT", "Rating"),
            ("DRP", "Drop Down"),
            ("CHB", "Check Box"),
            ("TAB", "Tag Box"),
            ("BOL", "Boolean"),
            ("SIG", "Single Input"), # input_option
            ("COM", "Comment"), # input_option
            ("MUT", "Multiple Text"), # 
            ("SCM", "Single Choice Matrix"),
            ("MCM", "Multi Choice Matrix"),
        ),
    )

    # only for open text box questions : SIG, MUT
    widget = models.CharField(
        max_length=2,
        choices=(
            ("TO", "Text Only"),
            ("NO", "Numeric Only"),
            ("DI", "Date in DDMMYYYY"),
            ("DT", "Date & Time"),
            ("MY", "Month & Year"),
            ("FI", "File Upload"),
            ("PH", "Phone Number"),
        ),
        null=True,
        blank=True,
    )
    file_upload_allowed_extention = models.TextField(
        null = True,
        blank = True,
    )

    option_rotation = models.CharField(
        max_length=2,
        choices=(
            ("NR", "No Rotation"),
            ("RD", "Random"),
            ("RT", "Rotate"),
        ),
        default="NR"
    )

    row_rotation = models.CharField(
        max_length=2,
        choices=(
            ("NR", "No Rotation"),
            ("RD", "Random"),
            ("RT", "Rotate"),
        ),
        default="NR"
    )

    column_rotation = models.CharField(
        max_length=2,
        choices=(
            ("NR", "No Rotation"),
            ("RD", "Random"),
            ("RT", "Rotate"),
        ),
        default="NR"
    ) 

    # # Radio Group

    # # Rating 
    min_rate_value = models.FloatField(
        default=0.0
    )
    min_rate_description = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )
    max_rate_value = models.FloatField(
        default=0.0
    )
    max_rate_description = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )
    rate_step = models.FloatField(
        default=0.0
    )
    display_edge_as_description = models.BooleanField(
        default=True
    )

    # # Dropdown Settings / Checkbox settings
    allow_none = models.BooleanField(
        default=False
    )
    allow_select_all = models.BooleanField(
        default = False
    )
    show_clear_button = models.BooleanField(
        default = False
    )

    # # Single Input / Comment / Other for MCM SCM
    placeholder_text = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    # # Multiple Text

    # # "Single Choice Matrix / Multi Choide Matrix
    allow_other = models.BooleanField(
        default = False
    )

    # for rotation
    last_rotate_options = models.PositiveBigIntegerField(
        default=0
    )
    last_rotate_rows = models.PositiveBigIntegerField(
        default=0
    )
    last_rotate_columns = models.PositiveBigIntegerField(
        default=0
    )

    # MMQ 
    selective_response_mmq = models.BooleanField(
        default=False
    )
    open_end_input_mmq = models.BooleanField(
        default=False
    )
    no_of_open_end_in_mmq = models.PositiveIntegerField(
        default=0
    )

    tracker = FieldTracker()

    def FindNextQuestion(self, profile):
        active_groups = []
        next_question = None
        next_type = None
        for group in self.logic_groups.all().order_by('priority'): # and_or
            sucess = 0
            for condition in group.conditions.all():
                try:
                    if condition.comparison_to_variable:
                        try:
                            if condition.variable_type == "CV":
                                if eval(f'{condition.variable_value.answer_count} {condition.get_condition_display()} {condition.comparison_variable_value.answer_count}'):
                                    sucess += 1
                            elif condition.variable_type in ["QV", "PV"]:
                                try:
                                    answer_option = condition.variable.answers.get(
                                        project = self.project,
                                        profile = profile,
                                        is_demo = False,
                                        is_last = True
                                    )
                                    if condition.variable_value in answer.option.all() and condition.condition == "SEL":
                                        sucess +=1
                                    if condition.variable_value not in answer.option.all() and condition.condition == "NSE":
                                        sucess +=1 
                                except Exception as e:
                                    pass
                            else:
                                if eval(f'{condition.variable_value} {condition.get_condition_display()} {condition.comparison_variable_value}'):
                                    sucess += 1
                        except Exception as e:
                            pass
                    else:
                        # comparision to value entered 
                        try:
                            if condition.variable_type == "CV":
                                if eval(f'{condition.variable_value.answer_count} {condition.get_condition_display()} {condition.comparison_input}'):
                                    sucess += 1
                            elif condition.variable_type in ["QV", "PV"]:
                                try:
                                    answer = condition.variable.answers.get(
                                        project = self.project,
                                        profile = profile,
                                        is_demo = False,
                                        is_last = True
                                    )
                                    if condition.variable_value in answer.option.all() and condition.condition == "SEL":
                                        sucess +=1
                                    if condition.variable_value not in answer.option.all() and condition.condition == "NSE":
                                        sucess +=1 
                                except Exception as e:
                                    pass
                            else:
                                if eval(f'{condition.variable_value.value} {condition.get_condition_display()} {condition.comparison_input}'):
                                    sucess += 1
                        except Exception as e:
                            pass
                except Exception as e:
                    pass
            if sucess > 0 :
                if group.and_or: # or 
                    # return True, group.route.next_question, group.route.next_options.all(),  group.route.next_rows.all(),  group.route.next_columns.all(), group.route.next_type
                    active_groups.append(group.id)
                    if not next_question:
                        next_question = group.route.next_question
                    if not next_type:
                        next_type = group.route.next_type
                else:
                    if sucess == group.conditions.count():
                        # return True, group.route.next_question, group.route.next_options.all(), group.route.next_rows.all(),  group.route.next_columns.all(), group.route.next_type
                        active_groups.append(group.id)
                        if not next_question:
                            next_question = group.route.next_question
                        if not next_type:
                            next_type = group.route.next_type
        if len(active_groups) > 0:
            if len(active_groups) == 1:
                group = self.logic_groups.get(id = active_groups[0])
                return True, group.route.next_question, group.route.next_options.all(),  group.route.next_rows.all(),  group.route.next_columns.all(), group.route.next_type
            else:
                active_groups = self.logic_groups.filter(id__in = active_groups, route__next_question = next_question, route__next_type = next_type)
                next_options = QuestionChoices.objects.filter( route_options__logic_group__in = active_groups )
                next_rows = QuestionRow.objects.filter(route_rows__logic_group__in = active_groups)
                next_columns = QuestionColumn.objects.filter(route_columns__logic_group__in = active_groups)
                return True, next_question, next_options, next_rows,  next_columns, next_type
                

        if self.default_route.next_type not in ['QUE']:
            return False, None, None, None, None, self.default_route.next_type
        else:
            return True, self.default_route.next_question, self.default_route.next_options.all(), self.default_route.next_rows.all(),  self.default_route.next_columns.all(), self.default_route.next_type
        
    def __str__(self, *args, **kwargs):
        if self.id:
            return self.title
        else:
            return "Un-saved Question"
    
    class Meta:
        pass
        # unique_together = ['']

@receiver(pre_save, sender=Question)
def SetDisplayIndex(sender, instance, *args, **kwargs):
    if not instance.id:
        try:
            display_index = instance.project.questions.all().order_by('-display_index')[0].display_index
        except Exception as e:
            display_index = 1
        instance.display_index = display_index + 1

@receiver(pre_save, sender=Question)
def SetVariableNameUpper(sender, instance, *args, **kwargs):
    instance.variable_name = instance.variable_name.upper()

@receiver(post_save, sender=Question)
def updateVariableToVariableRegistry(sender, instance, *args, **kwargs):
    try:
        instance.variable.name = instance.variable_name
        instance.variable.save()
    except Exception as e:
        apps.get_model('Variables.Variable').objects.create(
            type = "PV" if instance.project.project_type == "PR" else "QV",
            name = instance.variable_name,
            project = instance.project,
            question = instance
        )
    if instance.tracker.previous('is_initial_question') != instance.is_initial_question and instance.is_initial_question == True:
        instance.project.questions.filter(~Q(id = instance.id)).update(is_initial_question = False)

@receiver(post_save, sender=Question)
def RemoveOtherInCaseOtherChanges(sender, instance, *args, **kwargs):
    if instance.allow_other == False and instance.question_type not in ['SCM', 'MCM']:
        instance.options.filter(is_other = True).delete()

class QuestionRow(AbstractLoggingModel):
    question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.CASCADE,
        related_name='rows',
    )
    label = models.TextField()
    is_other = models.BooleanField(
        default=False,
    )
    option_rotation_anchor = models.BooleanField(
        default=False
    )
    ui_index = models.PositiveBigIntegerField(null=True,blank=True)

@receiver(post_save, sender=QuestionRow)
def UpdateOptionVariableNameForRow(sender, instance, *args, **kwargs):
    if not kwargs['created']:
        for option in instance.options.all():
            option.save()

class QuestionColumn(AbstractLoggingModel):
    question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.CASCADE,
        related_name='columns',
    )
    label = models.TextField()
    column_type = models.CharField(
        max_length=3,
        choices=(
            ("RDO", "Radio"),
            ("RAT", "Rating"),
            ("DRP", "Drop Down"),
            ("CHB", "Check Box"),
            ("TAB", "Tag Box"),
            ("BOL", "Boolean"),
            ("SIG", "Single Input"),
            ("COM", "Comment"),
            ("MUT", "Multiple Text"),
        ),
        default="RDO"
    )
    option_rotation_anchor = models.BooleanField(
        default=False
    )
    ui_index = models.PositiveBigIntegerField(null=True,blank=True)

@receiver(post_save, sender=QuestionColumn)
def UpdateOptionVariableNameForColumn(sender, instance, *args, **kwargs):
    if not kwargs['created']:
        for option in instance.options.all():
            option.save()

class QuestionMasterChoices(AbstractLoggingModel):
    column = models.ForeignKey(
        'Questions.QuestionColumn',
        on_delete=models.CASCADE,
        related_name='master_options',
        null=True,
        blank=True,
    )
    variable_name = models.CharField(
        max_length=200,
    )
    label = models.TextField()
    value = models.TextField()
    option_rotation_anchor = models.BooleanField(
        default=False
    )
    ui_index = models.PositiveBigIntegerField()
    is_other = models.BooleanField(
        default=False,
    ) 

@receiver(pre_save, sender=QuestionMasterChoices)
def AssignVariableNameOfCreateObjectQuestionMasterChoices(sender, instance, *Args, **kwargs):
    instance.variable_name = f'{instance.column.question.variable_name}_{instance.column.label.replace(" ", "_")}_{instance.value}'.upper()

@receiver(post_save, sender=QuestionMasterChoices)
def UpdateChildOptions(sender, instance, *args, **kwargs):
    if kwargs['created']:
        for row in instance.column.question.rows.all():
            instance.options.create(
                question = instance.column.question,
                row =row,
                column = instance.column,
                label = instance.label,
                value = instance.value,
                option_rotation_anchor = instance.option_rotation_anchor,
                ui_index = instance.ui_index,
                is_other = instance.is_other,
            )
    else:
        for option in instance.options.all():
            option.label = instance.label
            option.value = instance.value
            option.option_rotation_anchor = instance.option_rotation_anchor
            option.ui_index = instance.ui_index
            option.is_other = instance.is_other
            option.save()

class QuestionChoices(AbstractLoggingModel):
    question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.CASCADE,
        related_name='options',
    )
    master_option = models.ForeignKey(
        'Questions.QuestionMasterChoices',
        on_delete=models.CASCADE,
        related_name='options',
        null=True,
        blank=True,
    )
    row = models.ForeignKey(
        'Questions.QuestionRow',
        on_delete=models.CASCADE,
        related_name='options',
        null=True,
        blank=True,
    )
    column = models.ForeignKey(
        'Questions.QuestionColumn',
        on_delete=models.CASCADE,
        related_name='options',
        null=True,
        blank=True,
    )
    variable_name = models.CharField(
        max_length=200,
    )
    label = models.TextField()
    value = models.TextField()
    option_rotation_anchor = models.BooleanField(
        default=False
    )
    ui_index = models.PositiveBigIntegerField()
    is_other = models.BooleanField(
        default=False,
    )
    
    @property
    def answer_count(self):
        return self.answers.filter( is_demo = (
                True if not self.question.project.mode == "LI" else False
            )
        )
    
    class Meta:
        unique_together = ['question', 'variable_name']
        ordering = ['ui_index']

@receiver(pre_save, sender=QuestionChoices)
def AssignVariableNameOfCreateObject(sender, instance, *Args, **kwargs):
    if instance.column and instance.row:
        instance.variable_name = f'{instance.question.variable_name}_{instance.row.label.replace(" ", "_")}_{instance.column.label.replace(" ", "_")}_{instance.value}'.upper()
    else:
        instance.variable_name = f'{instance.question.variable_name}_{instance.value}'.upper()

class DefaultLogicRoute(AbstractLoggingModel):
    question = models.OneToOneField(
        'Questions.Question',
        on_delete=models.CASCADE,
        related_name='default_route',
    )
    # route variables 
    next_type = models.CharField(
        max_length=3,
        choices=(
            ("QUE", "Question"),
            ("TER", "Terminate"),
            # ("QUO", "Quota"),
            ("COM", "Completed"),
        )
    )
    next_question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.CASCADE,
        related_name='deafault_from_route',
        null=True,
        blank=True,
    )
    next_options = models.ManyToManyField(
        'Questions.QuestionChoices',
        related_name='default_route_options',
        null=True,
        blank=True,
    )
    next_rows = models.ManyToManyField(
        'Questions.QuestionRow',
        related_name='default_route_rows',
        null=True,
        blank=True,
    )
    next_columns = models.ManyToManyField(
        'Questions.QuestionColumn',
        related_name='default_route_columns',
        null=True,
        blank=True,
    )

@receiver(post_save, sender=DefaultLogicRoute)
def SetNextOptionsIncaseOfRowAndColumnGivenForDefaultRoute(sender, instance, *args, **kwargs):
    if instance.next_rows.all().count() > 0 and instance.next_columns.all().count() > 0 and instance.id:
        instance.next_options.clear()
        instance.next_options.set(
            instance.next_question.options.filter( 
                row__in = instance.next_rows.all(),
                column__in = instance.next_columns.all(),
            )
        )

class LogicGroup(AbstractLoggingModel):
    question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.CASCADE,
        related_name='logic_groups',
    )
    and_or = models.SmallIntegerField(
        choices=(
            (0, "And"),
            (1, "Or")
        )
    )
    priority = models.PositiveBigIntegerField()

    class Meta:
        unique_together = ['question', 'priority']
    

class LogicCondition(AbstractLoggingModel):
    logic_group = models.ForeignKey(
        'Questions.LogicGroup',
        on_delete=models.CASCADE,
        related_name='conditions',
    )

    # condition variables    
    variable_type = models.CharField(
        max_length=2,
        choices=(
            ('QV', 'Question Variable'),
            ('SV', 'Survey Variable'),
            ('PV', 'Profilling Variable'),
            ('CV', 'Counter'),  
        )
    )
    variable = models.ForeignKey(
        'Variables.Variable',
        on_delete=models.CASCADE,
        related_name='logic_conditions'
    )
    variable_value = models.ForeignKey(
        'Questions.QuestionChoices',
        on_delete=models.CASCADE,
        related_name='lhs_variables',
        null=True,
        blank=True,
    )
    condition = models.CharField(
        max_length=3,
        choices=(
            ("GT", ">"),
            ("LT", "<"),
            ("GTE", ">="),
            ("LTE", "<="),
            ("EQ", "=="),
            ("NE", "!="),
            ("SEL", "=="), # selected
            ("NSE", "!="), # not selected
        )
    )
    comparison_to_variable = models.BooleanField()
    comparison_input = models.CharField(
        max_length=50,
        null=True,
        blank=True,
    )
    comparison_variable_type = models.CharField(
        max_length=2,
        choices=(
            ('QV', 'Question Variable'),
            ('SV', 'Survey Variable'),
            ('PV', 'Profilling Variable'),
            ('CV', 'Counter Variable'),  
        ),
        null=True,
        blank=True,
    )
    comparison_variable = models.ForeignKey(
        'Variables.Variable',
        on_delete=models.CASCADE,
        related_name='comparison_conditions',
        null=True,
        blank=True,
    )
    comparison_variable_value = models.ForeignKey(
        'Questions.QuestionChoices',
        on_delete=models.CASCADE,
        related_name='rhs_variables',
        null=True,
        blank=True,
    )

class LogicRoute(AbstractLoggingModel):
    logic_group = models.OneToOneField(
        'Questions.LogicGroup',
        on_delete=models.CASCADE,
        related_name='route',
    )
    # route variables 
    next_type = models.CharField(
        max_length=3,
        choices=(
            ("QUE", "Question"),
            ("TER", "Terminate"),
            ("QUO", "Quota"),
            ("COM", "Completed"),
        )
    )
    next_question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.CASCADE,
        related_name='from_route',
        null=True,
        blank=True,
    )
    next_options = models.ManyToManyField(
        'Questions.QuestionChoices',
        related_name='route_options',
        null=True,
        blank=True,
    )
    next_rows = models.ManyToManyField(
        'Questions.QuestionRow',
        related_name='route_rows',
        null=True,
        blank=True,
    )
    next_columns = models.ManyToManyField(
        'Questions.QuestionColumn',
        related_name='route_columns',
        null=True,
        blank=True,
    )

@receiver(post_save, sender=LogicRoute)
def SetNextOptionsIncaseOfRowAndColumnGivenForRoute(sender, instance, *args, **kwargs):
    if instance.next_rows.all().count() > 0 and instance.next_columns.all().count() > 0 :
        instance.next_options.clear()
        instance.next_options.set(
            instance.next_question.options.filter( 
                row__in = instance.next_rows.all(),
                column__in = instance.next_columns.all(),
            )
        )