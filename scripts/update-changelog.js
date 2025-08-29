#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function updateChangelog() {
  const changelogPath = path.join(__dirname, '../public/changelog.json');
  
  try {
    // Read current changelog
    const changelogData = JSON.parse(await fs.readFile(changelogPath, 'utf8'));
    
    // Get current version and increment patch version
    const currentVersion = changelogData.latest;
    const versionParts = currentVersion.split('.').map(Number);
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`;
    
    // Get recent commit messages (last 10 commits)
    let commitMessages = [];
    try {
      const gitLog = execSync('git log --oneline -10 --pretty=format:"%s"', { encoding: 'utf8' });
      commitMessages = gitLog.split('\n').filter(msg => msg.trim().length > 0);
    } catch (error) {
      console.warn('Could not fetch git log, using default message');
      commitMessages = ['Manual changelog update'];
    }
    
    // Create new version entry
    const today = new Date().toISOString().split('T')[0];
    const newVersionEntry = {
      version: newVersion,
      date: today,
      title: "Latest Updates",
      changes: commitMessages.slice(0, 5), // Take first 5 commit messages
      type: "patch",
      important: false
    };
    
    // Update changelog
    changelogData.latest = newVersion;
    changelogData.versions[newVersion] = newVersionEntry;
    
    // Write updated changelog
    await fs.writeFile(changelogPath, JSON.stringify(changelogData, null, 2));
    
    console.log(`✅ Changelog updated to version ${newVersion}`);
    console.log(`📝 Added ${commitMessages.length} changes`);
    console.log(`📅 Date: ${today}`);
    
  } catch (error) {
    console.error('❌ Error updating changelog:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateChangelog();
}

module.exports = updateChangelog;