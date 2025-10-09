"use client";

import { Heading1, Heading2, Heading3, List, ListOrdered, Image, Video, Music, Code, Book } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { Block, BlockType } from "@/types/editorType";
import URLBox from "./URLBox";

const InputBlock = ({ onAddBlock }: { onAddBlock?: (type: BlockType) => void }) => {
  const [showCommands, setShowCommands] = useState(false);
  const [block, setBlock] = useState<Block>({ content: '' });
  const [fileValue, setFileValue] = useState<File | string>()
  const contentRef = useRef<HTMLDivElement>(null);
  const [blockType, setBlockType] = useState<BlockType>("text");
  const [onImageClick, setOnImageClick] = useState(false);
  const [onVideoClick, setOnVideoClick] = useState(false);
  const [onAudioClick, setOnAudioClick] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight: hljs }),
    ],
    content: `<p>Start writing...</p>`
  });

  const handleClickOutside = (event: MouseEvent) => {
    if (imageRef.current && !imageRef.current.contains(event.target as Node)) {
      setOnImageClick(false)
    }
    if (videoRef.current && !videoRef.current.contains(event.target as Node)) {
      setOnVideoClick(false)
    }
    if (audioRef.current && !audioRef.current.contains(event.target as Node)) {
      setOnAudioClick(false)
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInput = () => {
    const text = contentRef.current?.innerText || "";
    setBlock((prev) => ({ ...prev, content: text }));
    setShowCommands(text.startsWith("/"));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setBlock({ id: Date.now().toString(), content: '', type: blockType });
      setShowCommands(false);
      onAddBlock?.(blockType);
    }
  };

  const handleCommandSelect = (type: BlockType) => {
    setShowCommands(false);
    setBlockType(type);
    onAddBlock?.(type);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: BlockType) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setBlock((prev) => ({ ...prev, content: url }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative flex flex-col gap-2 h-auto items-start group p-1 rounded-lg bg-gray-50 w-full">
      {blockType === "text" && (
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="max-w-full w-full break-words text-gray-700 outline-none min-h-[30px] p-1 bg-transparent focus:border-gray-300 rounded-md"
        >
          {block?.content === "" && (
            <span
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              onClick={() => contentRef.current?.focus()}
            >
              Press '/' for commands...
            </span>
          )}
        </div>
      )}

      {blockType === "code" && (
        <div className="w-full border rounded-md p-2 bg-black text-white">
          <EditorContent editor={editor} />
        </div>
      )}

      {["heading1", "heading2", "heading3"].includes(blockType) && (
        <div
          contentEditable
          className={`text-${blockType === 'heading1' ? '3xl' : blockType === 'heading2' ? '2xl' : 'xl'} font-bold w-full outline-none`}
        >
          {blockType.replace("heading", "Heading ")}
        </div>
      )}

      {blockType === "bullet_list" && (
        <ul className="list-disc pl-11 w-full">
          <li contentEditable className="outline-none"></li>
        </ul>
      )}

      {blockType === "number_list" && (
        <ol className="list-decimal pl-11 w-full">
          <li contentEditable className="outline-none"></li>
        </ol>
      )}

      {["image", "video", "audio"].includes(blockType) && (
        <div className="w-full flex items-center justify-center relative">
          <label
            onClick={() => {
              if (blockType === "image") setOnImageClick((prev) => !prev);
              if (blockType === "video") setOnVideoClick((prev) => !prev);
              if (blockType === "audio") setOnAudioClick((prev) => !prev);
            }}
            htmlFor={`${blockType}-upload`}
            className="cursor-pointer text-blue-500"
          >
            {blockType === "image" ? "📷 Add Image" : blockType === "video" ? "🎥 Upload Video" : "🎵 Upload Audio"}
          </label>
          {blockType === "image" && onImageClick && <URLBox ref={imageRef} accept={`${blockType}/*`} setValue={setFileValue} isEmoji={false} isLink={true} setObjectClick={setOnImageClick} className="absolute top-10 right-20" />}
          {blockType === "video" && onVideoClick && <URLBox ref={videoRef} accept={`${blockType}/*`} setValue={setFileValue} isEmoji={false} isLink={true} setObjectClick={setOnVideoClick} className="absolute top-10 right-20" />}
          {blockType === "audio" && onAudioClick && <URLBox ref={audioRef} accept={`${blockType}/*`} setValue={setFileValue} isEmoji={false} isLink={true} setObjectClick={setOnAudioClick} className="absolute top-10 right-20" />}
        </div>
      )}

      {blockType === "page" && (
        <div className="w-full p-4 border rounded-md bg-gray-100 text-center">📝 New Page Block</div>
      )}

      {showCommands && (
        <div className="absolute top-10 left-0 bg-white border rounded-md shadow-lg z-10">
          <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleCommandSelect("heading1")}>
            <Heading1 className="inline-block mr-2" /> Heading 1
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleCommandSelect("heading2")}>
            <Heading2 className="inline-block mr-2" /> Heading 2
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleCommandSelect("heading3")}>
            <Heading3 className="inline-block mr-2" /> Heading 3
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleCommandSelect("bullet_list")}>
            <List className="inline-block mr-2" /> Bullet List
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleCommandSelect("number_list")}>
            <ListOrdered className="inline-block mr-2" /> Numbered List
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleCommandSelect("image")}>
            <Image className="inline-block mr-2" /> Image
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleCommandSelect("video")}>
            <Video className="inline-block mr-2" /> Video
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleCommandSelect("audio")}>
            <Music className="inline-block mr-2" /> Audio
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleCommandSelect("code")}>
            <Code className="inline-block mr-2" /> Code
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleCommandSelect("page")}>
            <Book className="inline-block mr-2" /> Page
          </div>
        </div>
      )}
    </div>
  );
};

export default InputBlock;