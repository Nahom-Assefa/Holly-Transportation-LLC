import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { insertBookingSchema, insertMessageSchema, insertContactMessageSchema } from "@shared/schema";

/**
 * Registers all API routes for Holly Transportation
 * 
 * @description Sets up authentication middleware and all API endpoints including
 * user management, booking operations, messaging system, and admin functionality.
 * Handles request validation, error responses, and database interactions.
 * 
 * @param {Express} app - Express application instance
 * @returns {Promise<Server>} HTTP server instance for the application
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Local authentication setup
  const { setupLocalAuth, requireAuth, requireAdmin } = await import("./localAuth");
  await setupLocalAuth(app);

  // Auth routes
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile update route
  app.put('/api/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Track what fields are being updated
      const changes = [];
      if (req.body.firstName !== user.firstName) changes.push('firstName');
      if (req.body.lastName !== user.lastName) changes.push('lastName');
      if (req.body.email !== user.email) changes.push('email');
      if (req.body.phone !== user.phone) changes.push('phone');

      // Update user profile with new data
      const updatedUser = await storage.updateUser(userId, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
      });

      // Create audit log entry for profile update
      if (changes.length > 0) {
        await storage.createAuditLog({
          userId,
          action: 'profile_updated',
          entityType: 'profile',
          entityId: userId,
          details: {
            changes: changes.join(', '),
            oldValues: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
            },
            newValues: {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              phone: req.body.phone,
            }
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Booking routes
  app.post('/api/bookings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        userId,
      });
      
      const booking = await storage.createBooking(validatedData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      let bookings;
      if (user?.isAdmin) {
        bookings = await storage.getAllBookings();
      } else {
        bookings = await storage.getBookingsByUser(userId);
      }
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.patch('/api/bookings/:id/status', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const booking = await storage.updateBookingStatus(req.params.id, req.body.status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }


      
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Delete booking route (admin only)
  app.delete('/api/bookings/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const deleted = await storage.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Delete user's own booking route
  app.delete('/api/bookings/:id/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;
      
      // Get the booking to verify ownership
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Verify the user owns this booking
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own bookings" });
      }
      
      // Create audit log entry before deletion
      await storage.createAuditLog({
        userId,
        action: 'booking_deleted',
        entityType: 'booking',
        entityId: bookingId,
        details: {
          patientName: booking.patientName,
          pickupAddress: booking.pickupAddress,
          destination: booking.destination,
          pickupDate: booking.pickupDate,
          pickupTime: booking.pickupTime,
          serviceType: booking.serviceType,
          status: booking.status,
          reason: 'User deleted own booking'
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      const deleted = await storage.deleteBooking(bookingId);
      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting user booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Get audit logs (admin only)
  app.get('/api/admin/audit-logs', requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      
      const [logs, totalCount] = await Promise.all([
        storage.getAuditLogs(limit, offset),
        storage.getAuditLogsCount()
      ]);
      
      res.json({
        logs,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Bulk delete audit logs (admin only)
  app.delete('/api/admin/audit-logs/bulk', requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { logIds } = req.body;
      if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
        return res.status(400).json({ message: "Invalid log IDs provided" });
      }
      
      const deletedCount = await storage.deleteAuditLogs(logIds);
      res.json({ message: `Successfully deleted ${deletedCount} audit logs` });
    } catch (error) {
      console.error("Error deleting audit logs:", error);
      res.status(500).json({ message: "Failed to delete audit logs" });
    }
  });

  /**
   * MESSAGING SYSTEM API ROUTES - COMMENTED OUT
   * 
   * The messaging system has been replaced with mailto protocol for direct email contact.
   * Contact messages are now sent directly to hollytransport04@gmail.com instead of being
   * stored in the database. This provides immediate delivery and simpler user experience.
   * 
   * Disabled routes:
   * - POST /api/messages (create message)
   * - GET /api/messages (fetch user messages)
   * - PATCH /api/messages/:id/response (admin respond to message)
   * - PATCH /api/messages/:id/read (mark message as read)
   */
  
  // app.post('/api/messages', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const userId = req.user.claims.sub;
  //     const validatedData = insertMessageSchema.parse({
  //       ...req.body,
  //       userId,
  //     });
  //     
  //     const message = await storage.createMessage(validatedData);
  //     res.json(message);
  //   } catch (error) {
  //     console.error("Error creating message:", error);
  //     res.status(400).json({ message: "Failed to create message" });
  //   }
  // });

  // app.get('/api/messages', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const userId = req.user.claims.sub;
  //     const user = await storage.getUser(userId);
  //     
  //     let messages;
  //     if (user?.isAdmin) {
  //       messages = await storage.getAllMessages();
  //     } else {
  //       messages = await storage.getMessagesByUser(userId);
  //     }
  //     
  //     res.json(messages);
  //   } catch (error) {
  //     console.error("Error fetching messages:", error);
  //     res.status(500).json({ message: "Failed to fetch messages" });
  //   }
  // });

  // app.patch('/api/messages/:id/response', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const userId = req.user.claims.sub;
  //     const user = await storage.getUser(userId);
  //     
  //     if (!user?.isAdmin) {
  //       return res.status(403).json({ message: "Admin access required" });
  //     }
  //     
  //     const message = await storage.updateMessageResponse(req.params.id, req.body.response);
  //     if (!message) {
  //       return res.status(404).json({ message: "Message not found" });
  //     }
  //     
  //     res.json(message);
  //   } catch (error) {
  //     console.error("Error responding to message:", error);
  //     res.status(500).json({ message: "Failed to respond to message" });
  //   }
  // });

  // app.patch('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const message = await storage.markMessageAsRead(req.params.id);
  //     if (!message) {
  //       return res.status(404).json({ message: "Message not found" });
  //     }
  //     
  //     res.json(message);
  //   } catch (error) {
  //     console.error("Error marking message as read:", error);
  //     res.status(500).json({ message: "Failed to mark message as read" });
  //   }
  // });

  // Contact form route (public) - DISABLED
  // app.post('/api/contact', async (req, res) => {
  //   try {
  //     const validatedData = insertContactMessageSchema.parse(req.body);
  //     const message = await storage.createContactMessage(validatedData);
  //     res.json(message);
  //   } catch (error) {
  //     console.error("Error creating contact message:", error);
  //     res.status(400).json({ message: "Failed to send contact message" });
  //   }
  // });





  // Admin routes
  app.get('/api/admin/stats', requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // app.get('/api/admin/contact-messages', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const userId = req.user.claims.sub;
  //     const user = await storage.getUser(userId);
  //     
  //     if (!user?.isAdmin) {
  //       return res.status(403).json({ message: "Admin access required" });
  //     }
  //     
  //     const messages = await storage.getAllContactMessages();
  //     res.json(messages);
  //   } catch (error) {
  //     console.error("Error fetching contact messages:", error);
  //     res.status(500).json({ message: "Failed to fetch contact messages" });
  //   }
  // });

  const httpServer = createServer(app);
  return httpServer;
}
