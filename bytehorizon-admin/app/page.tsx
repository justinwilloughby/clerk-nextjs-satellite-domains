import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { getToken } = await auth();
  
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
