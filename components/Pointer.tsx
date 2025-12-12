import stringToColor from "@/lib/stringToColor";
import { motion } from "framer-motion";

export default function Pointer({
  info,
  x,
  y,
}: {
  info: { name: string; avatar?: string };
  x: number;
  y: number;
}) {
  const color = stringToColor(info.name || "Yadavji");
  return (
    <motion.div
      className="h-4 w-4 rounded-full absolute z-50"
      style={{ top: y, left: x, pointerEvents: "none" }}
      initial={{
        scale: 1,
        opacity: 1,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
    >
      <svg
        width="1em"
        height="1em"
        strokeWidth="1"
        stroke={color}
        viewBox="0 0 16 16"
        fill={color}
        className={`h-6 w-6 text-${color} transform -rotate-70 -translate-x-3 -translate-y-2.5 stroke-${color}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
      </svg>

      <motion.div
        style={{ backgroundColor: color }}
        initial={{
          scale: 0.5,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.5,
          opacity: 0,
        }}
        className="px-2 py-2 bg-neutral-200 text-black font-bold whitespace-nowrap min-w-max text-xs rounded-full"
      >
        {info.name || "Unknown"}
      </motion.div>
    </motion.div>
  );
}
