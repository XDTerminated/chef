const fs = require("fs");
const path = require("path");

// Path to the CSV file
const csvPath = path.join(process.cwd(), "data", "Food Ingredients and Recipe Dataset with Image Name Mapping.csv");
const jsonPath = path.join(process.cwd(), "data", "recipes.json");

console.log("🚀 Converting CSV to JSON...");

function parseCSVFields(line) {
    const fields = [];
    let currentField = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote inside quoted field
                currentField += '"';
                i += 2;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === "," && !inQuotes) {
            // End of field
            fields.push(currentField);
            currentField = "";
            i++;
        } else {
            currentField += char;
            i++;
        }
    }

    // Add the last field
    fields.push(currentField);

    return fields;
}

try {
    // Read the CSV file
    const csvData = fs.readFileSync(csvPath, "utf8");
    const lines = csvData.split("\n");

    console.log(`📊 Found ${lines.length} total lines in CSV`);

    // Parse CSV lines starting from line 1 (skip header)
    const recipes = [];

    for (let i = 1; i < lines.length && recipes.length < 2000; i++) {
        // Limit to 2000 recipes for performance
        const line = lines[i];
        if (!line.trim()) continue; // Skip empty lines

        try {
            const fields = parseCSVFields(line);

            if (fields.length < 6) {
                console.warn(`⚠️ Line ${i} has insufficient fields: ${fields.length}`);
                continue;
            }

            const [, title, ingredients, instructions, imageName, cleanedIngredients] = fields;

            // Validate required fields
            if (!title || !ingredients || !instructions) {
                console.warn(`⚠️ Line ${i} missing required fields`);
                continue;
            }

            recipes.push({
                id: `recipe-${i}`,
                Title: title.trim(),
                Ingredients: ingredients.trim(),
                Instructions: instructions.trim(),
                Image_Name: imageName ? imageName.trim() : `recipe-${i}.jpg`,
                Cleaned_Ingredients: cleanedIngredients ? cleanedIngredients.trim() : title.toLowerCase(),
            });
        } catch (error) {
            console.warn(`⚠️ Error parsing line ${i}:`, error.message);
            continue;
        }

        // Progress logging
        if (recipes.length % 100 === 0) {
            console.log(`🔄 Processed ${recipes.length} recipes...`);
        }
    }

    console.log(`✅ Successfully parsed ${recipes.length} recipes`);

    // Write to JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(recipes, null, 2));

    console.log(`🎉 Successfully converted CSV to JSON: ${jsonPath}`);
    console.log(`📈 Total recipes: ${recipes.length}`);

    // Show a sample of the first few recipes
    console.log("\n📋 Sample recipes:");
    recipes.slice(0, 3).forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.Title}`);
        console.log(`   Ingredients: ${recipe.Ingredients.substring(0, 100)}...`);
        console.log(`   Instructions: ${recipe.Instructions.substring(0, 100)}...`);
        console.log("");
    });
} catch (error) {
    console.error("❌ Error converting CSV to JSON:", error);
    process.exit(1);
}
