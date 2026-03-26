import SidebarNav from "./SidebarNav";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Головна навігація магазину">
      {onClose && (
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Закрити меню"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
      <SidebarNav />
    </aside>
  );
}
