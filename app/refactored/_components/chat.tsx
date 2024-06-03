"use client";

import { CoreMessage } from "ai";
import { useOptimistic, useState } from "react";
import { continueConversation } from "../actions";
import { readStreamableValue } from "ai/rsc";

export const Chat = () => {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [optimisticMessages, setOptimsticMessages] = useOptimistic<
    CoreMessage[]
  >([]);
  const [optimisticInput, setOptimsticInput] = useOptimistic("");
  const [input, setInput] = useState("");
  const [data, setData] = useState<any>();

  return (
    <main>
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        {(optimisticMessages || messages).map((m, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {m.role === "user" ? "User: " : "AI: "}
            {m.content as string}
          </div>
        ))}

        <form
          action={async () => {
            setOptimsticInput("");
            const newMessages: CoreMessage[] = [
              ...messages,
              { content: input, role: "user" },
            ];
            setOptimsticMessages(newMessages);

            const result = await continueConversation(newMessages);
            setData(result.data);

            for await (const content of readStreamableValue(result.message)) {
              setMessages([
                ...newMessages,
                {
                  role: "assistant",
                  content: content as string,
                },
              ]);
            }
          }}
        >
          <input
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={optimisticInput || input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
      </div>
    </main>
  );
};
