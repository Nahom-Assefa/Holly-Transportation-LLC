import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        isAdmin: boolean;
      };
    }
  }
}

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: "holly-transportation-efb90",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const setupFirebaseAuth = async (app: any) => {
  console.log('🔥 Firebase Admin SDK initialized');
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);

    // Simple admin check from environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || null,
      firstName: decodedToken.name?.split(' ')[0] || null,
      lastName: decodedToken.name?.split(' ').slice(1).join(' ') || null,
      isAdmin: adminEmails.includes(decodedToken.email || '')
    };

    next();
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await requireAuth(req, res, async () => {
      // Check if user is admin in your PostgreSQL database
      // For now, we'll need to implement this check
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    return res.status(403).json({ error: 'Admin access required' });
  }
};
