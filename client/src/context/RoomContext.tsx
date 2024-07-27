import Peer from "peerjs";
import { createContext, useEffect, ReactNode, useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { v4 as uuidV4 } from "uuid";
import { peersReducer } from "./peersReducer";
import { addPeerStreamAction, removePeerStreamAction } from "./peersActions";
const WS = "http://localhost:8008";

export const RoomContext = createContext<null | any>(null);

const ws = socketIOClient(WS);

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FunctionComponent<RoomProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [me, setMe] = useState<Peer>();
  const [stream, setStream] = useState<MediaStream>();
  const [peers, dispatch] = useReducer(peersReducer, {});
  const [screenSharingId, setScreenSharingId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const enterRoom = ({ roomId }: { roomId: "string" }) => {
    const meId = uuidV4();  
    const peer = new Peer(meId);
    setMe(peer);
    navigate(`/room/${roomId}`);
  };

  const getUsers = ({ participants }: { participants: string[] }) => {
    console.log({ participants });
  };

  const removePeer = (peerId: string) => {
    dispatch(removePeerStreamAction(peerId));
  }

  const SetMediaStream = async () => {
    try {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setStream(stream);
      });
    } catch (error) {
      console.log(error);
    }
  }
  
  const switchStream = (stream: MediaStream) => {
    setStream(stream);
    setScreenSharingId(me?.id || "");

    Object.values(me?.connections).forEach((connection: any) => {
      const videoTrack = stream?.getTracks().find((track) => track.kind === "video");
  
      connection[0].peerConnection.getSenders()[1].replaceTrack(videoTrack).catch((error: any) => console.log(error));
    });
  };
  
  const shareScreen = async () => {
    try {
      if (screenSharingId) {
        navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        }).then(switchStream);
      } else {
        navigator.mediaDevices.getDisplayMedia({
          audio: false,
        }).then(switchStream);
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  useEffect(() => {
    const meId = uuidV4();
    const peer = new Peer(meId);
    setMe(peer);

    SetMediaStream();

    ws.on("room-created", enterRoom);
    ws.on("get-users", getUsers);
    ws.on("user-disconnected", removePeer)
    ws.on("user-disconnected", removePeer)
    ws.on("user-shared-screen", (peerId) => setScreenSharingId(peerId));
    ws.on("user-stopped-screen", () => setScreenSharingId(""));

    return () => {
      ws.off("room-created", enterRoom);
      ws.off("get-users", getUsers);
      ws.off("user-disconnected", removePeer)
      ws.off("user-shared-screen")
      ws.off("user-stopped-screen")
      ws.off("user-joined")
    }
  }, []);

  useEffect(() => {
    if (screenSharingId) {
      ws.emit("start-sharing", {peerId: screenSharingId, roomId});
    } else {
      ws.emit("stop-sharing")
    }
  }, [screenSharingId, roomId]);

  useEffect(() => {
    if (!me) return;
    if (!stream) return;
    ws.on("user-joined", ({ peerId }) => {
        const call = me.call(peerId, stream, {
            // metadata: {
            //     userName,
            // },
        });
        call.on("stream", (peerStream) => {
            dispatch(addPeerStreamAction(peerId, peerStream));
        });
        // dispatch(addPeerNameAction(peerId, name));
    });

    me.on("call", (call) => {
        // const { userName } = call.metadata;
        // dispatch(addPeerNameAction(call.peer, userName));
        call.answer(stream);
        call.on("stream", (peerStream) => {
            dispatch(addPeerStreamAction(call.peer, peerStream));
        });
    });

    return () => {
        ws.off("user-joined");
    };
}, [me, stream]);

  return (
    <RoomContext.Provider value={{ ws, me, stream, peers, shareScreen, screenSharingId, setRoomId }}>{children}</RoomContext.Provider>
  );
};
