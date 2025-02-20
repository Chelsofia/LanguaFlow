"use client";

import ChatBox from "@/app/components/Chatbox";
import InputBox from "@/app/components/Inputfield";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState("");

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <>
      <section className="w-full max-w-[95%] mx-auto p-2 mb-8 ">
        <h1 className="flex justify-center text-4xl mt-4 font-bold text-white">
          LanguaFlow
        </h1>
        <p className="flex justify-center text-2xl font-bold text-gray-700">
          Translate, Detect languages and Summarize text.
        </p>
        <ChatBox
          messages={messages}
          clearMessages={clearMessages}
          inputText={
            messages.length > 0 ? messages[messages.length - 1].text : ""
          }
          detectedLanguage={detectedLanguage}
        />

      
        <InputBox
          setMessages={setMessages}
          setDetectedLanguage={setDetectedLanguage}
        />
      </section>
     
    </>
  );
}
