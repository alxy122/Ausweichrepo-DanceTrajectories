export interface VideoProps {
    videoSrc: string;
    videoRef: React.RefObject<HTMLVideoElement>;
    onTimeUpdate: (time: number) => void;
    isPaused: boolean;
    trajectoryData:number[][][];
  }

