import { ConvexHull, DanceCouple, DiscreteHeatmap, IntermediatePattern, IntermediatePosition, Pattern, Polyline, Position } from "../interfaces/Choreography";

export function findConvexHull(positions: DanceCouple[], brushSelectedDancers: number[]) {
  if (brushSelectedDancers.length <= 1) {
    return {lineSegments: []};
  }

  const dancerInLeftBottomCorner = findDancerInBottomLeftCorner(positions, brushSelectedDancers);
  const positionOfDancerInLeftBottomCorner = positions[Math.floor((dancerInLeftBottomCorner-1)/2)].position[(dancerInLeftBottomCorner-1)%2];

  const P = { x: positionOfDancerInLeftBottomCorner.x, y: positionOfDancerInLeftBottomCorner.y};

  let otherPoints: { id: number; x: number; y: number; angle: number; distance: number; }[] = [];
  otherPoints.push({id:dancerInLeftBottomCorner,x:positionOfDancerInLeftBottomCorner.x,y:positionOfDancerInLeftBottomCorner.y, angle: -1, distance: 0});

  positions.forEach(danceCouple => {
    const gentlemanId: number = 2*danceCouple.id-1
    const gentlemanX = danceCouple.position[0].x
    const gentlemanY = danceCouple.position[0].y

    if (gentlemanId !== dancerInLeftBottomCorner && brushSelectedDancers.includes(gentlemanId)) {
      otherPoints.push({id: gentlemanId,x: gentlemanX, y: gentlemanY, angle: getAngleWithXAxis(P, {x: gentlemanX, y: gentlemanY}), distance: distanceBetweenPoints(P,{x: gentlemanX, y: gentlemanY})});
    }

    if (!danceCouple.joint) {
      const ladyId: number = 2*danceCouple.id
      const ladyX = danceCouple.position[1].x
      const ladyY = danceCouple.position[1].y
      if (ladyId !== dancerInLeftBottomCorner && brushSelectedDancers.includes(ladyId)) {
        otherPoints.push({id: ladyId,x: ladyX, y: ladyY, angle: getAngleWithXAxis(P, {x: ladyX, y: ladyY}), distance: distanceBetweenPoints(P,{x: ladyX, y: ladyY})});
      }
    }
  })

  const EPS = 0.001;
  otherPoints.sort((a,b) => {
    const angleDifference = a.angle-b.angle;
    const distanceDifference = a.distance - b.distance;

    if (angleDifference > EPS) {
      return 1;
    }else if (angleDifference < EPS) {
      return -1;
    }else {
      if (distanceDifference > EPS) {
        return 1;
      }else if (distanceDifference < EPS) {
        return -1
      }else {
        return 0;
      }
    }
  })


  let idsToRemove:number[] = [];
  otherPoints.forEach((controlPoint) => {
    otherPoints.forEach(referencePoint => {
      if (controlPoint !== referencePoint && controlPoint.id !== dancerInLeftBottomCorner ) {
        const a = Math.abs(controlPoint.angle-referencePoint.angle)
        if (a < EPS && controlPoint.distance < referencePoint.distance) {
          if (!idsToRemove.includes(controlPoint.id)) {
            idsToRemove.push(controlPoint.id);
          }
        }
      }
    })
  })

  otherPoints = otherPoints.filter(item => !idsToRemove.includes(item.id))
  otherPoints.push({id:dancerInLeftBottomCorner,x:positionOfDancerInLeftBottomCorner.x,y:positionOfDancerInLeftBottomCorner.y, angle: -1, distance: 0});


  let stack = [];
  for (let i = 0; i < otherPoints.length; i++) {
    let point = otherPoints[i];

    while (stack.length > 1 && ccw(stack[stack.length - 2], stack[stack.length - 1], point)<=0) {
      stack.pop();
    }
    stack.push(point);
  }


  let convexHullLines: Polyline = {id: -1, lineSegments: []};
  for (let i=0; i<stack.length-1; i++) {
    convexHullLines.lineSegments.push({sourceId: stack[i].id, targetId: stack[i+1].id});
  }
  let convexHull: ConvexHull = {id: -1, polyline: convexHullLines, brushSelectedDancers: brushSelectedDancers};


  return convexHull;
}

function ccw (P1: any, P2: any, P3 : any) {
  return (P2.x-P1.x)*(P3.y-P1.y) - (P2.y-P1.y)*(P3.x-P1.x)
}

function getAngleWithXAxis(P:{x: number, y: number}, Q:{x: number, y: number}) {
  return Math.acos((Q.x-P.x)/vectorLength({x:Q.x-P.x, y:Q.y-P.y}));
}

function vectorLength(vector: {x:number, y:number}) {
  return Math.sqrt(Math.pow(vector.x,2) + Math.pow(vector.y,2))
}

function distanceBetweenPoints(P:{x:number, y:number}, Q:{x:number, y:number}) {
  return Math.sqrt(Math.pow(P.x-Q.x,2)+Math.pow(P.y-Q.y,2));
}

function findDancerInBottomLeftCorner(positions: DanceCouple[], brushSelectedDancers: number[]) {
  let minimalX: number = Number.MAX_VALUE;
  let minimalY: number = Number.MAX_VALUE;
  let dancerInBottomLeftCorner: number = -1;
  positions.forEach((danceCouple) => {
    let i = 0;
    danceCouple.position.forEach((position) => {
      if (brushSelectedDancers.includes(2*danceCouple.id+i-1)) {
        if (position.y < minimalY || (position.y === minimalY && position.x < minimalX)) {
          minimalX = position.x;
          minimalY = position.y;
          dancerInBottomLeftCorner = 2*danceCouple.id+i-1;
        }
      }
      i++;
    })
  })
  return dancerInBottomLeftCorner;
}


export function getPositionAfterPatterRotation(position: Position, patternRotation: "Front"|"Back"|"Left"|"Right") {
  let resultPosition: Position = {x: position.x, y: position.y, bodyOrientation: position.bodyOrientation, headOrientation: position.headOrientation, pose: position.pose};
  calcCoordinatesAfterRotation(position, resultPosition, patternRotation);
  return resultPosition;
}

export function getIntermediatePositionAfterPatterRotation(position: IntermediatePosition, patternRotation: "Front"|"Back"|"Left"|"Right") {
  let resultPosition: IntermediatePosition = {x: position.x, y: position.y};
  calcCoordinatesAfterRotation(position, resultPosition, patternRotation);
  return resultPosition;
}


function calcCoordinatesAfterRotation(position: Position|IntermediatePosition, resultPosition: Position|IntermediatePosition,  patternRotation: "Front"|"Back"|"Left"|"Right") {
  switch(patternRotation) {
    case "Left":
      resultPosition.x = position.y;
      resultPosition.y = -position.x; 
      break;
    case "Back":
      resultPosition.y *= -1;
      resultPosition.x *= -1;
      break;
    case "Right":
      resultPosition.x = -position.y;
      resultPosition.y = position.x; 
      break;
  }
}

export function getOrientationAfterRotation(rotation: number, patternRotation : "Front"|"Back"|"Left"|"Right") {
  let resultRotation = rotation
  switch(patternRotation) {
    case "Left":
      resultRotation = (rotation + 90) % 360;
      break;
    case "Back":
      resultRotation = (rotation + 180) % 360;
      break;
    case "Right":
      resultRotation = (rotation + 270) % 360;
      break;
  }
  return resultRotation;
}

export function calcSimpleCoordinatesAfterRotation(
  position: { x: number; y: number },
  patternRotation: "Front" | "Back" | "Left" | "Right"
) {
  let resultPosition = { x: position.x, y: position.y };
  switch (patternRotation) {
    case "Left":
      resultPosition.x = position.y;
      resultPosition.y = -position.x;
      break;
    case "Back":
      resultPosition.y *= -1;
      resultPosition.x *= -1;
      break;
    case "Right":
      resultPosition.x = -position.y;
      resultPosition.y = position.x;
      break;
  }
  return resultPosition;
}

export function isHighlighted(
    value: number,
    selectedDancer: number,
    positions: DanceCouple[],
    axisAlignment: "horizontal" | "vertical",
    draggedDancerPosition: {x: number, y: number},
    patternRotation: "Front"|"Back"|"Left"|"Right"
  ): boolean {

    if (axisAlignment === "horizontal" && draggedDancerPosition.y === value) {
      return true;
    }
    if (axisAlignment === "vertical" && draggedDancerPosition.x === value) {
      return true;
    }

    if (selectedDancer > -1) {
      const coupleNumber: number = Math.floor((selectedDancer - 1) / 2);
      const dancerNumberInDanceCouple: number = (selectedDancer - 1) % 2;
  
      if (axisAlignment === "horizontal") {
        if (
          calcSimpleCoordinatesAfterRotation(positions[coupleNumber].position[dancerNumberInDanceCouple],patternRotation).x === value
        ) {
          return true;
        }
      } else {
        if (
          calcSimpleCoordinatesAfterRotation(positions[coupleNumber].position[dancerNumberInDanceCouple],patternRotation).y === value
        ) {
          return true;
        }
      }
    }
  
    return false;
}

export function getBeatDistance(patternBefore: Pattern|IntermediatePattern, patternAfter: Pattern|IntermediatePattern) {
  let beatDistance: number = patternAfter.beat - patternBefore.beat;
        if (patternAfter.bar !== patternBefore.bar) {
          beatDistance =
            patternAfter.beat +
            1 +
            (7 - patternBefore.beat) +
            (patternAfter.bar - patternBefore.bar - 1) * 8;
        }
  return beatDistance;
}


export function isInteger(value: number): boolean {
  if (value - Math.floor(value) === 0) {
    return true;
  }
  return false;
}

export function getBrushX(mouseMovePosition: {x:number, y:number}, mouseDownPosition: {x:number, y:number}) {
  if (mouseMovePosition.x < mouseDownPosition.x) {
    return mouseMovePosition.x;
  }
  return mouseDownPosition.x;
}

export function getBrushY(mouseMovePosition: {x:number, y:number}, mouseDownPosition: {x:number, y:number}): number {
  if (mouseMovePosition.y < mouseDownPosition.y) {
    return mouseMovePosition.y;
  }
  return mouseDownPosition.y;
}

export function getBrushWidth(mouseMovePosition: {x:number, y:number}, mouseDownPosition: {x:number, y:number}) {
  if (mouseMovePosition.x < 0) {
    return 0;
  }

  if (mouseMovePosition.x < mouseDownPosition.x) {
    return mouseDownPosition.x - mouseMovePosition.x;
  }

  return Math.abs(mouseMovePosition.x - mouseDownPosition.x);
}

export function getBrushHeight(mouseMovePosition: {x:number, y:number}, mouseDownPosition: {x:number, y:number}) {
  if (mouseMovePosition.y < 0) {
    return 0;
  }

  if (mouseMovePosition.y < mouseDownPosition.y) {
    return mouseDownPosition.y - mouseMovePosition.y;
  }

  return Math.abs(mouseMovePosition.y - mouseDownPosition.y);
}

export function getBoundingClientRect (className: string) {
  return document
  .getElementsByClassName(className)[0]
  .getBoundingClientRect();
}


export function clampToGridPosition(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;

  const gridResolution = 0.5;
  const distanceToLeftInteger = Math.abs(value - Math.floor(value));
  const distanceToRightInteger = Math.abs(Math.ceil(value) - value);
  const midValue = Math.floor(value) + gridResolution;
  const distanceToMidValue = Math.abs(value-midValue);
  const minimalDistance = Math.min(distanceToLeftInteger, distanceToRightInteger, distanceToMidValue)

  if (distanceToLeftInteger === minimalDistance) {
    return Math.floor(value);
  }else if (distanceToRightInteger === minimalDistance) {
    return Math.ceil(value);
  }
  return Math.floor(value)+gridResolution;
}


export function getGaussian2DKernel(kernelPixelWidth: number) {
  const kernelExtent = Math.floor(kernelPixelWidth / 2);
  let kernel: number[][] = [];
  for (let row=0; row<kernelPixelWidth; row++) {
    kernel.push([]);
    for (let column=0; column<kernelPixelWidth; column++) {
      const value = gauss2D(column-kernelExtent, row-kernelExtent, kernelPixelWidth);
      kernel[row].push(value);
    }
  }
  return kernel;
}

function gauss2D(x: number, y: number, kernelPixelWidth: number) {
  const sigma = kernelPixelWidth/5;
  return 1/(2*Math.PI*sigma*sigma)*Math.exp(-(x*x+y*y)/(2*sigma*sigma));
}

export function findMaxFrequencyInHeatmap(heatmap: DiscreteHeatmap) {
  const heatmapData = heatmap.values;
  let maxFrequency = Number.MIN_VALUE;
  for (let i = 0; i < heatmapData.length; i++) {
    for (let j = 0; j < heatmapData[i].length; j++) {
      if (heatmapData[i][j] > maxFrequency) {
        maxFrequency = heatmapData[i][j];
      }
    }
  }
  return maxFrequency;
}

export function allPairsJoint(danceCouples: DanceCouple[]) {
  let allPairsJoint = true;
  danceCouples.forEach(danceCouple => {
    if (!danceCouple.joint) {
      allPairsJoint = false;
    }
  })
  return allPairsJoint;
}

export function allPairsSeparated(danceCouples: DanceCouple[]) {
  let allPairsSeparated = true;
  danceCouples.forEach(danceCouple => {
    if (danceCouple.joint) {
      allPairsSeparated = false;
    }
  })
  return allPairsSeparated;
}


export function checkDiagonalRotationValidity(positions: DanceCouple[], brush: number[], firstDancerInBrush: number): boolean {
  if (brush.length <= 1 || firstDancerInBrush === -1) return false;
  
  const firstCoupleNumber: number = Math.floor((firstDancerInBrush - 1) / 2);
  const firstDancerNumberInDanceCouple: number = (firstDancerInBrush - 1) % 2;
  const firstDancerPosition: Position = positions[firstCoupleNumber].position[firstDancerNumberInDanceCouple];


  let firstDancerIsMostLeft: boolean = true;

  let maxDistance = Number.MIN_VALUE;
  let diagonalEndId = -1;

  brush.forEach(id => {
      if (id === firstDancerInBrush) return;
      
      const coupleNumber: number = Math.floor((id - 1) / 2);
      const dancerNumberInDanceCouple: number = (id - 1) % 2;
      const currentDancerPosition: Position = positions[coupleNumber].position[dancerNumberInDanceCouple];
      
      if (currentDancerPosition.x <= firstDancerPosition.x) {
        firstDancerIsMostLeft = false;
      }

      const distance = Math.sqrt(Math.pow(currentDancerPosition.x-firstDancerPosition.x,2)+Math.pow(currentDancerPosition.y-firstDancerPosition.y,2));
      if (distance > maxDistance) {
        maxDistance = distance;
        diagonalEndId = id;
      }
    });

    if (!firstDancerIsMostLeft) return false;

    const diagonalEndDoupleNumber: number = Math.floor((diagonalEndId - 1) / 2);
    const diagonalEndDancerNumberInDanceCouple: number = (diagonalEndId - 1) % 2;
    const endPosition: Position = positions[diagonalEndDoupleNumber].position[diagonalEndDancerNumberInDanceCouple];

    let allDancersInSingleLine: boolean = true;
    brush.forEach(id => {
      if (id === firstDancerInBrush || id === diagonalEndId) return;

      const coupleNumber: number = Math.floor((id - 1) / 2);
      const dancerNumberInDanceCouple: number = (id - 1) % 2;
      const currentDancerPosition: Position = positions[coupleNumber].position[dancerNumberInDanceCouple];

      console.log(id, currentDancerPosition.y, (endPosition.y/endPosition.x)*currentDancerPosition.x)
      
      const leftSideExpression = currentDancerPosition.y - firstDancerPosition.y;
      const rightSideExpression = ((endPosition.y-firstDancerPosition.y)/(endPosition.x-firstDancerPosition.x))*(currentDancerPosition.x-firstDancerPosition.x);
      
      if (leftSideExpression !== rightSideExpression) {
        allDancersInSingleLine = false;
      }
    })

    return allDancersInSingleLine;
}