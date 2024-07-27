import { useContext } from "react";
import { RoomContext } from "../context/RoomContext";

export const Join: React.FC = () => {
  const { ws } = useContext(RoomContext);

  const createRoom = () => {
    ws.emit("create-room");
  };

  return <button onClick={createRoom}>Start new meeting</button>;
};
