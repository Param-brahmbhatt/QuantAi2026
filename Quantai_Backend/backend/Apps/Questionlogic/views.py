from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Variable, LogicNode, Condition
from .serializers import VariableSerializer, LogicNodeSerializer, ConditionSerializer
from .services import calculate_next_question

class VariableViewSet(viewsets.ModelViewSet):
    queryset = Variable.objects.all()
    serializer_class = VariableSerializer

class LogicNodeViewSet(viewsets.ModelViewSet):
    queryset = LogicNode.objects.all()
    serializer_class = LogicNodeSerializer

class ConditionViewSet(viewsets.ModelViewSet):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer


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

