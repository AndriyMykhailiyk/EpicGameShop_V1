// components/GameDescription.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Gamepad2,
  Users,
} from "lucide-react";

interface GameDescriptionProps {
  description: string;
  title?: string;
  developer?: string;
  tags?: string[];
  platforms?: string[];
  rating?: number;
  estimatedPlayTime?: string;
  multiplayer?: boolean;
  maxHeight?: string;
  className?: string;
}

const GameDescription = ({
  description,
  title,
  developer,
  tags = [],
  platforms = [],
  rating,
  estimatedPlayTime,
  multiplayer,
  maxHeight = "300px",
  className = "",
}: GameDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const isOverflowing =
        contentRef.current.scrollHeight > parseInt(maxHeight);
      setIsTruncated(isOverflowing);
    }
  }, [description, maxHeight]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  const gradientVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl shadow-purple-900/10 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative elements */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-purple-600/20 to-cyan-500/20 rounded-full blur-xl" />
      <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 rounded-full blur-xl" />

      <div className="relative z-10 p-6">
        {/* Header with game info */}
        {(title || developer || rating) && (
          <motion.div
            className="mb-6 pb-4 border-b border-gray-700/50"
            variants={itemVariants}
          >
            {title && (
              <motion.h3
                className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2"
                variants={itemVariants}
              >
                {title}
              </motion.h3>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {developer && (
                <motion.div
                  className="flex items-center gap-1"
                  variants={itemVariants}
                >
                  <span className="text-gray-400">Розробник:</span>
                  <span className="font-medium text-cyan-300">{developer}</span>
                </motion.div>
              )}

              {estimatedPlayTime && (
                <motion.div
                  className="flex items-center gap-1"
                  variants={itemVariants}
                >
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>{estimatedPlayTime}</span>
                </motion.div>
              )}

              {multiplayer && (
                <motion.div
                  className="flex items-center gap-1"
                  variants={itemVariants}
                >
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Мультиплеєр</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 mb-6"
            variants={itemVariants}
          >
            {tags.map((tag, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-3 py-1 bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-purple-200 text-xs font-medium rounded-full border border-purple-700/30 hover:border-purple-500/50 transition-colors cursor-default"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Platforms */}
        {platforms.length > 0 && (
          <motion.div
            className="flex items-center gap-2 mb-6"
            variants={itemVariants}
          >
            <Gamepad2 className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-md"
                >
                  {platform}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Description with expand/collapse */}
        <div className="relative">
          <motion.div
            ref={contentRef}
            className={`overflow-hidden transition-all duration-500 ${
              isExpanded ? "" : "max-h-[300px]"
            }`}
            style={{
              maxHeight: isExpanded ? "none" : maxHeight,
            }}
          >
            <motion.div
              className="text-gray-200 leading-relaxed space-y-4"
              variants={itemVariants}
            >
              {description.split("\n").map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  className="text-[15px]"
                >
                  {paragraph}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>

          {/* Gradient fade effect when truncated */}
          <AnimatePresence>
            {isTruncated && !isExpanded && (
              <motion.div
                variants={gradientVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900/90 to-transparent pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Expand/Collapse button */}
        {isTruncated && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 text-gray-300 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                <span className="group-hover:text-cyan-300 transition-colors">
                  Згорнути опис
                </span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
                <span className="group-hover:text-purple-300 transition-colors">
                  Розгорнути повний опис
                </span>
              </>
            )}
          </motion.button>
        )}

        {/* Recommendation section */}
        <motion.div
          className="mt-6 pt-6 border-t border-gray-700/50"
          variants={itemVariants}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 rounded-lg">
              <Star className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-300 mb-1">
                Наша рекомендація
              </h4>
              <p className="text-sm text-gray-300">
                Ця гра варта уваги якщо ви шукаєте{" "}
                {description.includes("шутер")
                  ? "динамічний шутер"
                  : description.includes("RPG")
                    ? "глибоку рольову гру"
                    : description.includes("пригода")
                      ? "захоплюючу пригоду"
                      : "унікальний ігровий досвід"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GameDescription;
