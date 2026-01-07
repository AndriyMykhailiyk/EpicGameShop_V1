"use client";

import { useState } from "react";
import { sidebarNavItems } from "@/lib/data/sidebarNav";

export default function SidebarNav() {
  const [activeItem, setActiveItem] = useState("store");

  return (
    <nav className="sidebar-nav">
      <ul>
        {sidebarNavItems.map((item: any) => (
          <li key={item.id}>
            <button
              className={`nav-item ${activeItem === item.id ? "active" : ""}`}
              onClick={() => setActiveItem(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
