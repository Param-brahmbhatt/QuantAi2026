#!/bin/bash
set -e

# --------- CONFIG VARIABLES ---------
git_update_dir=/home/nk_quantai/gitupdate/QuantAi2026
BACKEND_DIR=/home/nk_quantai/gitupdate/QuantAi2026/Quantai_Backend/backend
FRONTEND_DIR=/home/nk_quantai/gitupdate/QuantAi2026/Quantai_Frontend/quantAI-frontend
MAIN_BACKEND_DIR=/home/nk_quantai/QuantAi2026/Quantai_Backend/backend
MAIN_FRONTEND_DIR=/home/nk_quantai/QuantAi2026/Quantai_Frontend/quantAI-frontend
GUNICORN_SERVICE=gunicorn_quantai.service
venv_path=/home/nk_quantai/myenv/bin/activate
DEST_PATH=/var/www/portal.quantaigroup.com/html/

# (Optional) Update code from git repo
echo "Pulling latest code..."
cd "$git_update_dir"
sudo git fetch
sudo git pull

# cd "$FRONTEND_DIR"
# git pull
#file copy from git update to main
sudo cp -r $FRONTEND_DIR/. $MAIN_FRONTEND_DIR 
sudo cp -r $BACKEND_DIR/. $MAIN_BACKEND_DIR

# --------- BACKEND STEPS ---------
echo "Updating Python backend..."
cd "$MAIN_BACKEND_DIR"
# Assume venv already set up; activate it
source "$venv_path"

pip install -r requirements.txt
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py collectstatic --noinput

# --------- FRONTEND STEPS (Build & copy) ---------
echo "Building frontend for production..."
cd "$MAIN_FRONTEND_DIR"
# npm ci
npm install
npm run build

# (For Vite/React: dist folder already in FRONTEND_DIR)
# If you need to copy, do so here—often unnecessary if deploying in-place
sudo cp -r dist/. $DEST_PATH  # Usually not needed if Nginx is set to FRONTEND_DIR/dist

# --------- RESTART SERVICES ---------
echo "Restarting Gunicorn and Nginx..."
sudo systemctl daemon-reload
sudo systemctl restart $GUNICORN_SERVICE
sudo systemctl reload nginx

echo "✅ Deployment complete!"