"use client"

import { useEmbeddedAuth } from "./EmbeddedAuthProvider";

export default function Home() {
  const { isLoading, executeAuthenticatedRequest } = useEmbeddedAuth();
  
  return (
    <main>
      <button onClick={async () => {
        await executeAuthenticatedRequest(async (token) => {
          console.log("This is admin app", token);

          // Call an API that's protected by Clerk
          const response = await fetch("http://localhost:3000/api/protected", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          console.log("Protected API response:", data);
        });
      }}>Execute Authenticated Request</button>
    </main>
  );
}
