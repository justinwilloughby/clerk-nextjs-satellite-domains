import { NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
    const clerk = await clerkClient();

    const requestState = await clerk.authenticateRequest(request);

    if (requestState.status !== "signed-in") {
        return new Response("Unauthorized", { status: 401 });
    }

    return new Response("Hello, world!", {
        status: 200,
    });
}