import { ScaleLinear } from 'd3-scale';
import { DanceFloor, Pattern, DancerRole, Position, DanceCouple, DiscreteHeatmap, Choreography, Polyline, ConvexHull } from './Choreography';

export interface PatternViewProps {
  danceFloor: DanceFloor;

  selectedPattern: number;
  pattern: Pattern;
  
  previousPattern: Pattern;
  hasPreviousPattern: boolean;

  gentlemanColor:string | number | readonly string[] | undefined;
  ladyColor:string | number | readonly string[] | undefined;
  coupleColor:string | number | readonly string[] | undefined;
  transitionColorScheme: string;

  showTransitions:boolean;
  showOrientations: boolean;

  showShapes: boolean;
  addShape:(patternId: number, newShape: ConvexHull)=>void;
  removeShape:(patternId: number, shapeIdToRemove: number)=>void;

  showHeatmap: boolean;
  discreteHeatmapEnabled: boolean;
  discreteHeatmap: DiscreteHeatmap;
  highestFrequency: number;

  animationSpeed:number;
  currentlyInAnimation: boolean;

  fineGridEnabled: boolean;
  gridDragEnabled: boolean;
  editingModeActive: boolean;
  patternRotation: "Front"|"Back"|"Left"|"Right";

  hoveredDancer: number;
  setHoveredDancer: (newHoveredDancer: number) => void;

  moveDancer: (patternId: number, dancerId: number, newX: number, newY: number) => void;
  separateDanceCouple: (patternId: number, dancerId: number) => void;
  joinDanceCouple: (patternId: number, dancerId: number) => void;


  rotateDancerBody: (patternId: number, dancerId: number, newOrientation: number) => void;
  rotateDancerHead: (patternId: number, dancerId: number, newOrientation: number) => void;

  moveDancerInIntermediatePattern: (patternId: number, intermediatePatternId: number, dancerId: number,newX: number, newY: number) => void;
  setSelectedHeatmapTile: (newTile: {x: number, y: number}) => void;

  selectedHeatmapTile: {x:number, y:number};
  
  addPatternToDraft: (patternNameInDraft:string, pattern:Pattern)=>void;

  setBrushCopy: (param: number[])=>void;
  setCopyOfFirstDancer: (param: number)=>void;
}

export interface PatternBackgroundProps {
  dms: any;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  height: number;
  width: number;

  hoveredDancer: number;

  positions: DanceCouple[];

  fineGridEnabled: boolean;

  showHeatmap: boolean;
  discreteHeatmapEnabled: boolean;

  draggedDancer: number;
  draggedDancerPosition: {x:number, y:number};

  patternRotation: "Front"|"Back"|"Left"|"Right";
  selectedHeatmapTile: {x:number, y:number};
}

export interface AxisProps {
  dms: any;
  scale: ScaleLinear<number, number>;

  selectedDancer: number;

  positions: DanceCouple[];

  draggedDancer: number;
  draggedDancerPosition: {x:number, y:number};

  showHeatmap: boolean;
  discreteHeatmapEnabled: boolean;

  patternRotation: "Front"|"Back"|"Left"|"Right";
  selectedHeatmapTile: {x:number, y:number};
}

export interface GridProps {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;

  selectedDancer: number;
  positions: DanceCouple[];

  fineGridEnabled: boolean;
  showHeatmap: boolean;

  draggedDancerPosition: {x:number, y:number};

  patternRotation: "Front"|"Back"|"Left"|"Right";
}

export interface OrientationVisModalProps {
  showModal: boolean;
  setShowModal: (newShowValue: boolean) => void;
  setShowModalForPatternView: (newShowValue: boolean) => void;

  selectedPattern: number;
  dancerId: number;
  joint: boolean;

  frontsideColor: string;
  backsideColor: string;

  rotateDancerBody: (patternId: number, dancerId: number, newOrientation: number) => void;
  rotateDancerHead: (patternId: number, dancerId: number, newOrientation: number) => void;
  
  editingModeActive: boolean;

  brushSelectedDancers: number[];
  pos: Position;

  numCouples: number;
}

export interface NeighbourLineWrapperProps {
  dms: any;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  pattern: Pattern;

  hoveredDancer: number;

  setCandidatesOnVerticalLine: (param: number[])=>void;
  setCandidatesOnHorizontalLine: (param: number[])=>void;
  setCandidatesOnAscendingLine: (param: number[])=>void;
  setCandidatesOnDescendingLine: (param: number[])=>void;

  showHeatmap: boolean;
  editingModeActive: boolean;

  patternRotation: "Front"|"Back"|"Left"|"Right";
}


export interface NeighbourLineProps {
  hoveredDancer: number;

  pattern: Pattern

  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;

  orientation: string
  positions: {minX: number, maxX: number, minY: number, maxY: number};

  patternRotation: "Front"|"Back"|"Left"|"Right";
}

export enum SelectionStatus {
  Selected = 'Selected',
  Default = 'Default',
  Damped = 'Damped',
}

export interface DancerProps {
  dms: any;
  id: number;
  coupleId: number;
  pos: Position;
  previousPos: Position;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  role: DancerRole;

  gentlemanColor:string | number | readonly string[] | undefined;
  ladyColor:string | number | readonly string[] | undefined;
  coupleColor:string | number | readonly string[] | undefined;

  hoveredDancer: number;
  setHoveredDancer: (newSelectedDancer:number) => void;

  draggedDancer: number;
  setDraggedDancer: (newdraggedDancer:number) => void; 
  setDraggedDancerPosition: (newPosition: {x: number, y: number}) => void;

  brushSelectedDancers: number[];
  setBrushSelectedDancers: (newSelection: number[]) => void;
  firstDancerInBrush: number;
  setFirstDancerInBrush: (newFirstDancer: number) => void;

  selectedDancerForTransitions: number;
  setSelectedDancerForTransitions: (newValue: number) => void;

  currentMousePosition: {x:number, y:number};
  mouseDownPosition: {x:number, y:number};

  setMouseDownPosition: ({x, y}: any)=> void;
  setMouseMovePosition: ({x, y}: any)=> void;
  setMouseUpPosition:({x, y}:any)=> void;
  gridDragEnabled: boolean;

  editingModeActive: boolean;
  showOrientations: boolean;
  showTransitions: boolean;
  patternRotation: "Front"|"Back"|"Left"|"Right";

  showShapes: boolean;
  addShape:(patternId: number, newShape: ConvexHull)=>void;

  animationSpeed:number;
  currentlyInAnimation: boolean;

  selectedPattern: number;
  moveDancer: (patternId: number, dancerId: number, newX: number, newY: number) => void;

  rotateDancerBody: (patternId: number, dancerId: number, newOrientation: number) => void;
  rotateDancerHead: (patternId: number, dancerId: number, newOrientation: number) => void;

  danceCouple: DanceCouple;
  pattern: Pattern;
  previousPattern: Pattern;

  setShowModal:(value: boolean)=> void;

  isCalloutVisible: boolean;
  showCallout: (xPosition: number, yPosition: number, joint: boolean, dancerId: number) => void;

  candidatesOnVerticalLine: number[];
  candidatesOnHorizontalLine: number[];
  candidatesOnAscendingLine: number[];
  candidatesOnDescendingLine: number[];

  setShowScalingComponent: (newShowValue: boolean) => void;
}

export interface PreviewDancerProps {
  dms: any;
  id: number;
  danceCouple: DanceCouple;
  pos: Position;
  role: DancerRole;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  gentlemanColor:string | number | readonly string[] | undefined;
  ladyColor:string | number | readonly string[] | undefined;
  coupleColor:string | number | readonly string[] | undefined;

  showTransitions:boolean;
  selectedDancerForTransitions: number;
  setSelectedDancerForTransitions: (newValue: number) => void;


  patternRotation: "Front"|"Back"|"Left"|"Right";
  editingModeActive: boolean;
}

export interface TransitionProps {
  dms: any;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;

  //previewPos: Position;
  //pos: Position;

  pattern: Pattern;
  previousPattern: Pattern;

  coupleId: number;
  numberInCouple: number;

  showTransitions: boolean;
  editingModeActive: boolean;

  patternRotation: "Front"|"Back"|"Left"|"Right";

  currentMousePosition: {x: number, y: number};
  draggedHandle: {dancerId: number, intermediatePatternId: number};
  setDraggedHandle:(handleParams: {dancerId: number, intermediatePatternId: number})=>void;

  transitionColorScheme: string;
}

export interface ShapeProps {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;

  selectedPattern: number;
  showShapeCallout: (shapeId: number) => void;

  positions: DanceCouple[]; 
  shape: ConvexHull;
  patternRotation: "Front"|"Back"|"Left"|"Right";
}

export interface ScalingComponentProps {
  dms: any;

  horizontalStartPosition: {x:number, y:number};
  setHorizontalStartPosition: (arg: {x:number, y:number}) => void;

  verticalStartPosition: {x:number, y:number};
  setVerticalStartPosition: (arg: {x:number, y:number}) => void;

  setDelta: (x: number) => void;
  centerPosition: {x:number, y:number};
  brushSelectedDancers: number[];
}

export interface POVArrowProps {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;

  patternRotation: "Front" | "Back" | "Left" | "Right";
}

export interface SaveToDraftModalProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;

  pattern: Pattern;
  addPatternToDraft: (patternNameInDraft:string, pattern:Pattern)=>void;
}