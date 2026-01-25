#!/bin/bash
# Database backup script for Aedelore
# Run manually: ./scripts/backup.sh
# Or add to crontab: 0 3 * * * /opt/aedelore-development/scripts/backup.sh

set -e

BACKUP_DIR="/opt/aedelore-development/backups"
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/aedelore_${DATE}.sql.gz"
KEEP_DAYS=30

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Run pg_dump inside the database container
docker exec aedelore-dev-db pg_dump -U aedelore aedelore | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup successful: $BACKUP_FILE ($SIZE)"
else
    echo "Backup failed!"
    exit 1
fi

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "aedelore_*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "Cleaned up backups older than $KEEP_DAYS days"

# List current backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found"
