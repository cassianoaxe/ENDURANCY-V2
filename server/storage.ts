import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserPassword(id: number, newPassword: string): Promise<boolean>;
  updateUserPhoto(id: number, photoPath: string): Promise<User | undefined>;
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUserProfile(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        // Remove sensitive fields if they are somehow included
        password: undefined,
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || undefined;
  }
  
  async updateUserPassword(id: number, newPassword: string): Promise<boolean> {
    const [updatedUser] = await db
      .update(users)
      .set({
        password: newPassword,
        lastPasswordChange: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return !!updatedUser;
  }
  
  async updateUserPhoto(id: number, photoPath: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        profilePhoto: photoPath,
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || undefined;
  }
}

export const storage = new DatabaseStorage();
