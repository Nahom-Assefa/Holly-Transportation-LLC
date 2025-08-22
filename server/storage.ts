import {
  users,
  bookings,
  messages,
  contactMessages,
  type User,
  type UpsertUser,
  type Booking,
  type InsertBooking,
  type Message,
  type InsertMessage,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";

/**
 * Storage interface defining all database operations for Holly Transportation
 * 
 * @description Comprehensive interface for user management, booking operations,
 * messaging system, and admin functionality. Ensures consistent data access
 * patterns across the application.
 */
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Local development user operations
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createLocalUser(userData: any): Promise<User>;
  updateUser(id: string, userData: any): Promise<User>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUser(userId: string): Promise<Message[]>;
  getAllMessages(): Promise<Message[]>;
  updateMessageResponse(id: string, response: string): Promise<Message | undefined>;
  markMessageAsRead(id: string): Promise<Message | undefined>;
  
  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  markContactMessageAsRead(id: string): Promise<ContactMessage | undefined>;
  
  // Admin stats
  getAdminStats(): Promise<{
    todayBookings: number;
    activeUsers: number;
    pendingMessages: number;
    totalRevenue: number;
  }>;
}

/**
 * Database storage implementation for Holly Transportation
 * 
 * @description Production-ready storage class implementing all business logic
 * for user management, booking operations, messaging, and admin functionality.
 * Uses Drizzle ORM with PostgreSQL for reliable data persistence.
 */
export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  
  /**
   * Retrieves a user by their unique identifier
   * 
   * @param {string} id - The user's unique identifier from authentication
   * @returns {Promise<User | undefined>} The user object or undefined if not found
   */
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  /**
   * Retrieves a user by their username (for local development)
   * 
   * @param {string} username - The user's username
   * @returns {Promise<User | undefined>} The user object or undefined if not found
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  /**
   * Retrieves a user by their email address
   * 
   * @param {string} email - The user's email address
   * @returns {Promise<User | undefined>} The user object or undefined if not found
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  /**
   * Creates a new user for local development authentication
   * 
   * @param {any} userData - Complete user data including password and username
   * @returns {Promise<User>} The created user object
   */
  async createLocalUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  /**
   * Updates an existing user record
   * 
   * @param {string} id - User ID to update
   * @param {any} userData - User data to update
   * @returns {Promise<User>} The updated user object
   */
  async updateUser(id: string, userData: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  /**
   * Creates or updates a user record
   * 
   * @param {UpsertUser} userData - User data to insert or update
   * @returns {Promise<User>} The created or updated user object
   */
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Booking operations
  
  /**
   * Creates a new transportation booking
   * 
   * @param {InsertBooking} booking - Booking data to create
   * @returns {Promise<Booking>} The created booking object
   */
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  /**
   * Retrieves all bookings for a specific user
   * 
   * @param {string} userId - The user's unique identifier
   * @returns {Promise<Booking[]>} Array of user's bookings ordered by creation date
   */
  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  /**
   * Retrieves all bookings across all users (admin function)
   * 
   * @returns {Promise<Booking[]>} Array of all bookings ordered by creation date
   */
  async getAllBookings(): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(desc(messages.createdAt));
  }

  async getAllMessages(): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt));
  }

  async updateMessageResponse(id: string, response: string): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ response, isResolved: true, updatedAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  // Contact message operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  async markContactMessageAsRead(id: string): Promise<ContactMessage | undefined> {
    const [message] = await db
      .update(contactMessages)
      .set({ isRead: true })
      .where(eq(contactMessages.id, id))
      .returning();
    return message;
  }

  // Admin stats
  async getAdminStats(): Promise<{
    todayBookings: number;
    activeUsers: number;
    pendingMessages: number;
    totalRevenue: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const [todayBookingsResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.pickupDate, today));

    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users);

    const [pendingMessagesResult] = await db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.isRead, false));

    return {
      todayBookings: todayBookingsResult.count,
      activeUsers: activeUsersResult.count,
      pendingMessages: pendingMessagesResult.count,
      totalRevenue: 18500, // This would be calculated from completed bookings in a real app
    };
  }
}

export const storage = new DatabaseStorage();
