#!/bin/bash

# Fix environment variable access patterns in TypeScript files
echo "Fixing environment variable access patterns..."

# Fix process.env.PROPERTY to process.env['PROPERTY']
find src -name "*.ts" -exec sed -i '' 's/process\.env\.\([A-Z_][A-Z0-9_]*\)/process.env["\1"]/g' {} \;

echo "Environment variable access patterns fixed!"
