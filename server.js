const express = require('express');
const cors = require('cors');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const client = postgres(connectionString);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chef API Server is running' });
});

// User endpoints
app.post('/api/users', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, imageUrl } = req.body;
    
    if (!clerkId || !email) {
      return res.status(400).json({ error: 'clerkId and email are required' });
    }

    // Check if user already exists
    const existingUser = await client`
      SELECT * FROM "users" WHERE "clerk_id" = ${clerkId}
    `;

    if (existingUser.length > 0) {
      return res.json({ 
        success: true, 
        user: existingUser[0], 
        message: 'User already exists' 
      });
    }

    // Create new user
    const newUser = await client`
      INSERT INTO "users" (
        "clerk_id", 
        "email", 
        "first_name", 
        "last_name", 
        "image_url"
      ) VALUES (
        ${clerkId},
        ${email},
        ${firstName || null},
        ${lastName || null},
        ${imageUrl || null}
      ) RETURNING *;
    `;

    console.log('✅ New user created via API:', {
      id: newUser[0].id,
      email: newUser[0].email,
      name: `${newUser[0].first_name} ${newUser[0].last_name}`,
      clerkId: newUser[0].clerk_id
    });

    res.json({ 
      success: true, 
      user: newUser[0],
      message: 'User created successfully' 
    });

  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message 
    });
  }
});

app.put('/api/users/:clerkId/profile', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { preferences, dietaryRestrictions } = req.body;

    // Update user profile
    const updatedUser = await client`
      UPDATE "users" 
      SET 
        "preferences" = ${JSON.stringify(preferences || [])}::json,
        "dietary_restrictions" = ${JSON.stringify(dietaryRestrictions || [])}::json,
        "updated_at" = NOW()
      WHERE "clerk_id" = ${clerkId}
      RETURNING *;
    `;

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User profile updated via API:', {
      id: updatedUser[0].id,
      email: updatedUser[0].email,
      preferences: updatedUser[0].preferences,
      dietaryRestrictions: updatedUser[0].dietary_restrictions
    });

    res.json({ 
      success: true, 
      user: updatedUser[0],
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
});

app.get('/api/users/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;

    const user = await client`
      SELECT * FROM "users" WHERE "clerk_id" = ${clerkId}
    `;

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: user[0] 
    });

  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      details: error.message 
    });
  }
});

// Recipe endpoints (for future use)
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await client`
      SELECT * FROM "recipes" ORDER BY "created_at" DESC
    `;

    res.json({ 
      success: true, 
      recipes 
    });

  } catch (error) {
    console.error('❌ Error fetching recipes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recipes',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Chef API Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👤 User endpoints: POST/PUT/GET /api/users`);
  console.log(`🍳 Recipe endpoints: GET /api/recipes`);
  console.log(`📱 Mobile access: http://10.189.43.232:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await client.end();
  process.exit(0);
});