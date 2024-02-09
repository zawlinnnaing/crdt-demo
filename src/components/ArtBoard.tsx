import { useState } from "react";
import { PixelCRDT } from "../crdt/PixelCRDT";
import styles from "./ArtBoard.module.css";
import PixelEditor from "./PixelEditor";

const DEFAULT_USERS = ["alice", "bob"];

export default function ArtBoard() {
  const [state, setState] = useState<PixelCRDT["state"]>({});

  const handleStateChange = (incomingState: PixelCRDT["state"]) => {
    setState(incomingState);
  };

  return (
    <div className={styles.container}>
      {DEFAULT_USERS.map((user) => {
        return (
          <PixelEditor
            key={user}
            id={user}
            name={user}
            onStateChange={handleStateChange}
            state={state}
          />
        );
      })}
    </div>
  );
}
