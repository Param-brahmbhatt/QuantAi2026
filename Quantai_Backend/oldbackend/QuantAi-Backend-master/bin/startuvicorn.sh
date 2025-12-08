#!/bin/bash
cd /opt/quantai/code
source ../venv/bin/activate
exec uvicorn --host 127.0.0.1 --port 8000 --reload --workers 2 --access-log --use-colors settings.asgi:application
