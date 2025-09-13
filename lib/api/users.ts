// Real API functions for user operations
// These make HTTP requests to the backend API server

const API_BASE_URL = 'http://10.189.43.232:3001/api';

export const userAPI = {
  async createOrUpdateUser(userData: {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }) {
    console.log('Creating/updating user via API:', userData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('User created/updated via API:', result.user);
      return result.user;
    } catch (error) {
      console.error('Error creating/updating user via API:', error);
      throw error;
    }
  },

  async updateUserProfile(clerkId: string, profileData: {
    preferences?: string[];
    dietaryRestrictions?: string[];
  }) {
    console.log('Updating user profile via API:', { clerkId, profileData });
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${clerkId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('User profile updated via API:', result.user);
      return result.user;
    } catch (error) {
      console.error('Error updating user profile via API:', error);
      throw error;
    }
  },

  async getUserByClerkId(clerkId: string) {
    console.log('Getting user by clerk ID via API:', clerkId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${clerkId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('User found via API:', result.user);
      return result.user;
    } catch (error) {
      console.error('Error getting user via API:', error);
      throw error;
    }
  }
};