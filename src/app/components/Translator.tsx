"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";

const availableLanguages = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "tr", label: "Turkish" },
  { code: "ru", label: "Russian" },
];

interface TranslatorProps {
  inputContent: string;
  detectedLang: string;
}

export default function Translator({
  inputContent,
  detectedLang,
}: TranslatorProps) {
  const [selectedLang, setSelectedLang] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setTranslationService] = useState(null);
  const [outputText, setOutputText] = useState("");
  const [outputLang, setOutputLang] = useState("");

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLang(e.target.value);
  };

  const executeTranslation = async () => {
    if (!inputContent.trim()) {
      toast.error("Please enter text to translate.", { duration: 3000 });
      return;
    }

    if (!detectedLang) {
      toast.error("No detected language available.");
      return;
    }
    if (!selectedLang) {
      toast.error("Please choose a target language.");
      return;
    }
    if (detectedLang === selectedLang) {
      toast.error("Source and target languages must be different.");
      return;
    }

    try {
      const translationCapabilities = await self.ai.translator.capabilities();
      const isLanguagePairSupported =
        translationCapabilities.languagePairAvailable(
          detectedLang,
          selectedLang
        );

      if (isLanguagePairSupported === "no") {
        toast.error("Translation not available for this language pair.");
        return;
      }

      let translator;
      if (isLanguagePairSupported === "readily") {
        translator = await self.ai.translator.create({
          sourceLanguage: detectedLang,
          targetLanguage: selectedLang,
        });
      } else if (isLanguagePairSupported === "after-download") {
        const loadingNotification = toast.loading(
          "Downloading language pack...",
          { duration: Infinity }
        );
        try {
          translator = await self.ai.translator.create({
            sourceLanguage: detectedLang,
            targetLanguage: selectedLang,
            monitor(m: any) {
              m.addEventListener("downloadprogress", (e: ProgressEvent) => {
                console.log(`Downloaded ${e.loaded} of ${e.total} bytes...`);
              });
            },
          });
          await translator.ready;
          toast.dismiss(loadingNotification);
          toast.success("Language pack downloaded!");
        } catch (error) {
          toast.dismiss(loadingNotification);
          toast.error("Download failed. Please try again.");
          return;
        }
      }

      setLoading(true);
      setTranslationService(translator);
      clearOutput();
      const translationResult = await translator.translate(inputContent);
      setLoading(false);
      setOutputLang(selectedLang);
      setOutputText(translationResult);
    } catch (error) {
      console.error("Translation error:", error, detectedLang, selectedLang);
      toast.error("Translation failed. Please try again.");
    }
  };

  const clearOutput = () => {
    setOutputText("");
  };

  return (
    <section className="w-full flex items-start gap-3">
      <section className="flex flex-col gap-2">
        <select
          onChange={handleLanguageChange}
          className="text-[0.8rem] w-full cursor-pointer border-2 border-black p-1 rounded-lg bg-transparent"
          defaultValue="Select Language"
        >
          <option className="text-black" hidden value="Select Language">
            Choose Language
          </option>
          {availableLanguages.map((lang) => (
            <option className="text-black" key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <button
          onClick={executeTranslation}
          className="text-[0.8rem] w-full whitespace-nowrap cursor-pointer text-center border-2 border-black p-1 rounded-lg"
        >
          Translate - {selectedLang}
        </button>

        {loading && <p className="text-[10px] text-center">Translating...</p>}
      </section>

      {outputText && (
        <section className="w-md max-w-sm">
          <p className="text-[10px] font-bold">Translation - {outputLang}</p>
          <section className="text-[1rem] bg-[#D62828] text-amber-200 font-bold border border-black p-2 flex flex-col gap-1 rounded-lg">
            <button
              onClick={clearOutput}
              className="text-[12px] text-white font-bold hover:font-extrabold"
            >
              Clear Translation
            </button>
            {outputText}
          </section>
        </section>
      )}
    </section>
  );
}
