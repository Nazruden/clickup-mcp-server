#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VALID_TYPES = ['patch', 'minor', 'major'];
const VERSION_TYPE = process.argv[2];

if (!VERSION_TYPE || !VALID_TYPES.includes(VERSION_TYPE)) {
  console.error('❌ Usage: npm run release <patch|minor|major>');
  process.exit(1);
}

const packagePath = path.join(__dirname, '..', 'package.json');
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');

function exec(command, options = {}) {
  console.log(`🔧 Executing: ${command}`);
  return execSync(command, { stdio: 'inherit', ...options });
}

function updateChangelog(version) {
  const today = new Date().toISOString().split('T')[0];
  const changelogEntry = `
## [${version}] - ${today}

### Added
- New features and improvements

### Changed
- Updates and modifications

### Fixed
- Bug fixes and patches

### Security
- Security improvements

`;

  if (fs.existsSync(changelogPath)) {
    const content = fs.readFileSync(changelogPath, 'utf8');
    const lines = content.split('\n');
    const insertIndex = lines.findIndex(line => line.startsWith('## [')) || 2;
    lines.splice(insertIndex, 0, ...changelogEntry.split('\n'));
    fs.writeFileSync(changelogPath, lines.join('\n'));
  } else {
    const initialChangelog = `# Changelog

All notable changes to this project will be documented in this file.

${changelogEntry}`;
    fs.writeFileSync(changelogPath, initialChangelog);
  }
}

async function release() {
  try {
    console.log(`🚀 Starting ${VERSION_TYPE} release...`);

    // Check if working directory is clean
    try {
      exec('git diff-index --quiet HEAD --');
    } catch (e) {
      console.error('❌ Working directory is not clean. Commit your changes first.');
      process.exit(1);
    }

    // Ensure we're on main branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    if (currentBranch !== 'main') {
      console.error('❌ Release must be made from main branch');
      process.exit(1);
    }

    // Pull latest changes
    exec('git pull origin main');

    // Run tests
    console.log('🧪 Running tests...');
    exec('npm test');

    // Build project
    console.log('🏗️ Building project...');
    exec('npm run build');

    // Bump version
    console.log(`📈 Bumping ${VERSION_TYPE} version...`);
    exec(`npm version ${VERSION_TYPE} --no-git-tag-version`);

    // Get new version
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const newVersion = packageJson.version;

    console.log(`📦 New version: ${newVersion}`);

    // Update changelog
    console.log('📋 Updating changelog...');
    updateChangelog(newVersion);

    // Stage changes
    exec('git add package.json package-lock.json CHANGELOG.md');

    // Commit changes
    exec(`git commit -m "chore(release): bump version to ${newVersion}"`);

    // Create tag
    exec(`git tag -a v${newVersion} -m "Release v${newVersion}"`);

    // Push changes
    exec('git push origin main');
    exec(`git push origin v${newVersion}`);

    console.log(`🎉 Release v${newVersion} created successfully!`);
    console.log(`📦 NPM publication will be handled by GitHub Actions`);
    console.log(`🔗 Check: https://github.com/nazruden/clickup-mcp-server/releases`);

  } catch (error) {
    console.error('❌ Release failed:', error.message);
    process.exit(1);
  }
}

release();