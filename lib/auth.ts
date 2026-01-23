import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d';

// Interface for JWT payloads
export interface JWTPayload {
  adminId: string;
  email: string;
  role: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  adminId: string;
  email: string;
  tokenVersion?: number;
  iat?: number;
  exp?: number;
}

export interface ResetTokenPayload {
  adminId: string;
  email: string;
  role: 'password_reset';
  permissions: string[];
  iat?: number;
  exp?: number;
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyResetToken = (token: string): ResetTokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
  } catch (error) {
    return null;
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOTP = async (otp: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

export const verifyOTPHash = async (otp: string, hashedOTP: string) => {
  return bcrypt.compare(otp, hashedOTP);
};

export const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  
  return {
    isValid,
    errors: [
      !password.length ? 'Password is required' : '',
      password.length < minLength ? `Password must be at least ${minLength} characters long` : '',
      !hasUpperCase ? 'Password must contain at least one uppercase letter' : '',
      !hasLowerCase ? 'Password must contain at least one lowercase letter' : '',
      !hasNumbers ? 'Password must contain at least one number' : '',
      !hasSpecialChar ? 'Password must contain at least one special character' : '',
    ].filter(Boolean),
  };
};

export const sanitizeInput = (input: string) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/[<>'"]/g, '');
};

export const checkRateLimit = (identifier: string, limit = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const key = `rate_limit_${identifier}`;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }
  
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  current.count++;
  rateLimitStore.set(key, current);
  
  return { allowed: true, remaining: limit - current.count, resetTime: current.resetTime };
};

export const extractTokenFromHeaders = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

export const getClientIP = (req: NextRequest) => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const remoteAddr = req.headers.get('remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || remoteAddr || '127.0.0.1';
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};