import { useEffect, useRef } from "react";

export const VideoPlayer: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <div>
      <video ref={videoRef} autoPlay muted={true} className="rounded-md max-h-[50vh] max-w-[100%]"></video>
    </div>
  );
};
