"use client";

import { useEffect, useState } from "react";

type Props = {
  saleEndsAt: string;
};

export const MegaSaleTimer = ({ saleEndsAt }: Props) => {
  const calculateTimeLeft = () => {
    const diff = +new Date(saleEndsAt) - +new Date();

    if (diff <= 0) return null;

    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / 1000 / 60) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <span className="text-xs text-red-400 font-semibold">
        Акція завершена
      </span>
    );
  }

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center bg-black/40 px-2 py-1 rounded-md min-w-[48px]">
      <span className="text-lg font-bold text-red-500 leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-2 mt-2">
      <Box value={time.d} label="дн" />
      <Box value={time.h} label="год" />
      <Box value={time.m} label="хв" />
      <Box value={time.s} label="сек" />
    </div>
  );
};
