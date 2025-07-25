#!/bin/bash
# Docker container troubleshooting script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Docker Container Troubleshooting Tool${NC}"
echo "====================================="

# Check if Docker is running
echo -e "\n${YELLOW}Checking if Docker is running...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running! Please start Docker first.${NC}"
  exit 1
else
  echo -e "${GREEN}Docker is running.${NC}"
fi

# List all containers with their status
echo -e "\n${YELLOW}Listing all containers:${NC}"
docker ps -a

# Check for stuck containers
echo -e "\n${YELLOW}Looking for stuck containers...${NC}"
STUCK=$(docker ps --filter "status=restarting" --format "{{.Names}}")
if [ -z "$STUCK" ]; then
  echo -e "${GREEN}No stuck containers found.${NC}"
else
  echo -e "${RED}Found these stuck containers:${NC}"
  echo "$STUCK"
  
  echo -e "\n${YELLOW}Would you like to force stop and remove these containers? (y/n)${NC}"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    for container in $STUCK; do
      echo "Stopping container $container..."
      docker stop -t 1 "$container"
      docker rm "$container"
    done
    echo -e "${GREEN}Stuck containers have been removed.${NC}"
  fi
fi

# Check Docker logs for our container
echo -e "\n${YELLOW}Checking logs for solid-oidc-provider container...${NC}"
if docker ps -q -f name=solid-oidc-provider > /dev/null; then
  docker logs --tail 50 solid-oidc-provider
else
  echo -e "${RED}solid-oidc-provider container is not running!${NC}"
fi

# Check resource usage
echo -e "\n${YELLOW}Checking container resource usage:${NC}"
docker stats --no-stream

echo -e "\n${GREEN}Troubleshooting complete!${NC}"
echo -e "${YELLOW}To restart containers with the new configuration, run:${NC}"
echo -e "cd /Users/chrishughes/Projects/PDS3.0/solid-oidc-provider && docker-compose down && docker-compose up -d"
