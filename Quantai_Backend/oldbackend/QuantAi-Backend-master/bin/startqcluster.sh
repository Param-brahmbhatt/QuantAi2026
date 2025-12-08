#!/bin/bash
cd /opt/quantai/code
source ../venv/bin/activate
exec python manage.py qcluster
