"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    ai?: {
      summarizer?: {
        capabilities: () => Promise<{ available: string }>;
        create: (config: Record<string, unknown>) => Promise<{
          summarize: (
            text: string,
            options?: { context?: string }
          ) => Promise<string>;
          ready?: Promise<void>;
          addEventListener?: (
            event: string,
            callback: (event: { loaded: number; total: number }) => void
          ) => void;
        }>;
      };
    };
  }
}

interface SummaryComponentProps {
  textInput: string;
  detectedLang: string;
}

export default function SummaryComponent({
  textInput,
  detectedLang,
}: SummaryComponentProps) {
  const [, setAIProcessor] = useState<null | {
    summarize: (
      text: string,
      options?: { context?: string }
    ) => Promise<string>;
  }>(null);

  const [generatedSummary, setGeneratedSummary] = useState("");
  const [totalWords, setTotalWords] = useState(0);
  const [isButtonVisible, setIsButtonVisible] = useState(false);

  useEffect(() => {
    if (!textInput || textInput.trim().length === 0 || detectedLang !== "en") {
      setTotalWords(0);
      setIsButtonVisible(false);
      return;
    }

    const wordCounter = textInput.trim().split(/\s+/).length;
    setTotalWords(wordCounter);
    setIsButtonVisible(wordCounter >= 150);
  }, [textInput, detectedLang]);

  const initiateSummarization = async () => {
    if (!textInput.trim()) {
      toast.error("No content available for summarization.");
      return;
    }

    if (typeof window === "undefined" || !window.ai?.summarizer) {
      toast.error("Summarization AI is not supported in this environment.");
      return;
    }

    try {
      const config = {
        sharedContext: "Scientific document analysis",
        type: "key-takeaways",
        format: "markdown",
        length: "medium",
      };

      const summarizationCapabilities =
        await window.ai.summarizer.capabilities();
      const summarizationAvailable = summarizationCapabilities.available;

      if (summarizationAvailable === "no") {
        toast.error("Insufficient space to download the summarizer model!");
        return;
      }

      let aiSummarizer;
      if (summarizationAvailable === "readily") {
        aiSummarizer = await window.ai.summarizer.create(config);
      } else if (summarizationAvailable === "after-download") {
        aiSummarizer = await window.ai.summarizer.create(config);
        aiSummarizer.addEventListener?.("downloadprogress", (event) => {
          console.log(
            `Downloading summarization model: ${event.loaded} / ${event.total} bytes.`
          );
        });

        await aiSummarizer?.ready;
      }

      if (!aiSummarizer) {
        toast.error("Failed to initialize summarizer.");
        return;
      }

      toast.success("Summarizer ready.");
      setAIProcessor(aiSummarizer);

      const summaryResult = await aiSummarizer.summarize(textInput, {
        context: "Make it brief and concise.",
      });

      console.log(summaryResult);
      setGeneratedSummary(summaryResult);
    } catch (error) {
      console.error("Error during summarization:", error);
      toast.error("Summarization failed.");
    }
  };

  return (
    <>
      {isButtonVisible && (
        <button
          onClick={initiateSummarization}
          className="text-[0.8rem] text-center border-2 border-white p-1 rounded-lg"
        >
          Generate Summary
          <p className="text-[10px] font-bold text-[var(--dark)]">{`Word Count: ${totalWords}`}</p>
        </button>
      )}
      <p>{generatedSummary}</p>
    </>
  );
}
