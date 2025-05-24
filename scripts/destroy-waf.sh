#!/bin/bash
set -e

echo "🗑️  Destroying WAF Stack..."
echo "⚠️  WARNING: This will remove all WAF rules and rate limiting!"
read -p "Are you sure? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

cd cdk
npx cdk destroy VTT-WAF --force "$@"
cd ..

echo "✅ WAF stack destroyed"