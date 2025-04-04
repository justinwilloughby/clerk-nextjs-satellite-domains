"use client"

import { useEmbeddedAuth } from "./EmbeddedAuthProvider";

export default function Home() {
  const { executeAuthenticatedRequest } = useEmbeddedAuth();
  
  return (
    <main>
      <button onClick={async () => {
        await executeAuthenticatedRequest(async (token) => {
          console.log("This is admin app", token);

          // Call an API that's protected by Clerk
          const response = await fetch("https://www.bytehorizon.xyz/api/protected", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.text();
          console.log("Protected API response:", data);
        });
      }}>Execute Authenticated Request</button>
    </main>
  );
}
