export interface TimeLineProps {
    width: number;
    height: number;
    radius: number;
    padding: number;
    currentTime: number;
    onTimeChange: (newTime: number) => void;
    videoRef: React.RefObject<HTMLVideoElement>;
    isPaused: boolean;
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
    videoLength: number;
    transformedTrajectoryData: number[][][];
    formationData: number[][][];
    selectedDancer: number[];
  }