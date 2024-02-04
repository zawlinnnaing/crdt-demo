import styles from "./ArtBoard.module.css";

const DEFAULT_USERS = ["alice", "bob"];

export default function ArtBoard() {
  return <div className={styles.container}>
    {DEFAULT_USERS.map()}
  </div>;
}
