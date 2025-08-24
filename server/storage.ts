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
  auditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, inArray } from "drizzle-orm";

/**
 * Storage interface defining all database operations for Holly Transportation
 * 
 * @description Comprehensive interface for user management, booking operations,
 * messaging system, and admin functionality. Ensures consistent data access
 * patterns across the application.
 */
export interface IStorage {
  // User operations
  // User operations for local authentication
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
  deleteBooking(id: string): Promise<boolean>;
  
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
  }>;
  
  // Audit log methods
  createAuditLog(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any>;
  getAuditLogs(limit?: number, offset?: number): Promise<any[]>;
  getAuditLogsCount(): Promise<number>;
  deleteAuditLogs(logIds: string[]): Promise<number>;
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
  // User operations for local authentication
  
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

  async deleteBooking(id: string): Promise<boolean> {
    const [deletedBooking] = await db
      .delete(bookings)
      .where(eq(bookings.id, id))
      .returning();
    return !!deletedBooking;
  }

  // Message operations (commented out but interface requires them)
  async createMessage(messageData: any): Promise<any> {
    // Messages are now handled via mailto protocol
    throw new Error("Messages are now handled via mailto protocol");
  }

  async getMessagesByUser(userId: string): Promise<any[]> {
    // Messages are now handled via mailto protocol
    return [];
  }

  async getAllMessages(): Promise<any[]> {
    // Messages are now handled via mailto protocol
    return [];
  }

  async updateMessageResponse(id: string, response: string): Promise<any> {
    // Messages are now handled via mailto protocol
    throw new Error("Messages are now handled via mailto protocol");
  }

  async markMessageAsRead(id: string): Promise<any> {
    // Messages are now handled via mailto protocol
    throw new Error("Messages are now handled via mailto protocol");
  }

  // Contact message operations
  async createContactMessage(messageData: any): Promise<any> {
    const [message] = await db
      .insert(contactMessages)
      .values(messageData)
      .returning();
    return message;
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
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const [todayBookingsResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.pickupDate, today));

    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users);

    return {
      todayBookings: todayBookingsResult.count,
      activeUsers: activeUsersResult.count,
    };
  }

  // Create audit log entry
  async createAuditLog(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const [auditEntry] = await db
      .insert(auditLog)
      .values(data)
      .returning();
    return auditEntry;
  }

  // Get audit logs for admin viewing
  async getAuditLogs(limit: number = 100, offset: number = 0): Promise<any[]> {
    const logs = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        details: auditLog.details,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        createdAt: auditLog.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.userId, users.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset);
    
    return logs;
  }

  // Get audit logs count for pagination
  async getAuditLogsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(auditLog);
    return result.count;
  }

  // Delete multiple audit logs by IDs
  async deleteAuditLogs(logIds: string[]): Promise<number> {
    const result = await db
      .delete(auditLog)
      .where(inArray(auditLog.id, logIds));
    
    return result.rowCount || 0;
  }
}

export const storage = new DatabaseStorage();
