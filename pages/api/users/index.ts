import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NextApiRequest, NextApiResponse } from 'next';
import postgres from 'postgres';
import { users } from '../../lib/db/schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema: { users } });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Create user
    try {
      const { clerkId, email, firstName, lastName, preferences, dietaryRestrictions, imageUrl } = req.body;
      
      const [user] = await db.insert(users).values({
        clerkId,
        email,
        firstName,
        lastName,
        preferences: preferences || [],
        dietaryRestrictions: dietaryRestrictions || [],
        imageUrl,
      }).returning();
      
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  } else if (req.method === 'PUT') {
    // Update user
    try {
      const { clerkId, ...updates } = req.body;
      
      const [user] = await db
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, clerkId))
        .returning();
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  } else if (req.method === 'GET') {
    // Get user by clerkId
    try {
      const { clerkId } = req.query;
      
      if (!clerkId) {
        return res.status(400).json({ error: 'clerkId is required' });
      }
      
      const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId as string));
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}