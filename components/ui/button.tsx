import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import React from 'react';

const Button = ({ onClick, color, text, logo, className, arrow }: {
  color?: string,
  text?: string,
  logo?: string | StaticImageData,
  className?: string,
  arrow: boolean,
  onClick?: () => void
}) => {
  return (
    <div
      onClick={onClick}
      className={cn("px-3 py-1 min-w-max  flex items-center gap-2 cursor-pointer active:scale-95 font-medium select-none rounded  shadow-[0_10px_20px_rgba(0,0,0,0.25)] transform transition duration-300 hover:translate-y-[-4px]   text-white", className)}
      style={{ backgroundColor: color }}
    >
      {logo && <Image src={logo} width={40} height={40} alt='logo' />}
      <p className='w-max'>{text}</p>
      {arrow && <ArrowRight size={20} />}
    </div>
  );
};

export default Button;
