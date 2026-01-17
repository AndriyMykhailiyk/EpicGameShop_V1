"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Game } from "@/types/game";
import styles from "./SaleGamesCarousel.module.css";

type Props = {
  games: Game[];
};

export default function SaleGamesCarousel({ games }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [slidesToScroll, setSlidesToScroll] = useState(2);

  // Визначаємо розмір екрану
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      if (width < 480) {
        setSlidesToScroll(1);
      } else if (width < 768) {
        setSlidesToScroll(1);
      } else if (width < 1024) {
        setSlidesToScroll(2);
      } else {
        setSlidesToScroll(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll,
    align: "start",
    loop: false,
  });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {/* Кнопки */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          justifyContent: isMobile ? "center" : "flex-start",
        }}
      >
        <button
          onClick={scrollPrev}
          style={{
            padding: isMobile ? "8px 16px" : "10px 20px",
            fontSize: isMobile ? "18px" : "24px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            cursor: "pointer",
            transition: "all 0.2s",
            minWidth: isMobile ? "40px" : "50px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          ←
        </button>
        <button
          onClick={scrollNext}
          style={{
            padding: isMobile ? "8px 16px" : "10px 20px",
            fontSize: isMobile ? "18px" : "24px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            cursor: "pointer",
            transition: "all 0.2s",
            minWidth: isMobile ? "40px" : "50px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          →
        </button>
      </div>

      {/* Карусель */}
      <div
        ref={emblaRef}
        style={{
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: isMobile ? "12px" : "16px",
          }}
        >
          {games.map((game) => (
            <div
              key={game.id}
              style={{
                flex: isMobile ? "0 0 100%" : "0 0 calc(50% - 8px)",
                minWidth: 0,
              }}
            >
              <style jsx>{`
                @media (min-width: 480px) {
                  .game-item {
                    flex: 0 0 calc(50% - 8px) !important;
                  }
                }
                @media (min-width: 768px) {
                  .game-item {
                    flex: 0 0 calc(33.333% - 12px) !important;
                  }
                }
                @media (min-width: 1024px) {
                  .game-item {
                    flex: 0 0 calc(25% - 12px) !important;
                  }
                }
                @media (min-width: 1280px) {
                  .game-item {
                    flex: 0 0 calc(20% - 12px) !important;
                  }
                }
              `}</style>

              <Link
                href={`/store/p/${game.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column", // Завжди вертикальний layout
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    height: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(0, 0, 0, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Зображення - завжди зверху на всю ширину */}
                  <div
                    style={{
                      width: "100%",
                      height: isMobile ? "250px" : "300px", // Більше на мобілках
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={game.imageUrl}
                      alt={game.title}
                      fill
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  {/* Інформація про гру - завжди знизу */}
                  <div
                    style={{
                      padding: isMobile ? "16px" : "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      flex: 1,
                      gap: "12px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: isMobile ? "11px" : "12px",
                          color: "rgba(255, 255, 255, 0.6)",
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Основна гра
                      </p>
                      <h2
                        style={{
                          fontSize: isMobile ? "16px" : "18px",
                          fontWeight: "600",
                          color: "white",
                          marginBottom: "0",
                          lineHeight: "1.4",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          minHeight: isMobile ? "44px" : "50px",
                        }}
                      >
                        {game.title}
                      </h2>
                    </div>

                    {/* Знижка та ціна */}
                    <div
                      style={{
                        marginTop: "auto",
                      }}
                    >
                      {game.discount && (
                        <div
                          style={{
                            display: "inline-block",
                            background: "#0078f2",
                            padding: isMobile ? "6px 12px" : "6px 14px",
                            borderRadius: "4px",
                            fontSize: isMobile ? "14px" : "16px",
                            fontWeight: "bold",
                            color: "white",
                            marginBottom: "12px",
                          }}
                        >
                          -{game.discount}%
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: isMobile ? "14px" : "16px",
                            color: "rgba(255, 255, 255, 0.5)",
                            textDecoration: "line-through",
                          }}
                        >
                          {game.originalPrice}
                        </span>
                        <span
                          style={{
                            fontSize: isMobile ? "20px" : "22px",
                            fontWeight: "bold",
                            color: "white",
                          }}
                        >
                          {game.discountedPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
