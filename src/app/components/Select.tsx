"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function Select({
  onValueChange,
  value,
  children,
}: {
  onValueChange: (value: string) => void;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="border p-2"
    >
      {children}
    </select>
  );
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return <option value={value}>{children}</option>;
}

export default function Chatbox() {
  const [messages, setMessages] = useState<
    { text: string; translated: string | null }[]
  >([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [translatedLanguage, setTranslatedLanguage] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, translated: null }]);
      setInput("");
    }
  };

  const handleTranslate = async (index: number) => {
    try {
      const text = messages[index].text;
      const translatedText = await handleTranslation(text, language);
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index].translated = translatedText;
        return newMessages;
      });
    } catch (error) {
      toast.error("Failed to translate. Try again.");
    }
  };

  const handleTranslation = async (
    text: string,
    targetLang: string
  ): Promise<string> => {
    if (!text.trim()) {
      toast.error("No text to translate. Please input some text!");
      return "";
    }
    if (!language) {
      toast.error("No target language detected. Please pick a language.");
      return "";
    }

    try {
      setIsLoading(true);
      const result = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`Translated (${targetLang}): ${text}`);
        }, 1000);
      });
      setIsLoading(false);
      setTranslatedLanguage(targetLang);
      setTranslatedText(result);
      return result;
    } catch (error) {
      setIsLoading(false);
      console.error("Translation failed", error);
      toast.error("Failed to translate. Try again.");
      return "";
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 border rounded-lg shadow-md">
      <div className="h-96 overflow-y-auto p-2 mb-4 border rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2 p-2 border rounded-lg bg-gray-100">
            <p>{msg.translated || msg.text}</p>
            <button
              onClick={() => handleTranslate(index)}
              className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-sm"
            >
              Translate
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <textarea
          className="flex-1 border p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
      <div className="mt-2">
        <Select onValueChange={setLanguage} value={language}>
          {["en", "pt", "es", "ru", "tr", "fr"].map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang.toUpperCase()}
            </SelectItem>
          ))}
        </Select>
      </div>
      {isLoading && <p className="text-sm text-gray-500">Translating...</p>}
      {translatedText && (
        <div className="mt-2 p-2 border rounded-lg bg-gray-100">
          <p className="text-sm font-bold">
            Translation - {translatedLanguage}
          </p>
          <p>{translatedText}</p>
        </div>
      )}
    </div>
  );
}
