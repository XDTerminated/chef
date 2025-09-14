// Real API functions for user operations
// These make HTTP requests to the backend API server

// Use environment variable for API URL, fallback to local development IP
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.189.43.232:3001/api';

export const userAPI = {
  async createOrUpdateUser(userData: {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }) {
    console.log('Creating/updating user via API:', userData);
    console.log('API URL:', API_BASE_URL);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('User created/updated via API:', result.user);
      return result.user;
    } catch (error) {
      console.error('Error creating/updating user via API:', error);
      console.error('Network error details:', error.message);
      throw error;
    }
  },

  async updateUserProfile(clerkId: string, profileData: {
    preferences?: string[];
    dietaryRestrictions?: string[];
    ingredients?: string[];
    customIngredients?: string[];
    customCuisines?: string[];
    customDietary?: string[];
    skillLevel?: string;
    timePreference?: string;
    mealTypes?: string[];
    flavorProfiles?: string[];
  }) {
    console.log('Updating user profile via API:', { clerkId, profileData });
    console.log('API URL:', API_BASE_URL);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${clerkId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('User profile updated via API:', result.user);
      return result.user;
    } catch (error) {
      console.error('Error updating user profile via API:', error);
      console.error('Network error details:', error.message);
      throw error;
    }
  },

  async getUserByClerkId(clerkId: string) {
    console.log('Getting user by clerk ID via API:', clerkId);
    console.log('API URL:', API_BASE_URL);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${clerkId}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('User not found (404)');
          return null; // User not found
        }
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('User found via API:', result.user);
      return result.user;
    } catch (error) {
      console.error('Error getting user via API:', error);
      console.error('Network error details:', error.message);
      throw error;
    }
  }
};