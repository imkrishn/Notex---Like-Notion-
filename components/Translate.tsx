"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Spinner from "./Spinner";

const languages = [
  "Mandarin Chinese",
  "Spanish",
  "English",
  "Hindi",
  "Bengali",
  "Portuguese",
  "Russian",
  "Japanese",
  "Western Punjabi",
  "Marathi",
  "Telugu",
  "Wu Chinese (Shanghainese)",
  "Turkish",
  "Korean",
  "French",
  "German",
  "Vietnamese",
  "Tamil",
  "Yue Chinese (Cantonese)",
  "Urdu",
  "Javanese",
];

const text = `In a quiet village nestled between two hills, there stood an ancient tree known as the Whispering Tree. The villagers believed that if you sat under it at sunset and whispered your worries, the tree would whisper back with advice.

One day, a curious boy named Aarav visited the tree. He sat beneath its branches and whispered,

“I’m afraid of speaking in front of people. What if I forget my words?”

The leaves rustled gently, though there was no wind, and a soft whisper came:

“Bravery is not the absence of fear, but speaking even when your voice shakes.”

Inspired, Aarav practiced every day. A week later, during the village festival, he stood before a crowd and told them the story of the Whispering Tree. His hands trembled, but his voice grew stronger with each word.

When he finished, the crowd cheered. And deep within the forest, the old tree stood still—silent, but proud.`;

const Translate = ({ setUI }: { setUI: Dispatch<SetStateAction<boolean>> }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string | undefined>(
    undefined
  );

  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      setUI(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function onTranslating(language: string) {
    try {
      setLoading(true);
      if (!language) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      const data = await res.json();
      setIsTranslated(true);
      setData(data.translation);
      setCurrentLanguage(data.language);
    } catch (err) {
      console.error(err);
      toast.error("Failed to translate. Try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={divRef}
      className="fixed z-50 lg:left-1/2 left-4 top-24 transform -translate-x-1/2
      bg-(--color-base-100) border border-(--color-base-300)
      text-(--color-base-content)
      shadow-lg rounded-2xl p-6 w-[90%] lg:w-1/3 h-[70%] overflow-y-auto
      backdrop-blur-xl transition-all duration-300"
    >
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-4 decoration-(--color-primary)">
        🌍 Translate To
      </h1>

      {/* Translation output area */}
      {!isTranslated && (
        <div
          className="h-1/2 border border-(--color-base-300)
          rounded-xl flex flex-col justify-center items-center
          bg-(--color-base-200)/70 text-(--color-neutral-content-light)
          transition-all duration-300"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <p>Translating...</p>
              <Spinner size={20} color="var(--color-primary)" />
            </div>
          ) : (
            <p className="text-sm italic">Translation will appear here ✨</p>
          )}
        </div>
      )}

      {isTranslated && !loading && (
        <div
          className="min-h-28 border border-(--color-base-300)
          rounded-xl mt-4 p-5 bg-(--color-base-200)
          shadow-inner transition-all duration-300"
        >
          <h1 className="font-medium text-(--color-primary) mb-2">
            Translation in {currentLanguage}
          </h1>
          <p className="leading-relaxed">{data}</p>
        </div>
      )}

      <div className="mt-6">
        <label className="block text-sm mb-2 font-medium text-(--color-neutral-content-light)">
          Choose Language
        </label>
        <select
          onChange={(e) => onTranslating(e.target.value)}
          className="w-full bg-(--color-base-200) border border-(--color-base-300)
          text-(--color-base-content) rounded-lg p-2
          focus:outline-none focus:ring-2 focus:ring-(--color-primary)
          cursor-pointer transition-all duration-200"
        >
          <option value="">Select...</option>
          {languages.map((language) => (
            <option
              key={language}
              value={language}
              className="bg-(--color-base-100) text-(--color-base-content)"
            >
              {language}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Translate;
