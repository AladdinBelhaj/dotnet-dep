#!/bin/bash
set -e

# Mask bin and obj folders to prevent conflicts with host Windows files
# (This is handled by docker-compose volumes, but good to note)

echo "Installing dotnet-ef..."
# Attempt install, ignore if already installed
dotnet tool install --global dotnet-ef || true

# Add tools to PATH
export PATH="$PATH:/root/.dotnet/tools"

echo "Restoring dependencies..."
dotnet restore API/API.csproj

echo "Updating database..."
dotnet ef database update --project Context --startup-project API

echo "Migration completed successfully."
