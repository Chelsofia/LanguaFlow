"use client";
import SummaryComponent from "./SummaryComponent";
import Translator from "./Translator";
import ClearText from "./clearTextButton";

interface ChatBoxProps {
  messages: { text: string; language?: string; confidence?: number }[];
  clearMessages: () => void;
  inputText: string;
  detectedLanguage: string;
}

export default function ChatBox({
  messages,
  clearMessages,
  inputText,
  detectedLanguage,
}: ChatBoxProps) {
  if (messages.length === 0) {
    return (
      <section className="w-full h-auto mx-auto mt-12 p-2 my-2 border border-4 rounded-[20px] border-color">
        <section className="flex items-end m-1">
          <ClearText messages={messages} clearMessages={clearMessages} />
        </section>
        <p className="text-center text-blue-700">No messages yet...</p>
      </section>
    );
  }

  return (
    <section
      className={`w-full h-auto mx-auto mt-12 p-2 my-2 border border-4 rounded-[20px] border-color ${
        messages.length > 3 ? "max-h-[300px] overflow-y-auto" : ""
      }`}
    >
      <section className="flex items-end m-1">
        <ClearText messages={messages} clearMessages={clearMessages} />
      </section>
      {messages.map((message, index) => (
        <section key={index} className="mb-5">
          <section className="text-[0.9rem] rounded-md bg-[#D62828] border border-black mb-1 w-full max-w-fit flex flex-col gap-2 p-1">
            {message.text}
            <SummaryComponent
              textInput={message.text}
              detectedLang={detectedLanguage}
            />
          </section>
          {message.language && (
            <p className="text-sm font-bold">
              {message.language} {message.confidence}
            </p>
          )}
        </section>
      ))}
      <section className="flex gap-3">
        <Translator inputContent={inputText} detectedLang={detectedLanguage} />
      </section>
    </section>
  );
}
