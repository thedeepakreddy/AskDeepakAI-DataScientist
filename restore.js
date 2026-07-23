const { execSync } = require('child_process');
execSync('git checkout src/components/NeuralBackground.tsx');
console.log('Restored');
