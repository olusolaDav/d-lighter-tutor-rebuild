import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Clear authentication cookies
    const clearAccessToken = 'accessToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/';
    const clearRefreshToken = 'refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/';

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Logged out successfully'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': [clearAccessToken, clearRefreshToken].join(', '),
        },
      }
    );

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}