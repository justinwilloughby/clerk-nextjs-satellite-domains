"use client";

import { useAuth, useSession, useClerk } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export default function AdminPage() {
    const { isSignedIn, getToken } = useAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!isSignedIn) return;

        // Handle messages from the iframe
        async function handleMessage(event: MessageEvent) {
            // Validate origin
            if (event.origin !== 'http://localhost:3001') {
                return;
            }

            // Handle token requests
            if (event.data?.type === 'REQUEST_AUTH_TOKEN' &&
                typeof event.data.id === 'number' &&
                iframeRef.current?.contentWindow) {

                // Get the current token
                const token = await getToken();

                if (token) {
                    // Send token back to the iframe
                    iframeRef.current.contentWindow.postMessage({
                        type: 'AUTH_TOKEN_RESPONSE',
                        token,
                        id: event.data.id,
                        timestamp: Date.now()
                    }, 'http://localhost:3001');
                }
            }
        }

        // Register message listener
        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [isSignedIn, getToken]);

    return (
        <div>
            <button onClick={async () => {
                const token = await getToken();
                console.log("This is main app", token);
            }}>Get Token</button>
            <iframe
                ref={iframeRef}
                src="http://localhost:3001"
                title="Admin Panel"
            />
        </div>
    );
}