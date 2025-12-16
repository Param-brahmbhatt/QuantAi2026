import logging
import json

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log Request Headers
        headers = dict(request.headers)
        logger.info(f"Request Headers: {json.dumps(headers, indent=2)}")

        # Log Request Body
        if request.body:
            try:
                body = json.loads(request.body)
                logger.info(f"Request Body: {json.dumps(body, indent=2)}")
            except json.JSONDecodeError:
                logger.info(f"Request Body (Raw): {request.body.decode('utf-8', errors='ignore')}")
        else:
            logger.info("Request Body: Empty")

        response = self.get_response(request)

        # Log Response Content
        # Note: StreamingHttpResponse does not have 'content' attribute accessible directly in the same way
        if hasattr(response, 'content'):
            try:
                content = json.loads(response.content)
                logger.info(f"Response Body: {json.dumps(content, indent=2)}")
            except json.JSONDecodeError:
                logger.info(f"Response Body (Raw): {response.content.decode('utf-8', errors='ignore')}")
        else:
             logger.info("Response Body: Streaming or no content")

        return response
