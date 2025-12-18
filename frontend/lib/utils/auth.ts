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
  // Try Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) return token;
  }
  
  // Try cookie (for API key authentication)
  const cookieToken = req.cookies.get('przio_api_token')?.value;
  if (cookieToken) return cookieToken;
  
  return null;
};

export const authenticateRequest = (req: NextRequest): { userId: string; projectId?: string; apiKeyId?: string; type?: string } | null => {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; projectId?: string; apiKeyId?: string; type?: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

export const requireAuth = async (req: NextRequest): Promise<{ userId: string; projectId?: string; apiKeyId?: string; type?: string } | null> => {
  return authenticateRequest(req);
};


