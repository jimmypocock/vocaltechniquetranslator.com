#!/bin/bash
set -e

echo "🗑️  Destroying Monitoring Stack..."
echo "⚠️  WARNING: This will remove all alarms and dashboards!"
read -p "Are you sure? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

cd cdk
npx cdk destroy VTT-Monitoring --force "$@"
cd ..

echo "✅ Monitoring stack destroyed"