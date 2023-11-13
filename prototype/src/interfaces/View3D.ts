import { Choreography, Pose } from "./Choreography";

export interface View3DProps {
    choreo: Choreography;
    selectedPattern: number;

    selectedDancerOption: number;
    setSelectedDancerOption: (newValue: number) => void;

    show3DView: boolean;

    patternRotation: "Front"|"Back"|"Left"|"Right";
}

export interface PoseViewProps {
    choreo: Choreography;

    savedPoses:Pose[];
    selectedPattern: number;
    addStandardPose: (newStandardPose:Pose)=>void;
    changeDancerPose: (patternId: number, dancerId: number, pose: Pose)=>void;

    show3DView: boolean;

    selectedDancerOption: number;
}