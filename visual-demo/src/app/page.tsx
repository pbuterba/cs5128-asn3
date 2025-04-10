import Coral from "./components/coral";
import styles from "./page.module.css";

export default function Home() {
  // Coral needs prop for number of branches (categories) and the actual features (get json format from NLP team and make class)
  // goal is to take in actual feature data and make a function that sets up the graph like in Coral in coral.tsx
  return (
    <div className={styles.page}>
      <Coral width={600} height={600}/>
    </div>
  );
}
