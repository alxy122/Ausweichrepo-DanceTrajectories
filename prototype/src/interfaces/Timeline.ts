import { Choreography, DanceFloor, Pattern } from "./Choreography";

export interface TimelineProps {
    choreo: Choreography;
    selectedPattern: number;
    setSelectedPattern:(pattern: number)=> void;
    setBarAndBeat: (patternId: number, newBar:number, newBeat:number, highestBarNumber: number)=> void;

    removePattern: (patternIdToRemove: number)=> void;

    gentlemanColor:string | number | readonly string[] | undefined;
    ladyColor:string | number | readonly string[] | undefined;
    coupleColor:string | number | readonly string[] | undefined;

    addIntermediatePattern: (bar: number, beat: number)=>void;
    editingModeActive: boolean;

    highestBarNumber: number;
    setHighestBarNumber: (newValue: number)=>void;

    timelineMapValues: number[];
    setTimelineMapValues: (newValue: number[])=>void;

    addNewBar: ()=>void;
}

export interface MiniPatternViewProps {
    danceFloor:DanceFloor;
    pattern: Pattern;

    gentlemanColor:string | number | readonly string[] | undefined;
    ladyColor:string | number | readonly string[] | undefined;
    coupleColor:string | number | readonly string[] | undefined;
}

export interface SetBarAndBeatModalProps {
    show: boolean;
    handleClose: () => void;

    selectedBarModal: number;
    setSelectedBarModal: (newValue: number)=>void;

    selectedBeatModal: number;
    setSelectedBeatModal: (newValue: number)=>void;

    highestBarNumber: number;

    setShowReassuranceModal: (newValue: boolean)=>void;
    applyModalValues: ()=>void;
}

export interface ReassuranceModalProps {
    showReassuranceModal: boolean;
    setShowReassuranceModal: (newValue: boolean)=>void;
    selectedPattern: number;
    removePattern: (patternIdToRemove: number)=> void;
}