#!/bin/bash

# Story Portal Skill Installation Script
# Run this from your story-portal-app repo root

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Story Portal Skill Installation"
echo "=========================================="

# Configuration - adjust if your download location differs
ZIP_LOCATIONS=(
    "$HOME/Downloads/story-portal-complete.zip"
    "$HOME/Desktop/story-portal-complete.zip"
    "./story-portal-complete.zip"
)

# Find the zip file
ZIP_PATH=""
for loc in "${ZIP_LOCATIONS[@]}"; do
    if [ -f "$loc" ]; then
        ZIP_PATH="$loc"
        echo -e "${GREEN}✓ Found zip at: $ZIP_PATH${NC}"
        break
    fi
done

if [ -z "$ZIP_PATH" ]; then
    echo -e "${RED}✗ Could not find story-portal-complete.zip${NC}"
    echo "  Looked in:"
    for loc in "${ZIP_LOCATIONS[@]}"; do
        echo "    - $loc"
    done
    echo ""
    echo "Please download the zip and place it in one of these locations,"
    echo "or run: SKILL_ZIP=/path/to/zip.zip ./install-skill.sh"
    exit 1
fi

# Allow override via environment variable
ZIP_PATH="${SKILL_ZIP:-$ZIP_PATH}"

# Verify we're in a repo with .claude folder
if [ ! -d ".claude" ]; then
    echo -e "${YELLOW}! .claude folder not found. Creating it...${NC}"
    mkdir -p .claude/commands
    mkdir -p .claude/skills
fi

# Create temp directory for extraction
TEMP_DIR=$(mktemp -d)
echo "Extracting to temp directory..."

unzip -q "$ZIP_PATH" -d "$TEMP_DIR"

EXTRACT_DIR="$TEMP_DIR/story-portal-complete"

# Verify extraction
if [ ! -d "$EXTRACT_DIR" ]; then
    echo -e "${RED}✗ Extraction failed - expected folder not found${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo ""
echo "Installing files..."
echo ""

# 1. Backup and replace CLAUDE.md
if [ -f "CLAUDE.md" ]; then
    echo -e "${YELLOW}  Backing up existing CLAUDE.md to CLAUDE.md.backup${NC}"
    cp CLAUDE.md CLAUDE.md.backup
fi
cp "$EXTRACT_DIR/CLAUDE.md" ./CLAUDE.md
echo -e "${GREEN}✓ CLAUDE.md installed${NC}"

# 2. Ensure directories exist
mkdir -p .claude/commands
mkdir -p .claude/skills

# 3. Install commands
cp "$EXTRACT_DIR/claude-folder/commands/compact.md" .claude/commands/
echo -e "${GREEN}✓ .claude/commands/compact.md installed${NC}"

cp "$EXTRACT_DIR/claude-folder/commands/iterate-visual.md" .claude/commands/
echo -e "${GREEN}✓ .claude/commands/iterate-visual.md installed${NC}"

# 4. Install skill folder
if [ -d ".claude/skills/story-portal" ]; then
    echo -e "${YELLOW}  Backing up existing skill to .claude/skills/story-portal.backup${NC}"
    rm -rf .claude/skills/story-portal.backup
    mv .claude/skills/story-portal .claude/skills/story-portal.backup
fi
cp -r "$EXTRACT_DIR/claude-folder/skills/story-portal" .claude/skills/
echo -e "${GREEN}✓ .claude/skills/story-portal/ installed${NC}"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "=========================================="
echo -e "${GREEN}Installation Complete!${NC}"
echo "=========================================="
echo ""
echo "Files installed:"
echo "  ./CLAUDE.md (replaced)"
echo "  .claude/commands/compact.md (new)"
echo "  .claude/commands/iterate-visual.md (new)"
echo "  .claude/skills/story-portal/ (new folder with 11 files)"
echo ""
echo "To verify, run:"
echo "  cat .claude/skills/story-portal/SKILL.md | head -20"
echo ""
echo "To test in Claude CLI, try:"
echo "  /iterate-visual"
echo ""
