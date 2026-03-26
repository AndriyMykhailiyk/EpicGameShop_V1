"use client";

import React from "react";

interface RequirementRow {
  label: string;
  value: string;
}

const requirements: RequirementRow[] = [
  { label: "OS version", value: "Win10 64-bits" },
  { label: "CPU", value: "Intel i5-8400 or AMD Ryzen5 1500X" },
  { label: "Memory", value: "8 GB RAM" },
  { label: "GPU", value: "Nvidia GTX1050Ti 4GB or AMD RX580 4GB" },
  { label: "DirectX", value: "DirectX 12" },
  { label: "Storage", value: "20 GB" },
  { label: "Additional input device", value: "Gamepad" },
];

export default function System_requirements() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-0">
      <div className="pt-12 sm:pt-16 md:pt-20">
        <div className="w-full md:w-4/5 lg:max-w-[80%] bg-[#2a2a2a] rounded-lg overflow-hidden">
          <div className="bg-[#333] px-4 py-4 sm:px-6 sm:py-5 md:px-10">
            <h3 className="m-0 text-base sm:text-lg font-bold text-white border-b-[3px] border-[#26baff] pb-2.5 inline-block">
              Рекомендовані системні вимоги
            </h3>
          </div>

          <div className="p-4 sm:p-6 md:p-10">
            <h3 className="m-0 mb-4 sm:mb-5 text-base sm:text-lg text-[#ccc] font-semibold">
              Minimax
            </h3>

            {requirements.map((req, index) => (
              <div
                key={req.label}
                className={`flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-3 sm:py-3.5 ${
                  index < requirements.length - 1 ? "border-b border-[#444]" : ""
                }`}
              >
                <span className="text-[#aaa] text-sm font-medium sm:flex-1">
                  {req.label}
                </span>
                <span className="text-white text-sm font-medium sm:text-right sm:flex-1">
                  {req.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
