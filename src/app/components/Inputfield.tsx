"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import send from "../../../public/image/send.svg";
import { toast } from "react-hot-toast";

interface InputBoxProps {
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setDetectedLanguage: React.Dispatch<React.SetStateAction<string>>;
}

export default function InputBox({ setMessages, setDetectedLanguage }: InputBoxProps) {
  const [inputText, setInputText] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [detector, setDetector] = useState<LanguageDetector | null>(null);

interface LanguageDetectionResult {
    detectedLanguage: string;
    confidence: number;
}

const getFullLanguageName = (languageCode: string): string => {
    try {
        return (
            new Intl.DisplayNames(["en"], { type: "language" }).of(languageCode) ||
            languageCode
        );
    } catch (error) {
        console.error("Error converting language code to full:", error);
        return languageCode;
    }
};

  useEffect(() => {
    const checkSupport = async () => {
      if (
        "ai" in self &&
        "translator" in self.ai &&
        "languageDetector" in self.ai &&
        "summarizer" in self.ai
      ) {
        toast.success("Chrome AI support was detected.", {
          duration: 3000,
        });
        await initializeDetector();
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
        toast.error(
          "Browser does not support Chrome AI APIs. Some features may not work."
        );
      }
    };
    checkSupport();
  }, []);

  interface LanguageDetector {
    detect: (text: string) => Promise<LanguageDetectionResult[]>;
    ready?: Promise<void>;
  }

  const initializeDetector = async () => {
    try {
      const languageDetectorCapabilities =
        await self.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.capabilities;

      if (canDetect !== "no") {
        const newDetector =
          canDetect === "readily"
            ? await self.ai.languageDetector.create()
            : await self.ai.languageDetector.create({
                monitor(m: { addEventListener: (arg0: string, arg1: (e: ProgressEvent) => void) => void; }) {
                  m.addEventListener("downloadprogress", (e: ProgressEvent) => {
                    console.log(
                      `Translator: Downloaded ${e.loaded} of ${e.total} bytes.`
                    );
                  });
                },
              });

        if (canDetect !== "readily") await newDetector.ready;
        setDetector(newDetector);
      } else {
        toast.error("Language detection is not supported.");
        setIsAvailable(false);
      }
    } catch (error) {
      console.error("Error starting language detector: ", error);
      toast.error("Error starting language detector. Try again.");
      setIsAvailable(false);
    }
  };

const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        detectLanguage(e as unknown as React.FormEvent<HTMLFormElement>);
    }
};

interface Message {
    text: string;
    language: string;
    confidence: string | null;
}

const detectLanguage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputText.trim()) {
        toast.error("Type something.", {
            duration: 2000,
        });
        return;
    }

    try {
        if (isAvailable && detector) {
            const result: LanguageDetectionResult[] = await detector.detect(inputText);
            const detectedLanguage: string = result[0].detectedLanguage;
            const detectedLanguageFull: string = getFullLanguageName(detectedLanguage);
            setDetectedLanguage(detectedLanguage);

            setMessages((prev: Message[]) => [
                ...prev,
                {
                    text: inputText,
                    language: `Language Detected: ${detectedLanguageFull}`,
                    confidence: `(${parseInt((result[0].confidence * 100).toString())}% sure)`,
                },
            ]);
        } else {
            setMessages((prev: Message[]) => [
                ...prev,
                {
                    text: inputText,
                    language: "AI not supported. Could not detect language.",
                    confidence: null,
                },
            ]);
        }
    } catch (error) {
        console.error("Error detecting language.", error);
        toast.error("Error detecting language.");
    } finally {
        setInputText("");
    }
};

  return (
    <form
      onSubmit={detectLanguage}
      className="w-full max-w-[90%] flex my-2 fixed bottom-0 items-center gap-2"
    >


      <textarea
  value={inputText}
  onChange={handleInputChange}
  onKeyDown={handleKeyDown}
  className="w-full border-2 rounded-xl bg-transparent text-sm p-2 placeholder-red-800"
  placeholder="Type something"
  rows={3}
>


        
      </textarea>
      <button
        type="submit"
        className="w-fit h-fit p-2 border  hover:bg-white rounded-[50%] p-2"
      >
        <Image src={send} alt="send icon" className="w-5 h-5"></Image>
      </button>
    </form>
  );
}
