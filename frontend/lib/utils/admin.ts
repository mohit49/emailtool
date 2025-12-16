import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { authenticateRequest } from '@/lib/utils/auth';

export const requireAdmin = async (req: NextRequest): Promise<{ userId: string } | null> => {
  const auth = authenticateRequest(req);
  if (!auth) {
    return null;
  }

  await connectDB();
  
  const user = await User.findById(auth.userId);
  if (!user || user.role !== 'admin') {
    return null;
  }

  return auth;
};


