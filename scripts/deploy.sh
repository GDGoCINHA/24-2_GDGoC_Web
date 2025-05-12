#!/bin/bash

# Set the application directory
APP_DIR="/home/ubuntu/gdgocinha-fe"

# Create application directory if it doesn't exist
mkdir -p $APP_DIR

# Move to application directory
cd $APP_DIR

# Docker & Docker Compose installation check and setup
if ! [ -x "$(command -v docker)" ]; then
  echo "Installing Docker..."
  sudo apt update
  sudo apt install -y docker.io
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker ubuntu
  echo "Docker installation completed"
fi

if ! [ -x "$(command -v docker-compose)" ]; then
  echo "Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  echo "Docker Compose installation completed"
fi

# Stop and remove existing containers
echo "Stopping existing containers..."
docker-compose down || true

# Clean up unused Docker resources
echo "Cleaning up Docker resources..."
docker system prune -af
docker volume prune -f

# Load environment variables
if [ -f .env ]; then
  echo "Loading environment variables..."
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Pull latest image
echo "Pulling latest Docker image..."
docker pull ${DOCKER_HUB_USERNAME}/gdgocinha-fe:latest

# Start containers
echo "Starting containers..."
docker-compose --env-file .env up -d

# Verify deployment
echo "Verifying deployment..."
if [ $(docker ps -q -f name=gdgocinha-fe | wc -l) -eq 1 ]; then
  echo "Deployment successful!"
else
  echo "Deployment failed!"
  exit 1
fi
