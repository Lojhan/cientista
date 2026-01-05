# 🚀 Release Process

This project uses an automated release workflow with semantic versioning.

## Overview

- **Release Candidates (RC)**: Created automatically when you open a PR with a `release/*` branch
- **Final Releases**: Created automatically when the release PR is merged to `main`
- **NPM Publishing**: Triggered automatically after a final release is created

## Quick Start

### Option 1: Using the Helper Script (Recommended)

```bash
# Create a patch release (0.6.0 -> 0.6.1)
./scripts/release.sh patch

# Create a minor release (0.6.0 -> 0.7.0)
./scripts/release.sh minor

# Create a major release (0.6.0 -> 1.0.0)
./scripts/release.sh major

# Or specify exact version
./scripts/release.sh 1.2.3
```

This will:
1. Create a new branch `release/X.Y.Z`
2. Update `package.json` with the new version
3. Update `package-lock.json` (if it exists)
4. Commit the version bump
5. Prompt you to push it

### Option 2: Manual Branch Creation

```bash
# Create a release branch
git checkout -b release/1.2.3

# Update version manually
npm version 1.2.3 --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore(release): bump version to 1.2.3"

# Push the branch
git push -u origin release/1.2.3
```

## Detailed Workflow

### Step 1: Create Release PR

1. Create a branch with pattern `release/X.Y.Z` (e.g., `release/1.2.3`)
2. The script automatically updates `package.json` and `package-lock.json`
3. Make any final changes for the release (if needed)
4. Push the branch and create a PR to `main`
5. Add the `release` label to the PR (optional, but recommended)

**What happens:**
- ✅ CI runs all quality checks
- 🚧 A release candidate is created (e.g., `v1.2.3-rc.42.a1b2c3d`)
- 💬 Bot comments on the PR with RC details
- 📦 GitHub prerelease is created with RC tag

### Step 2: Review & Merge

1. Review the PR and RC
2. Ensure all checks pass
3. Merge the PR to `main`

**What happens:**
- 🎉 Final release `v1.2.3` is created
- 📝 Changelog is automatically generated
- 🏷️ Git tag is created and pushed (version already in package.json from PR)
- 📦 GitHub release is published
- 🚀 NPM package is automatically published

## Version Detection

The workflow automatically detects the version type from:

1. **Branch name**: `release/1.2.3` → version `1.2.3`
2. **Commit messages** (keywords):
   - `major:` or `BREAKING CHANGE:` → major version bump
   - `minor:` or `feat:` → minor version bump
   - `patch:` or `fix:` → patch version bump
3. **PR labels**: `release` label triggers the release workflow

## Manual Release Trigger

You can also manually trigger a release from GitHub Actions:

1. Go to **Actions** → **Automated Release**
2. Click **Run workflow**
3. Enter version number (e.g., `1.2.3`)
4. Choose if it's a prerelease
5. Click **Run workflow**

## Commit Message Convention

For automatic version detection, use conventional commits:

```bash
# Patch release (0.6.0 -> 0.6.1)
git commit -m "fix: resolve memory leak"
git commit -m "patch: update dependencies"

# Minor release (0.6.0 -> 0.7.0)
git commit -m "feat: add new feature"
git commit -m "minor: enhance API"

# Major release (0.6.0 -> 1.0.0)
git commit -m "major: breaking API changes"
git commit -m "feat!: rewrite core functionality"
git commit -m "BREAKING CHANGE: remove deprecated methods"
```

## Version Naming

- **Release Candidate**: `X.Y.Z-rc.PR#.SHA` (e.g., `1.2.3-rc.42.a1b2c3d`)
  - `X.Y.Z`: Semantic version
  - `PR#`: Pull request number
  - `SHA`: Short commit hash (7 chars)

- **Final Release**: `X.Y.Z` (e.g., `1.2.3`)
  - Follows [Semantic Versioning 2.0.0](https://semver.org/)

## NPM Publishing

The package is published to npm automatically:

- **Trigger**: After a final release is published
- **Registry**: https://www.npmjs.com/package/cientista
- **Provenance**: Enabled for supply chain security
- **Access**: Public

### Pre-publish Checks

Before publishing, the workflow:
1. ✅ Runs all tests
2. 🔨 Builds the project
3. 📦 Validates package contents
4. 🔍 Checks package size

## Troubleshooting

### Release candidate not created

- Ensure branch name matches `release/*` pattern
- Add `release` label to PR
- Check workflow runs in Actions tab

### Release not published to npm

- Verify `NPM_TOKEN` secret is set
- Check npm publish workflow logs
- Ensure release is not marked as prerelease

### Version conflict

If the version already exists:
1. Delete the release and tag from GitHub
2. Create a new release branch with a different version
3. Try again

## Configuration

### Required Secrets

- `NPM_TOKEN`: npm authentication token for publishing
  - Generate at: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
  - Add to: Repository Settings → Secrets → Actions

### Optional Secrets

- `CODECOV_TOKEN`: For code coverage reports (if using Codecov)

## Workflows

- **[CI](.github/workflows/ci.yml)**: Quality checks on every push/PR
- **[Automated Release](.github/workflows/release.yml)**: Create releases with semantic versioning
- **[Publish](.github/workflows/main.yml)**: Publish to npm registry

## Examples

### Example 1: Patch Release

```bash
# Current version: 0.6.0
./scripts/release.sh patch
# Creates branch: release/0.6.1

git push -u origin release/0.6.1
# Create PR → Merge → Version 0.6.1 released
```

### Example 2: Minor Release with Features

```bash
# Current version: 0.6.0
git checkout -b release/0.7.0

# Make changes
git commit -m "feat: add new experiment tracking"
git commit -m "feat: improve error handling"

git push -u origin release/0.7.0
# Create PR → RC created → Review → Merge → Version 0.7.0 released
```

### Example 3: Major Breaking Changes

```bash
# Current version: 0.6.0
./scripts/release.sh major
# Creates branch: release/1.0.0

# Make breaking changes
git commit -m "BREAKING CHANGE: redesign public API"

git push -u origin release/1.0.0
# Create PR → RC created → Review → Merge → Version 1.0.0 released
```

## Best Practices

1. **Always create release branches** for version changes
2. **Review release candidates** before merging
3. **Use conventional commits** for automatic version detection
4. **Document breaking changes** in PR descriptions
5. **Test release candidates** in staging/test environments
6. **Keep releases small** and focused
7. **Update CHANGELOG** if maintaining one manually

## References

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
