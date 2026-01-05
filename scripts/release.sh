#!/bin/bash

# Semantic Release Helper Script
# Usage: ./scripts/release.sh [major|minor|patch|VERSION]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")

echo -e "${GREEN}Current version: ${CURRENT_VERSION}${NC}"
echo ""

# Determine version type
VERSION_TYPE=${1:-patch}

if [[ "$VERSION_TYPE" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  # Exact version specified
  NEW_VERSION="$VERSION_TYPE"
  echo -e "${YELLOW}Using specified version: ${NEW_VERSION}${NC}"
else
  # Calculate new version
  IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
  
  case "$VERSION_TYPE" in
    major)
      NEW_VERSION="$((VERSION_PARTS[0] + 1)).0.0"
      ;;
    minor)
      NEW_VERSION="${VERSION_PARTS[0]}.$((VERSION_PARTS[1] + 1)).0"
      ;;
    patch)
      NEW_VERSION="${VERSION_PARTS[0]}.${VERSION_PARTS[1]}.$((VERSION_PARTS[2] + 1))"
      ;;
    *)
      echo -e "${RED}Invalid version type. Use: major, minor, patch, or specify exact version (e.g., 1.2.3)${NC}"
      exit 1
      ;;
  esac
  
  echo -e "${YELLOW}Bumping ${VERSION_TYPE} version to: ${NEW_VERSION}${NC}"
fi

# Confirm
echo ""
read -p "Create release branch release/${NEW_VERSION}? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Cancelled${NC}"
  exit 1
fi

# Check if branch already exists
if git rev-parse --verify "release/${NEW_VERSION}" >/dev/null 2>&1; then
  echo -e "${RED}Branch release/${NEW_VERSION} already exists!${NC}"
  exit 1
fi

# Create release branch
git checkout -b "release/${NEW_VERSION}"

echo -e "${YELLOW}Updating package.json to version ${NEW_VERSION}...${NC}"

# Update package.json version
npm version "${NEW_VERSION}" --no-git-tag-version

# Stage the changes
git add package.json

# Check if package-lock.json exists and stage it
if [ -f "package-lock.json" ]; then
  git add package-lock.json
  echo -e "${GREEN}✅ Updated package.json and package-lock.json${NC}"
else
  echo -e "${GREEN}✅ Updated package.json${NC}"
fi

# Commit the version bump
git commit -m "chore(release): bump version to ${NEW_VERSION}"

echo -e "${GREEN}✅ Created release branch: release/${NEW_VERSION}${NC}"
echo ""
echo "Next steps:"
echo "1. Make any final changes needed for this release"
echo "2. Push the branch: git push -u origin release/${NEW_VERSION}"
echo "3. Create a PR to main with the 'release' label"
echo "4. A release candidate will be automatically created"
echo "5. When merged, the final release will be published"
