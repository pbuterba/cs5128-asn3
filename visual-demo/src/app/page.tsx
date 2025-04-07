import Coral from "./components/coral";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <Coral width={600} height={600}/>
    </div>
  );
}
