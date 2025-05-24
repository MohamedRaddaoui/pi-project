// This is a simple script to check if axios is installed
// and install it if it's not

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Check if axios is in package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const hasAxios = packageJson.dependencies && packageJson.dependencies.axios;
  
  if (!hasAxios) {
    console.log('Installing axios...');
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('axios installed successfully!');
  } else {
    console.log('axios is already installed.');
  }
} catch (error) {
  console.error('Error:', error.message);
}
