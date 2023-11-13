import { Choreography, ConvexHull, DiscreteHeatmap, Pattern, Polyline } from "./Choreography";

export interface DanceFloorVisProps {
    choreo : Choreography;
    selectedPattern: number;
    gentlemanColor:string | number | readonly string[] | undefined;
    ladyColor:string | number | readonly string[] | undefined;
    coupleColor:string | number | readonly string[] | undefined;
    transitionColorScheme: string;
   
    showTransitions:boolean;
    showOrientations:boolean;

    showShapes: boolean;
    addShape:(patternId: number, newShape: ConvexHull)=>void;
    removeShape:(patternId: number, shapeIdToRemove: number)=>void;

    showHeatmap:boolean;
    discreteHeatmapEnabled: boolean;
    discreteHeatmap:DiscreteHeatmap;
    highestFrequency: number;


    fineGridEnabled: boolean;
    gridDragEnabled:boolean;
    editingModeActive: boolean;
    animationSpeed: number;
    patternRotation: "Front"|"Back"|"Left"|"Right";
    currentlyInAnimation: boolean;

    hoveredDancer: number;
    setHoveredDancer:(hoveredDancer: number)=>void;

    moveDancer: (patternId: number, dancerId: number, newX: number, newY: number) => void;
    rotateDancerBody: (patternId: number, dancerId: number, newOrientation: number) => void;
    rotateDancerHead: (patternId: number, dancerId: number, newOrientation: number) => void;
    separateDanceCouple: (patternId: number, dancerId: number) => void;
    joinDanceCouple: (patternId: number, dancerId: number) => void;

    moveDancerInIntermediatePattern: (patternId: number, intermediatePatternId: number, dancerId: number,newX: number, newY: number) => void;
    
    setSelectedHeatmapTile: (newTile: {x: number, y: number}) => void;
    selectedHeatmapTile: {x:number, y:number};

    addPatternToDraft: (patternNameInDraft:string, pattern:Pattern)=>void;

    setBrushCopy: (param: number[])=>void;
    setCopyOfFirstDancer: (param: number)=>void;
}