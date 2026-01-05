from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Variable, LogicNode, Condition
from .serializers import VariableSerializer, LogicNodeSerializer, ConditionSerializer
from .services import calculate_next_question

class VariableViewSet(viewsets.ModelViewSet):
    queryset = Variable.objects.all()
    serializer_class = VariableSerializer

    def get_queryset(self):
        """
        Filter variables based on user role.
        Variables belong to questions, which belong to projects.
        """
        user = self.request.user
        queryset = super().get_queryset()

        # Admins see all variables
        if user.profile_type in ['SU', 'DV', 'AD', 'AM']:
            return queryset

        # Clients see only variables from their own projects
        if user.profile_type in ['CL', 'CM']:
            return queryset.filter(question__project__created_by=user)

        # Audience and others: no access to question logic
        return Variable.objects.none()

class LogicNodeViewSet(viewsets.ModelViewSet):
    queryset = LogicNode.objects.all()
    serializer_class = LogicNodeSerializer

    def get_queryset(self):
        """
        Filter logic nodes based on user role.
        Logic nodes belong to questions, which belong to projects.
        """
        user = self.request.user
        queryset = super().get_queryset()

        # Admins see all logic nodes
        if user.profile_type in ['SU', 'DV', 'AD', 'AM']:
            return queryset

        # Clients see only logic nodes from their own projects
        if user.profile_type in ['CL', 'CM']:
            return queryset.filter(question__project__created_by=user)

        # Audience and others: no access to question logic
        return LogicNode.objects.none()

class ConditionViewSet(viewsets.ModelViewSet):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer

    def get_queryset(self):
        """
        Filter conditions based on user role.
        Conditions belong to logic nodes, which belong to questions/projects.
        """
        user = self.request.user
        queryset = super().get_queryset()

        # Admins see all conditions
        if user.profile_type in ['SU', 'DV', 'AD', 'AM']:
            return queryset

        # Clients see only conditions from their own projects
        if user.profile_type in ['CL', 'CM']:
            return queryset.filter(logic_node__question__project__created_by=user)

        # Audience and others: no access to question logic
        return Condition.objects.none()


@api_view(['POST'])
def next_question_view(request):
    """
    Calculate the next question based on current question and answer.
    
    Expected payload:
    {
        "question_id": 1,
        "answer_data": {"value": "Yes"}
    }
    """
    question_id = request.data.get('question_id')
    answer_data = request.data.get('answer_data', {})
    
    if not question_id:
        return Response({'error': 'question_id is required'}, status=400)
    
    result = calculate_next_question(question_id, answer_data)
    return Response(result)

