// components/BestOffer/BestOffer.tsx
import Image from "next/image";
import styles from "./Styles/BestOffer.module.css";

const offers = [
  {
    id: 1,
    title: "Relicbound",
    image: "/bunnersAction/relicbound-1tak1.jpg",
    oldPrice: "220 грн.",
    newPrice: "88 грн.",
    discount: "-60%",
  },
  {
    id: 2,
    title: "Slender: The Arrival",
    image: "/bunnersAction/slender.jpeg",
    oldPrice: "369 грн.",
    newPrice: "147,60 грн.",
    discount: "-60%",
  },
  {
    id: 3,
    title: "Outlast",
    image: "/bunnersAction/starwarsss.png",
    oldPrice: "499 грн.",
    newPrice: "199 грн.",
    discount: "-60%",
  },
];

export default function BestOffer() {
  return (
    <section className={styles.container}>
      {offers.map((game) => (
        <div key={game.id} className={styles.card}>
          <div className={styles.imageWrapper}>
            <Image
              src={game.image}
              alt={game.title}
              className={styles.image}
              width={450}
              height={230}
            />
            <span className={styles.weekOffer}>Пропозиція тижня</span>
          </div>

          <div className={styles.blackInfo}>
            <h2 className={styles.title}>{game.title}</h2>
            <br />
            <div className={styles.priceBlock}>
              <span className={styles.discount}>{game.discount}</span>
              <span className={styles.oldPrice}>{game.oldPrice}</span>
              <span className={styles.newPrice}>{game.newPrice}</span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
