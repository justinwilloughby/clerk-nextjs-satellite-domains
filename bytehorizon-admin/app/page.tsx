"use client"

import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Home() {
  const { getToken } = useAuth();
  
  return (
    <main>
      <SignedIn>
        <UserButton />
        <button onClick={async () => {
          const token = await getToken();
          console.log(token);
          const tokenDiv = document.getElementById("token");
          if (tokenDiv) {
            tokenDiv.textContent = token;
          }
        }}>Get Token</button>
        <div id="token"></div>
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </main>
  );
}
