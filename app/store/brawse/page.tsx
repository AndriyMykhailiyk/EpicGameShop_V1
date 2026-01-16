import React from "react";
import Link from "next/link";

export default function BrowsePage() {
  return (
    <main style={{ padding: "20px" }}>
      <h1>Browse Store</h1>

      <ul>
        <li>
          <Link href="/store/brawse/action">Action</Link>
        </li>
        <li>
          <Link href="/store/brawse/rpg">RPG</Link>
        </li>
        <li>
          <Link href="/store/brawse/strategy">Strategy</Link>
        </li>
      </ul>
    </main>
  );
}
