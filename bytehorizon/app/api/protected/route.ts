import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// Define allowed origins
const allowedOrigins = [
  'https://admin.bytehorizon.xyz',
  // Add any other satellite domains that need access
];

// CORS headers helper function
function setCorsHeaders(response: NextResponse, origin: string): NextResponse {
  const headers = new Headers(response.headers);
  
  if (allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else {
    // Fall back to the bytehorizon.xyz domain to be safe
    headers.set('Access-Control-Allow-Origin', 'https://www.bytehorizon.xyz');
  }
  
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Handle OPTIONS requests (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  
  return setCorsHeaders(
    new NextResponse(null, { status: 204 }), // No content needed for OPTIONS
    origin
  );
}

export async function GET(request: NextRequest) {
    const clerk = await clerkClient();
    const origin = request.headers.get('origin') || '';

    const requestState = await clerk.authenticateRequest(request);

    if (requestState.status !== "signed-in") {
        return setCorsHeaders(
          new NextResponse("Unauthorized", { status: 401 }),
          origin
        );
    }

    return setCorsHeaders(
      new NextResponse("Hello, world!", { status: 200 }),
      origin
    );
}