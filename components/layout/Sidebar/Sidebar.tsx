import SidebarNav from "./SidebarNav";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Головна навігація магазину">
      <SidebarNav />
    </aside>
  );
}
