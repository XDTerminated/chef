const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  const API_BASE_URL = 'http://localhost:3001/api';
  
  try {
    console.log('🧪 Testing API integration...\n');
    
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Create a test user
    console.log('\n2️⃣ Testing user creation...');
    const testUserData = {
      clerkId: 'test_api_user_123',
      email: 'testapi@example.com',
      firstName: 'API',
      lastName: 'Test',
      imageUrl: 'https://example.com/test.jpg'
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData),
    });
    
    const createResult = await createResponse.json();
    console.log('✅ User created:', {
      id: createResult.user.id,
      email: createResult.user.email,
      name: `${createResult.user.first_name} ${createResult.user.last_name}`,
      clerkId: createResult.user.clerk_id
    });
    
    // Test 3: Update user profile
    console.log('\n3️⃣ Testing profile update...');
    const profileData = {
      preferences: ['Italian', 'Mexican'],
      dietaryRestrictions: ['Vegetarian', 'Gluten Free']
    };
    
    const updateResponse = await fetch(`${API_BASE_URL}/users/${testUserData.clerkId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    const updateResult = await updateResponse.json();
    console.log('✅ Profile updated:', {
      preferences: updateResult.user.preferences,
      dietaryRestrictions: updateResult.user.dietary_restrictions
    });
    
    // Test 4: Get user
    console.log('\n4️⃣ Testing user retrieval...');
    const getResponse = await fetch(`${API_BASE_URL}/users/${testUserData.clerkId}`);
    const getResult = await getResponse.json();
    console.log('✅ User retrieved:', {
      id: getResult.user.id,
      email: getResult.user.email,
      name: `${getResult.user.first_name} ${getResult.user.last_name}`,
      preferences: getResult.user.preferences,
      dietaryRestrictions: getResult.user.dietary_restrictions
    });
    
    console.log('\n🎉 All API tests passed! The integration is working correctly.');
    console.log('\n📊 Your Neon database now contains:');
    console.log('   - Your real user data (Shiven Kk)');
    console.log('   - Test data from scripts');
    console.log('   - New test user from API');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();