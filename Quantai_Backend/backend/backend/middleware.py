import logging
import json

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    """
    Middleware to log request and response details.
    Handles multipart/form-data requests properly to avoid RawPostDataException.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log Request Headers
        headers = dict(request.headers)
        logger.info(f"Request Headers: {json.dumps(headers, indent=2)}")

        # Log Request Body
        content_type = request.content_type
        
        # Skip body logging for multipart/form-data to avoid RawPostDataException
        if content_type and 'multipart/form-data' in content_type:
            logger.info("Request Body: <multipart/form-data - file upload>")
            # Optionally log form fields (non-file data)
            if request.POST:
                logger.info(f"Form Fields: {dict(request.POST)}")
        elif request.body:
            try:
                body = json.loads(request.body)
                logger.info(f"Request Body: {json.dumps(body, indent=2)}")
            except json.JSONDecodeError:
                logger.info(f"Request Body (Raw): {request.body.decode('utf-8', errors='ignore')}")
        else:
            logger.info("Request Body: Empty")

        response = self.get_response(request)

        # Log Response Content
        if hasattr(response, 'content'):
            try:
                content = json.loads(response.content)
                logger.info(f"Response Body: {json.dumps(content, indent=2)}")
            except json.JSONDecodeError:
                logger.info(f"Response Body (Raw): {response.content.decode('utf-8', errors='ignore')[:500]}")
        else:
             logger.info("Response Body: Streaming or no content")

        return response

