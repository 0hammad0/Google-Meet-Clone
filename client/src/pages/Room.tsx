import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../context/RoomContext";
import { VideoPlayer } from "../components/VideoPlayer";
import { PeerState } from "../context/peersReducer";
import { ShareScreenButton } from "../components/ShareScreenButton";
import { VisibilityButton } from "../components/VisibilityButton";

const Room = () => {
  const { id } = useParams<{ id: string }>();
  const { ws, me, stream, peers, shareScreen, screenSharingId, setRoomId } = useContext(RoomContext);

  useEffect(() => {
    if (me) ws.emit("join-room", { roomId: id, peerId: me._id });
  }, [id, me, ws]);

  useEffect(() => {
    setRoomId(id);
  }, [id, setRoomId]);

  const [isVisible, setIsVisible] = useState(true);
  const handleVisibilityToggle = () => {
    setIsVisible(!isVisible);
  };

  const peerList = Object.values(peers as PeerState);
  const firstPeer = peerList[0];
  const otherPeers = peerList.slice(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = firstPeer.stream as MediaStream;
    }
  }, [firstPeer]);

  const screenSharingVideo = screenSharingId == me.id ? stream : peers[screenSharingId]?.stream;
  console.log({screenSharingVideo})

  return (
    <>
      <div>Room Id: {id}</div>
      <div className="fixed right-0 top-0 m-2 w-[250px] h-[250px] rounded-md z-10">
        <div
          className={`${!isVisible ? "opacity-0 hidden" : ""} transition-all`}
        >
          <VideoPlayer stream={stream} />
        </div>
        <div className="m-5 flex gap-5">
          <ShareScreenButton onClick={shareScreen} />
          <VisibilityButton onClick={handleVisibilityToggle} />
        </div>
      </div>

      {firstPeer && (
        <div className="fixed inset-0 z-0 w-full h-full">
          {/* <VideoPlayer key={firstPeer.peerId} stream={firstPeer.stream as MediaStream} /> */}
          <video
            key={firstPeer.peerId}
            ref={videoRef}
            autoPlay
            muted={true}
            className="rounded-md w-full h-full"
          ></video>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 flex justify-center gap-3 m-5">
        {otherPeers.map((peer) => (
          <div
            key={peer.peerId}
            className="w-20 h-20 rounded-full overflow-hidden"
          >
            <VideoPlayer stream={peer.stream as MediaStream} />
          </div>
        ))}
      </div>
    </>
  );
};

export default Room;
