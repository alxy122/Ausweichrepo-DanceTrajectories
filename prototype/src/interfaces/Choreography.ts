export interface DanceFloor {
  width: number;
  length: number;
}

export interface Position {
  x: number;
  y: number;
  bodyOrientation: number;
  headOrientation: number;
  pose: Pose;
}

export interface IntermediatePosition {
  x: number;
  y: number;
}

export interface IntermediateDanceCouple {
  id: number;
  joint:boolean;
  position: IntermediatePosition[];
}

export interface DanceCouple {
  id: number;
  joint:boolean;
  position: Position[];
}

export enum DancerRole {
  Gentleman = 'Gentleman',
  Lady = 'Lady'
}

export enum StandardPattern {
  Arrow8 = 'Arrow 8',
  HorizontalLines8 = 'Horizontal Lines 8',
  VerticalLines8 = 'Vertical Lines 8',
  Diamonds8 = 'Diamonds 8',
  Rectangles8 = 'Rectangle 8',
}

export interface Pattern {
  id: number;
  dance: string;
  remarks: string;
  pointDescription: string;
  bar: number;
  beat: number;

  positions: DanceCouple[];
  intermediatePatterns: IntermediatePattern[];

  shapes: ConvexHull[];
}


export interface IntermediatePattern {
  id: number;
  bar: number;
  beat: number;

  positions: IntermediateDanceCouple[];
}

export interface Pose {
  name: string;
  limbs: Limb[];
}

export interface Limb {
  name: string;
  rotation: Rotation;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface ConvexHull {
  id: number;
  polyline: Polyline
  brushSelectedDancers: number[];
}

export interface Polyline {
  id: number;
  lineSegments: PolylineSegment[];
}

export interface PolylineSegment {
  sourceId: number;
  targetId: number;
}

export interface Choreography {
  id: number;
  name: string;
  description: string;
  numCouples: number;
  danceFloor: DanceFloor;
  patterns: Pattern[];

  savedPoses: Pose[];
  draft: Pattern[];
}

export interface DiscreteHeatmap {
  values : Array<number>[];
}




