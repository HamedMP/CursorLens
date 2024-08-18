# Makefile for PostgreSQL, pgAdmin

# Set your Docker Compose file name
COMPOSE_FILE := docker-compose.yml

# Default target (runs in detached mode)
up:
	docker-compose -f $(COMPOSE_FILE) up -d

# Run in foreground (for logs)
up-foreground:
	docker-compose -f $(COMPOSE_FILE) up

# Stop containers
down:
	docker-compose -f $(COMPOSE_FILE) down

# Stop and remove containers, networks, images, and volumes (use with caution!)
down-all:
	docker-compose -f $(COMPOSE_FILE) down --rmi all --volumes

# Rebuild containers (useful after code changes in your project)
rebuild:
	docker-compose -f $(COMPOSE_FILE) up -d --build

# Execute a command inside the 'db' container
postgres-exec:
	docker-compose -f $(COMPOSE_FILE) exec db bash

# Execute a command inside the 'pgadmin' container
pgadmin-exec:
	docker-compose -f $(COMPOSE_FILE) exec pgadmin /bin/sh

# Connect to the PostgreSQL database using psql
psql:
	docker-compose -f $(COMPOSE_FILE) exec db psql -U postgres -d cursorlens

# Backup the database
backup:
	docker-compose -f $(COMPOSE_FILE) exec -T db pg_dump -U postgres postgres > backup.sql

# Restore the database
restore:
	cat backup.sql | docker-compose -f $(COMPOSE_FILE) exec -T db psql -U postgres -d cursorlens

# List available targets
help:
	@echo "Available targets:"
	@echo "  up             - Start services in detached mode"
	@echo "  up-foreground  - Start services in the foreground (for logs)"
	@echo "  down           - Stop services"
	@echo "  down-all       - Stop and remove everything (use with caution!)"
	@echo "  rebuild        - Rebuild and restart containers"
	@echo "  postgres-exec  - Execute a command inside the 'db' container"
	@echo "  pgadmin-exec   - Execute a command inside the 'pgadmin' container"
	@echo "  psql           - Connect to the PostgreSQL database using psql"
	@echo "  backup         - Backup the PostgreSQL database"
	@echo "  restore        - Restore the PostgreSQL database from backup"
	@echo "  help           - Show this help message"
