const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Script to convert CSV to JSON for React Native consumption
const csvPath = path.join(__dirname, '../data/food.csv');
const outputPath = path.join(__dirname, '../lib/data/recipes.json');

console.log('Converting CSV to JSON...');
console.log('Reading from:', csvPath);
console.log('Writing to:', outputPath);

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read and parse CSV
const csvContent = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true
});

// Take a manageable subset of recipes (first 1000 to avoid memory issues)
const recipes = parsed.data.slice(0, 1000);

console.log(`Processed ${recipes.length} recipes`);

// Write to JSON file
fs.writeFileSync(outputPath, JSON.stringify(recipes, null, 2));

console.log('✅ CSV converted to JSON successfully!');
