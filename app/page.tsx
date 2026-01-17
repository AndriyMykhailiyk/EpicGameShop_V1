import Image from "next/image";
import Link from "next/link";
import { getSaleGames } from "@/lib/api/game";
import { Game } from "@/types/game";
import SaleGamesCarousel from "@/components/ui/carusel/SaleGamesCarousel";
import BestOffer from "@/components/ui/grid/BestOffer";
import { MegaSaleSection } from "@/components/MegaSale/MegaSaleSection";

export default function Home() {
  const saleGames: Game[] = getSaleGames();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "12px",
      }}
    >
      <style jsx>{`
        @media (min-width: 375px) {
          .container {
            padding: 16px;
          }
          .title {
            fontsize: 20px;
            marginbottom: 16px;
          }
          .spacer {
            height: 16px;
          }
        }

        @media (min-width: 640px) {
          .container {
            padding: 20px;
          }
          .title {
            fontsize: 24px;
            marginbottom: 20px;
          }
          .spacer {
            height: 20px;
          }
        }

        @media (min-width: 768px) {
          .container {
            padding: 24px;
          }
          .title {
            fontsize: 28px;
            marginbottom: 24px;
          }
          .spacer {
            height: 24px;
          }
        }

        @media (min-width: 1024px) {
          .container {
            padding: 32px;
          }
          .title {
            fontsize: 32px;
            marginbottom: 32px;
          }
          .spacer {
            height: 32px;
          }
        }
      `}</style>

      <div className="container">
        <h1
          className="title"
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "12px",
          }}
        >
          Найліпше у літньому розпродажі
        </h1>

        <div style={{ width: "100%", overflow: "hidden" }}>
          <SaleGamesCarousel games={saleGames} />
        </div>

        <div className="spacer" style={{ height: "16px" }} />

        <div style={{ width: "100%" }}>
          <BestOffer />
        </div>

        <div className="spacer" style={{ height: "16px" }} />

        <div style={{ width: "100%" }}>
          <MegaSaleSection />
        </div>

        <div style={{ height: "24px" }} />
      </div>
    </div>
  );
}
