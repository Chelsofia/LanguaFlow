"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    ai: any;
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
  const [, setAIProcessor] = useState(null);
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

    try {
      const config = {
        sharedContext: "Scientific document analysis",
        type: "key-takeaways",
        format: "markdown",
        length: "medium",
      };

      const summarizationCapabilities = await self.ai.summarizer.capabilities();
      const summarizationAvailable = summarizationCapabilities.available;

      if (summarizationAvailable === "no") {
        toast.error("Insufficient space to download the summarizer model!");
        return;
      }

      let aiSummarizer;
      if (summarizationAvailable === "readily") {
        aiSummarizer = await self.ai.summarizer.create(config);
      } else if (summarizationAvailable === "after-download") {
        aiSummarizer = await self.ai.summarizer.create(config);
        aiSummarizer.addEventListener(
          "downloadprogress",
          (event: { loaded: number; total: number }) => {
            console.log(
              `Downloading summarization model: ${event.loaded} / ${event.total} bytes.`
            );
          }
        );

        await aiSummarizer.ready;
      }

      toast.success("Summarizer ready.");
      setAIProcessor(aiSummarizer);
      const sampleText =
        "With non-streaming summarization, the model processes the input as a whole and then produces the output. To get a non-streaming summary, call the summarizer's asynchronous summarize() function. The first argument for the function is the text that you want to summarize. The second, optional argument is an object with a context field. This field lets you add background details that might improve the summarization.";
      const summaryResult = await aiSummarizer.summarize(sampleText, {
        context: "Make it brief and concise.",
      });
      console.log(summaryResult);
      setGeneratedSummary(summaryResult);
    } catch (error) {
      console.error("Error during summarization:", error);
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
