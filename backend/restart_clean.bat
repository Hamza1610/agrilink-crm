#!/bin/bash
# Script to fully restart the backend server with clean cache

echo "🔧 Cleaning Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true

echo "🚀 Starting backend server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000
