import React from "react";
import Button from "react-bootstrap/Button";
import { PlayFill, PauseFill } from "react-bootstrap-icons";

interface PauseButtonProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
}

const PauseButton: React.FC<PauseButtonProps> = ({
  videoRef,
  isPaused,
  setIsPaused,
}) => {
  const togglePause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  return (
    <Button variant="dark" onClick={togglePause}>
      {isPaused ? <PlayFill /> : <PauseFill />}
    </Button>
  );
};

export default PauseButton;
