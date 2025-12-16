import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

export const getTokenFromRequest = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  return token || null;
};

export const authenticateRequest = (req: NextRequest): { userId: string } | null => {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  
  return verifyToken(token);
};

export const requireAuth = async (req: NextRequest): Promise<{ userId: string } | null> => {
  return authenticateRequest(req);
};


