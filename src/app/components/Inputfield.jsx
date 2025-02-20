"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import send from "../../../public/image/send.svg";
import { toast } from "react-hot-toast";

export default function InputBox({ setMessages, setDetectedLanguage }) {
  const [inputText, setInputText] = useState("");
  const [isAvailable, setIsAvailable] = useState(null);
  const [detector, setDetector] = useState(null);

  const getFullLanguageName = (languageCode) => {
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
      if (typeof window !== "undefined" && window.ai?.languageDetector) {
        toast.success("Chrome AI support detected.", { duration: 3000 });
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

  const initializeDetector = async () => {
    try {
      if (!window.ai?.languageDetector) {
        toast.error("Language detection is not supported.");
        setIsAvailable(false);
        return;
      }

      const languageDetectorCapabilities =
        await window.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.available;

      if (canDetect !== "no") {
        const newDetector =
          canDetect === "readily"
            ? await window.ai.languageDetector.create()
            : await window.ai.languageDetector.create({
                monitor(m) {
                  m.addEventListener("downloadprogress", (e) => {
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
      console.error("Error starting language detector:", error);
      toast.error("Error starting language detector. Try again.");
      setIsAvailable(false);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      detectLanguage(e);
    }
  };

  const detectLanguage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      toast.error("Type something.", { duration: 2000 });
      return;
    }

    try {
      if (isAvailable && detector) {
        const result = await detector.detect(inputText);
        if (result.length === 0) {
          throw new Error("No language detected.");
        }

        const detectedLanguage = result[0].detectedLanguage;
        const detectedLanguageFull = getFullLanguageName(detectedLanguage);
        setDetectedLanguage(detectedLanguage);

        setMessages((prev) => [
          ...prev,
          {
            text: inputText,
            language: `Language Detected: ${detectedLanguageFull}`,
            confidence: `(${Math.round(result[0].confidence * 100)}% sure)`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: inputText,
            language: "AI not supported. Could not detect language.",
            confidence: null,
          },
        ]);
      }
    } catch (error) {
      console.error("Error detecting language:", error);
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
      />
      <button
        type="submit"
        className="w-fit h-fit p-2 border hover:bg-white rounded-[50%]"
      >
        <Image src={send} alt="send icon" className="w-5 h-5" />
      </button>
    </form>
  );
}
