'use client'

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
  "Javanese"
];


const text = `In a quiet village nestled between two hills, there stood an ancient tree known as the Whispering Tree. The villagers believed that if you sat under it at sunset and whispered your worries, the tree would whisper back with advice.

One day, a curious boy named Aarav visited the tree. He sat beneath its branches and whispered,

    “I’m afraid of speaking in front of people. What if I forget my words?”

The leaves rustled gently, though there was no wind, and a soft whisper came:

    “Bravery is not the absence of fear, but speaking even when your voice shakes.”

Inspired, Aarav practiced every day. A week later, during the village festival, he stood before a crowd and told them the story of the Whispering Tree. His hands trembled, but his voice grew stronger with each word.

When he finished, the crowd cheered. And deep within the forest, the old tree stood still—silent, but proud.`



const Translate = ({ setUI }: { setUI: Dispatch<SetStateAction<boolean>> }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState()

  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      setUI(false)
    }

  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function onTranslating(language: string) {
    try {
      setLoading(true)


      if (!language) return


      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/translate`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          language: language
        })
      });

      const data = await res.json();
      setIsTranslated(true)


      setData(data.translation);
      setCurrentLanguage(data.language)

    } catch (err) {
      console.log(err);
      toast.error('Failed to translate.Try again')

    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={divRef} className="h-[70%] lg:w-1/3 w-[90%] rounded-2xl shadow bg-white z-50 overflow-auto overflow-x-clip shadow-gray-500 absolute m-auto  p-6 top-24 lg:left-1/3 left-6">
      <h1 className="text-xl underline font-bold">Translate To</h1>
      {!isTranslated && <div className=" h-1/2  w-full  border rounded-3xl opacity-90 text-center">
        {loading ? <div className="w-max h-max m-auto flex items-center gap-3"><p className="h-max">Translating</p><Spinner size={20} color="#85c9e4" /></div> :
          <p className="my-5 text-sm font-extralight ">Translation will appear here</p>
        }
      </div>}
      {isTranslated && !loading &&
        <div className="min-h-28 w-full p-5 border rounded-3xl opacity-90 my-4">
          <h1 className="font-medium my-2 ">Translation in {currentLanguage}</h1>
          {data}
        </div>}
      <select className="w-full border rounded p-2 m-3">
        {languages.map((language) => (
          <option onClick={() => onTranslating(language)} className="hover:bg-[#9edaf1] select-none text-sm cursor-pointer  p-1 rounded active:bg-[#90cce4]">{language}</option>
        ))}
      </select>
    </div>
  )
}

export default Translate