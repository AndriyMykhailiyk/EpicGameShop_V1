"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "./SidebarCss/SidebarNav.module.css";

import { useState } from "react";
import { sidebarNavItems } from "@/lib/data/sidebarNav";

export default function SidebarNav() {
  const [activeItem, setActiveItem] = useState("store");

  return (
    <nav className="sidebar-nav">
      <div className={styles.sidebarLogo}>
        <Image
          src="https://img.icons8.com/plasticine/100/epic-games.png"
          alt="Epic Games"
          width={60}
          height={60}
          priority
        />
      </div>

      <ul>
        {sidebarNavItems.map((item: any) => (
          <li key={item.id}>
            <Link href={item.href}>
              <button
                className={styles.btnClick}
                onClick={() => setActiveItem(item.id)}
              >
                <div className={styles.btnClickwrap}>
                  {" "}
                  <span className={styles.btnClickIcon}>{item.icon}</span>
                  <span className={styles.btnClickText}>{item.label}</span>
                </div>
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
