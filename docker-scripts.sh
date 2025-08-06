#!/bin/bash

# FOGO Bot Docker Management Script
# Usage: ./docker-scripts.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_error ".env file not found! Please create it from env.example"
        exit 1
    fi
}

# Build the Docker image
build() {
    print_header "Building FOGO Bot Docker Image"
    check_env
    docker build -t fogo-bot .
    print_status "Docker image built successfully!"
}

# Start development environment
dev() {
    print_header "Starting Development Environment"
    check_env
    docker-compose -f docker-compose.dev.yml up -d
    print_status "Development environment started!"
    print_status "Main bot logs: docker-compose -f docker-compose.dev.yml logs -f fogo-bot-dev"
    print_status "Test bot logs: docker-compose -f docker-compose.dev.yml logs -f test-fogo-bot-dev"
}

# Start production environment
prod() {
    print_header "Starting Production Environment"
    check_env
    docker-compose -f docker-compose.prod.yml up -d
    print_status "Production environment started!"
    print_status "Main bot logs: docker-compose -f docker-compose.prod.yml logs -f fogo-bot-prod"
    print_status "Test bot logs: docker-compose -f docker-compose.prod.yml logs -f test-fogo-bot-prod"
}

# Start basic environment
start() {
    print_header "Starting Basic Environment"
    check_env
    docker-compose up -d
    print_status "Basic environment started!"
    print_status "Main bot logs: docker-compose logs -f fogo-bot"
    print_status "Test bot logs: docker-compose logs -f test-fogo-bot"
}

# Stop all containers
stop() {
    print_header "Stopping All Containers"
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.prod.yml down
    print_status "All containers stopped!"
}

# Show logs
logs() {
    local service=${2:-fogo-bot}
    print_header "Showing Logs for $service"
    docker-compose logs -f $service
}

# Show logs for dev environment
logs-dev() {
    local service=${2:-fogo-bot-dev}
    print_header "Showing Development Logs for $service"
    docker-compose -f docker-compose.dev.yml logs -f $service
}

# Show logs for prod environment
logs-prod() {
    local service=${2:-fogo-bot-prod}
    print_header "Showing Production Logs for $service"
    docker-compose -f docker-compose.prod.yml logs -f $service
}

# Show container status
status() {
    print_header "Container Status"
    echo "Basic Environment:"
    docker-compose ps
    echo ""
    echo "Development Environment:"
    docker-compose -f docker-compose.dev.yml ps
    echo ""
    echo "Production Environment:"
    docker-compose -f docker-compose.prod.yml ps
}

# Clean up containers and images
clean() {
    print_header "Cleaning Up Docker Resources"
    print_warning "This will remove all containers, images, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        docker-compose -f docker-compose.prod.yml down -v
        docker system prune -f
        print_status "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Show help
help() {
    print_header "FOGO Bot Docker Management Script"
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build     - Build Docker image"
    echo "  dev       - Start development environment"
    echo "  prod      - Start production environment"
    echo "  start     - Start basic environment"
    echo "  stop      - Stop all containers"
    echo "  logs      - Show logs (usage: $0 logs [service])"
    echo "  logs-dev  - Show development logs (usage: $0 logs-dev [service])"
    echo "  logs-prod - Show production logs (usage: $0 logs-prod [service])"
    echo "  status    - Show container status"
    echo "  clean     - Clean up Docker resources"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 dev"
    echo "  $0 logs fogo-bot"
    echo "  $0 logs-dev test-fogo-bot-dev"
}

# Main script logic
case "${1:-help}" in
    build)
        build
        ;;
    dev)
        dev
        ;;
    prod)
        prod
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    logs)
        logs "$@"
        ;;
    logs-dev)
        logs-dev "$@"
        ;;
    logs-prod)
        logs-prod "$@"
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    help|*)
        help
        ;;
esac 