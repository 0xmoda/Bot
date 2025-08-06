# Docker Guide for FOGO Bot

This guide covers everything you need to know about deploying and managing the FOGO bot using Docker.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Docker Images](#docker-images)
4. [Docker Compose Configurations](#docker-compose-configurations)
5. [Environment Management](#environment-management)
6. [Monitoring and Logs](#monitoring-and-logs)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Prerequisites

### System Requirements
- Docker 20.10+
- Docker Compose 2.0+
- At least 1GB RAM available
- 2GB disk space

### Install Docker

#### macOS
```bash
# Install Docker Desktop
brew install --cask docker
```

#### Ubuntu/Debian
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Windows
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/0xmoda/Bot.git
cd Bot
cp env.example .env
# Edit .env with your configuration
```

### 2. Build and Run
```bash
# Build the Docker image
./docker-scripts.sh build

# Start the production environment
./docker-scripts.sh prod

# Check status
./docker-scripts.sh status
```

### 3. View Logs
```bash
# View main bot logs
./docker-scripts.sh logs-prod fogo-bot-prod

# View test bot logs
./docker-scripts.sh logs-prod test-fogo-bot-prod
```

## Docker Images

### Production Image (`Dockerfile`)
- **Base**: Node.js 18 Alpine
- **Size**: ~200MB
- **Security**: Non-root user
- **Optimization**: Production dependencies only
- **Health Check**: Built-in health monitoring

### Development Image (`Dockerfile.dev`)
- **Base**: Node.js 18 Alpine
- **Size**: ~250MB
- **Features**: Hot reload with nodemon
- **Debugging**: Exposed debug port (9229)
- **Development**: All dependencies included

## Docker Compose Configurations

### Basic Configuration (`docker-compose.yml`)
```yaml
services:
  fogo-bot:
    build: .
    restart: unless-stopped
    env_file: .env
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
```

### Development Configuration (`docker-compose.dev.yml`)
```yaml
services:
  fogo-bot-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "9229:9229"  # Debug port
    command: ["npm", "run", "fogo-dev"]
```

### Production Configuration (`docker-compose.prod.yml`)
```yaml
services:
  fogo-bot-prod:
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Environment Management

### Environment Variables
```env
# Required
DISCORD_TOKEN=your_discord_bot_token
FOGO_RPC_URL=https://testnet.fogo.io
FOGO_TOKEN_MINT=So11111111111111111111111111111111111111112
BOT_WALLET_PRIVATE_KEY=your_bot_wallet_private_key

# Optional
DATABASE_PATH=./data/fogo_requests.db
NODE_ENV=production
```

### Environment File Structure
```
.env                    # Local development
.env.production         # Production environment
.env.staging           # Staging environment
```

### Docker Environment Best Practices
1. **Never commit `.env` files** to version control
2. **Use different files** for different environments
3. **Validate environment variables** at startup
4. **Use secrets management** in production

## Monitoring and Logs

### Container Status
```bash
# Check all containers
./docker-scripts.sh status

# Check specific environment
docker-compose -f docker-compose.prod.yml ps
```

### Log Management
```bash
# View real-time logs
./docker-scripts.sh logs-prod fogo-bot-prod

# View logs with timestamps
docker-compose -f docker-compose.prod.yml logs -t fogo-bot-prod

# Follow logs for multiple services
docker-compose -f docker-compose.prod.yml logs -f
```

### Resource Monitoring
```bash
# Monitor resource usage
docker stats

# Check disk usage
docker system df

# Monitor specific container
docker stats fogo-bot-prod
```

### Health Checks
```bash
# Check container health
docker inspect fogo-bot-prod | grep Health -A 10

# Manual health check
docker exec fogo-bot-prod node -e "console.log('Bot is healthy')"
```

## Production Deployment

### 1. Google Cloud Platform
```bash
# Build and push to Google Container Registry
docker build -t gcr.io/YOUR_PROJECT/fogo-bot .
docker push gcr.io/YOUR_PROJECT/fogo-bot

# Deploy to GKE
kubectl apply -f k8s/
```

### 2. AWS ECS
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker tag fogo-bot:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/fogo-bot:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/fogo-bot:latest
```

### 3. DigitalOcean App Platform
- Connect your GitHub repository
- Select Docker deployment
- Configure environment variables
- Deploy automatically

### 4. Railway.app
- Connect GitHub repository
- Railway detects Docker setup automatically
- Set environment variables in dashboard
- Automatic deployments on push

## Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check container logs
docker logs fogo-bot-prod

# Check environment variables
docker exec fogo-bot-prod env

# Verify .env file
cat .env
```

#### 2. Database Issues
```bash
# Check database file permissions
ls -la data/

# Verify database path
docker exec fogo-bot-prod ls -la /app/data/

# Check SQLite database
docker exec fogo-bot-prod sqlite3 /app/data/fogo_requests.db ".tables"
```

#### 3. Network Issues
```bash
# Check network connectivity
docker exec fogo-bot-prod ping google.com

# Test Discord API
docker exec fogo-bot-prod node -e "
const { Client } = require('discord.js');
const client = new Client({ intents: [] });
console.log('Discord.js loaded successfully');
"
```

#### 4. Resource Issues
```bash
# Check container resources
docker stats fogo-bot-prod

# Check disk space
docker system df

# Clean up unused resources
docker system prune -f
```

### Debug Mode
```bash
# Run container in debug mode
docker run -it --rm \
  -v $(pwd):/app \
  -v $(pwd)/.env:/app/.env \
  fogo-bot:latest \
  /bin/sh

# Inside container
node --inspect=0.0.0.0:9229 fogo-bot.js
```

## Best Practices

### Security
1. **Use non-root user** in containers
2. **Scan images** for vulnerabilities
3. **Keep base images** updated
4. **Use secrets management** for sensitive data
5. **Limit container capabilities**

### Performance
1. **Use multi-stage builds** for smaller images
2. **Optimize layer caching** in Dockerfile
3. **Set resource limits** in production
4. **Use health checks** for monitoring
5. **Implement proper logging** strategy

### Maintenance
1. **Regular updates** of base images
2. **Monitor resource usage**
3. **Rotate logs** to prevent disk issues
4. **Backup databases** regularly
5. **Test deployments** in staging first

### Monitoring
1. **Set up log aggregation** (ELK stack, Fluentd)
2. **Monitor container metrics** (Prometheus, Grafana)
3. **Set up alerts** for critical issues
4. **Track application metrics** (response times, errors)
5. **Monitor external dependencies** (Discord API, RPC)

## Advanced Configuration

### Custom Dockerfile
```dockerfile
# Multi-stage build for smaller production image
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN adduser -D botuser && chown -R botuser:botuser /app
USER botuser
CMD ["npm", "run", "fogo"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fogo-bot
spec:
  replicas: 1
  selector:
    matchLabels:
      app: fogo-bot
  template:
    metadata:
      labels:
        app: fogo-bot
    spec:
      containers:
      - name: fogo-bot
        image: fogo-bot:latest
        env:
        - name: DISCORD_TOKEN
          valueFrom:
            secretKeyRef:
              name: fogo-bot-secrets
              key: discord-token
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          exec:
            command:
            - node
            - -e
            - console.log('Bot is healthy')
          initialDelaySeconds: 30
          periodSeconds: 10
```

### Docker Swarm
```yaml
version: '3.8'
services:
  fogo-bot:
    image: fogo-bot:latest
    deploy:
      replicas: 1
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    secrets:
      - discord_token
    configs:
      - source: bot_config
        target: /app/.env
```

## Conclusion

Docker provides a consistent, reliable way to deploy and manage the FOGO bot across different environments. The provided configurations and scripts make it easy to get started while maintaining flexibility for advanced deployments.

For additional help:
- Check the main README.md for general bot information
- Review the troubleshooting section for common issues
- Use the monitoring scripts to track bot health
- Consider using orchestration tools (Kubernetes, Docker Swarm) for production deployments 