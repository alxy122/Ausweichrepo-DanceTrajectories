import { useEffect, useRef } from "react";
import "../Styles/player.css";
import { VideoProps } from "../interfaces/VideoProps";

function Player(props: VideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = props.videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.addEventListener("click", function (event) {
      console.log(
        event.x - canvas?.getBoundingClientRect().x,
        event.y - canvas?.getBoundingClientRect().y
      );
    });

    const ctx = canvas.getContext("2d");

    const drawFrame = () => {
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.rect(50, 50, 200, 100); // (x, y, width, height)
      ctx.fillStyle = "blue";
      ctx.fill();

      if (!props.isPaused) {
        requestAnimationFrame(drawFrame);
      }
    };

    video.addEventListener("timeupdate", () => {
      props.onTimeUpdate(video.currentTime);
    });
  }, [!props.isPaused]);

  const handleVideoLoadedData = () => {
    if (props.videoRef.current) {
      const duration = props.videoRef.current.duration;
      console.log(`Video duration: ${duration} seconds`);
    }
  };

  return (
    <div className="video-container">
      <video
        className="video-element"
        ref={props.videoRef}
        onLoadedData={handleVideoLoadedData}
      >
        <source src={props.videoSrc} type="video/mp4" />
      </video>
      <canvas className="canvas-overlay" ref={canvasRef} />
    </div>
  );
}

export default Player;
