from .models import LogicNode, Condition
from Apps.Survey.models import Question

class SurveyLogicEngine:
    """
    Core engine for evaluating survey logic and determining the next question.
    """
    
    @staticmethod
    def evaluate_condition(condition, answer_data):
        """
        Evaluate a single condition against answer data.
        
        Args:
            condition: Condition instance
            answer_data: dict with answer values (e.g., {"value": "Yes"})
        
        Returns:
            bool: True if condition is met
        """
        source_value = answer_data.get('value')
        
        if condition.comparison_type == 'CONSTANT':
            target_value = condition.value
        else:
            # For VARIABLE comparison, you'd fetch the value from another question's answer
            # This is a simplified version
            target_value = condition.target_question.variable.value if condition.target_question else None
        
        # Evaluate based on operator
        operator = condition.operator
        
        if operator == 'EQ':
            return str(source_value) == str(target_value)
        elif operator == 'NEQ':
            return str(source_value) != str(target_value)
        elif operator == 'GT':
            try:
                return float(source_value) > float(target_value)
            except (ValueError, TypeError):
                return False
        elif operator == 'LT':
            try:
                return float(source_value) < float(target_value)
            except (ValueError, TypeError):
                return False
        elif operator == 'GTE':
            try:
                return float(source_value) >= float(target_value)
            except (ValueError, TypeError):
                return False
        elif operator == 'LTE':
            try:
                return float(source_value) <= float(target_value)
            except (ValueError, TypeError):
                return False
        elif operator == 'CONTAINS':
            return str(target_value).lower() in str(source_value).lower()
        elif operator == 'SELECTED':
            # For multiple choice - check if option is in answer
            return target_value in answer_data.get('options', [])
        elif operator == 'NOT_SELECTED':
            return target_value not in answer_data.get('options', [])
        
        return False
    
    @staticmethod
    def evaluate_logic_node(logic_node, answer_data):
        """
        Evaluate all conditions in a logic node.
        
        Args:
            logic_node: LogicNode instance
            answer_data: dict with answer values
        
        Returns:
            bool: True if all conditions are met (respecting AND/OR logic)
        """
        conditions = logic_node.conditions.all()
        
        if not conditions.exists():
            # No conditions means always execute
            return True
        
        # Group conditions by logic operator
        and_conditions = []
        or_conditions = []
        
        for condition in conditions:
            result = SurveyLogicEngine.evaluate_condition(condition, answer_data)
            if condition.logic_operator == 'AND':
                and_conditions.append(result)
            else:
                or_conditions.append(result)
        
        # Evaluate: All AND conditions must be True, OR at least one OR condition
        and_result = all(and_conditions) if and_conditions else True
        or_result = any(or_conditions) if or_conditions else False
        
        # If we have both, AND takes precedence
        if and_conditions and or_conditions:
            final_result = and_result and or_result
        elif and_conditions:
            final_result = and_result
        else:
            final_result = or_result
        
        return final_result
    
    @staticmethod
    def get_next_question(current_question, answer_data):
        """
        Determine the next question based on logic rules.
        
        Args:
            current_question: Question instance
            answer_data: dict with answer values
        
        Returns:
            Question instance or None (if survey should end)
        """
        # Fetch all logic nodes for this question, ordered by priority
        logic_nodes = LogicNode.objects.filter(
            question=current_question
        ).order_by('priority').prefetch_related('conditions')
        
        # Evaluate each logic node
        for logic_node in logic_nodes:
            if SurveyLogicEngine.evaluate_logic_node(logic_node, answer_data):
                # Logic matched - execute action
                if logic_node.action_type == 'SKIP_TO':
                    return logic_node.target_question
                elif logic_node.action_type == 'END_SURVEY':
                    return None
                elif logic_node.action_type == 'DISPLAY_IF':
                    # For DISPLAY_IF, we'd typically show/hide the target
                    # For now, treat it as a skip
                    return logic_node.target_question
                # MASK_OPTIONS would be handled differently (not affecting next question)
        
        # No logic matched - return next question by display_index
        next_question = Question.objects.filter(
            project=current_question.project,
            display_index__gt=current_question.display_index
        ).order_by('display_index').first()
        
        return next_question


# Convenience function for API usage
def calculate_next_question(question_id, answer_data):
    """
    Public API for calculating the next question.
    
    Args:
        question_id: ID of the current question
        answer_data: dict with answer values
    
    Returns:
        dict with next_question_id and action
    """
    try:
        current_question = Question.objects.get(id=question_id)
        next_question = SurveyLogicEngine.get_next_question(current_question, answer_data)
        
        if next_question:
            return {
                'next_question_id': next_question.id,
                'action': 'CONTINUE',
                'next_question': {
                    'id': next_question.id,
                    'title': next_question.title,
                    'question_type': next_question.question_type
                }
            }
        else:
            return {
                'next_question_id': None,
                'action': 'END_SURVEY'
            }
    except Question.DoesNotExist:
        return {
            'error': 'Question not found'
        }
