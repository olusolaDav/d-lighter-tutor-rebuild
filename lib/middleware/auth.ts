import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, type JWTPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  admin?: {
    adminId: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from cookies or Authorization header
      const token = request.cookies.get('accessToken')?.value ||
                   request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Authentication token is required' },
          { status: 401 }
        );
      }

      // Verify token
      const tokenPayload = verifyAccessToken(token);
      if (!tokenPayload) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired authentication token' },
          { status: 401 }
        );
      }

      // Add admin info to request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.admin = {
        adminId: tokenPayload.adminId,
        email: tokenPayload.email,
        role: tokenPayload.role,
        permissions: tokenPayload.permissions || [],
      };

      // Call the original handler
      return handler(authenticatedRequest);

    } catch (error: any) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

export function withPermissions(requiredPermissions: string[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
      const admin = request.admin!;

      // Check if admin has required permissions
      const hasPermissions = requiredPermissions.every(permission => 
        admin.permissions.includes(permission)
      );

      if (!hasPermissions) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Insufficient permissions to access this resource',
            requiredPermissions,
            userPermissions: admin.permissions
          },
          { status: 403 }
        );
      }

      return handler(request);
    });
  };
}

export function withRole(requiredRoles: string[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
      const admin = request.admin!;

      if (!requiredRoles.includes(admin.role)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Insufficient role permissions to access this resource',
            requiredRoles,
            userRole: admin.role
          },
          { status: 403 }
        );
      }

      return handler(request);
    });
  };
}

// Combined middleware for role and permissions
export function withRoleAndPermissions(requiredRoles: string[], requiredPermissions: string[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
      const admin = request.admin!;

      // Check role
      if (!requiredRoles.includes(admin.role)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Insufficient role permissions to access this resource',
            requiredRoles,
            userRole: admin.role
          },
          { status: 403 }
        );
      }

      // Check permissions
      const hasPermissions = requiredPermissions.every(permission => 
        admin.permissions.includes(permission)
      );

      if (!hasPermissions) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Insufficient permissions to access this resource',
            requiredPermissions,
            userPermissions: admin.permissions
          },
          { status: 403 }
        );
      }

      return handler(request);
    });
  };
}