#!/bin/bash
set -e

# --------- CONFIG VARIABLES ---------
BACKEND_DIR=/home/nk_quantai/QuantAi2026/Quantai_Backend/backend
FRONTEND_DIR=/home/nk_quantai/QuantAi2026/Quantai_Frontend/quantAI-frontend
GUNICORN_SERVICE=gunicorn_quantai
venv_path=/home/nk_quantai/venv/bin/activate
$DEST_PATH=/var/www/portal.quantaigroup.com/html/

# (Optional) Update code from git repo
echo "Pulling latest code..."
cd "$BACKEND_DIR"
git fetch
git pull

# cd "$FRONTEND_DIR"
# git pull

# --------- BACKEND STEPS ---------
echo "Updating Python backend..."
cd "$BACKEND_DIR"
# Assume venv already set up; activate it
source "$venv_path"

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

# --------- FRONTEND STEPS (Build & copy) ---------
echo "Building frontend for production..."
cd "$FRONTEND_DIR"
# npm ci
npm install
npm run build

# (For Vite/React: dist folder already in FRONTEND_DIR)
# If you need to copy, do so here—often unnecessary if deploying in-place
sudo cp -r dist $DEST_PATH  # Usually not needed if Nginx is set to FRONTEND_DIR/dist

# --------- RESTART SERVICES ---------
echo "Restarting Gunicorn and Nginx..."
sudo systemctl restart $GUNICORN_SERVICE
sudo systemctl reload nginx

echo "✅ Deployment complete!"