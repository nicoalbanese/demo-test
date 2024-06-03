import { Chat } from "./_components/chat";

// Allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default function ChatPage() {
  return (
    <main>
      <Chat />
    </main>
  );
}
