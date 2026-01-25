#!/bin/bash
# Database restore script for Aedelore
# Usage: ./scripts/restore.sh backups/aedelore_2026-01-25_030000.sql.gz

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh /opt/aedelore-development/backups/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will overwrite the current database!"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo "Restoring database..."

# Drop and recreate database
docker exec aedelore-dev-db psql -U aedelore -d postgres -c "DROP DATABASE IF EXISTS aedelore;"
docker exec aedelore-dev-db psql -U aedelore -d postgres -c "CREATE DATABASE aedelore;"

# Restore from backup
gunzip -c "$BACKUP_FILE" | docker exec -i aedelore-dev-db psql -U aedelore -d aedelore

echo "Restore complete!"
