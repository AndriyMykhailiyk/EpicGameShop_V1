import SidebarNav from "./SidebarNav";
import styles from "./SidebarCss/SidebarNav.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <SidebarNav />
    </aside>
  );
}
