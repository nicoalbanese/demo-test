"use client";
import { type CoreMessage } from "ai";
import { useOptimistic, useState } from "react";
import { continueConversation } from "./actions";
import { readStreamableValue, useStreamableValue } from "ai/rsc";
import { unstable_noStore } from "next/cache";
// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;
function UserMessage({ message }: { message: CoreMessage }) {
  return <>User: {message.content}</>;
}
function AiMessage({ message }: { message: CoreMessage }) {
  const [data, error, pending] = useStreamableValue(message.content);
  return <>AI: {data}</>;
}
export default function Chat() {
  unstable_noStore();
  const [optimisticMessages, setOptimisticMessages] = useOptimistic<
    CoreMessage[] | null
  >(null);
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [optimisticInput, setOptimisticInput] = useOptimistic<string | null>(
    null,
  );
  const [input, setInput] = useState("");
  const [data, setData] = useState<any>();
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      {(optimisticMessages || messages).map((m, i) => {
        return (
          <div key={i} className="whitespace-pre-wrap">
            {m.role === "user" ? (
              <UserMessage message={m} />
            ) : (
              <AiMessage message={m} />
            )}
          </div>
        );
      })}
      <form
        action={async () => {
          const userMessage: CoreMessage = { content: input, role: "user" };
          const newMessages: CoreMessage[] = [...messages, userMessage];
          console.log({ messages });
          setOptimisticInput("");
          setOptimisticMessages(newMessages);
          const serializedMessages: CoreMessage[] = [];
          for (const message of newMessages) {
            let content = message.content;
            if (typeof message.content !== "string") {
              const parts = [];
              for await (const part of readStreamableValue(message.content)) {
                parts.push(part);
              }
              content = parts.join("");
            }
            // @ts-ignore
            const m: CoreMessage = {
              role: message.role,
              content: content,
            };
            serializedMessages.push(m);
          }
          const result = await continueConversation(serializedMessages);
          setData(result.data);
          const realMessages = [
            ...newMessages,
            {
              role: "assistant",
              content: result.message,
            },
          ];
          // @ts-ignore
          setMessages(realMessages);
          setInput("");
        }}
      >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={optimisticInput ?? input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}
