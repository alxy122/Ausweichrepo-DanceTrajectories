import { useEffect, useMemo, useState } from "react";
import { scaleLinear } from "d3-scale";

import useChartDimensions from "../hooks/UseChartDimensions";

import Dancer from "./Dancer";
import PatternBackground from "./PatternBackground";
import { PatternViewProps } from "../interfaces/PatternView";
import {
  ConvexHull,
  DanceCouple,
  DancerRole,
  Position,
} from "../interfaces/Choreography";
import PreviewDancer from "./PreviewDancer";

import {
  getBrushX,
  getBrushY,
  getBrushWidth,
  getBrushHeight,
  getBoundingClientRect,
  findConvexHull,
  clampToGridPosition,
  allPairsJoint,
  allPairsSeparated,
} from "../services/VisServices";
import DiscreteHeatmap from "./DiscreteHeatmap";
import ContinuousHeatmap from "./ContinuousHeatmap";

import Shape from "./Shape";
import Callout from "./Callout";
import Transition from "./Transition";
import NeighbourLineWrapper from "./NeighbourLineWrapper";
import { Button, Stack } from "react-bootstrap";
import ScalingComponent from "./ScalingComponent";
import SaveToDraftModal from "./SaveToDraftModal";

const chartSettings = {};

function PatternView(props: PatternViewProps) {
  const [ref, dms] = useChartDimensions(chartSettings);

  const [showModal, setShowModal] = useState(false);

  const [showDraftModal, setShowDraftModal] = useState(false);

  const [mouseDownPosition, setMouseDownPosition] = useState({
    x: -1,
    y: -1,
  });
  const [mouseMovePosition, setMouseMovePosition] = useState({ x: -1, y: -1 });

  const [currentMousePosition, setCurrentMousePosition] = useState({
    x: -1,
    y: -1,
  });

  const [draggedHandle, setDraggedHandle] = useState({
    dancerId: 0,
    intermediatePatternId: -1,
  });

  const [draggedDancer, setDraggedDancer] = useState<number>(-1);
  const [draggedDancerPosition, setDraggedDancerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: -9, y: -9 });

  const [selectedDancerForTransitions, setSelectedDancerForTransitions] =
    useState(-1);

  useEffect(() => {
    if (currentMousePosition.x > -1 && draggedDancer > -1) {
      const discreteX = clampToGridPosition(
        xScale.invert(currentMousePosition.x - 40),
        -8,
        8
      );
      const discreteY = clampToGridPosition(
        yScale.invert(currentMousePosition.y - 40),
        -8,
        8
      );
      setDraggedDancerPosition({ x: discreteY, y: discreteX });
    } else {
      setDraggedDancerPosition({ x: -9, y: -9 });
    }
  }, [currentMousePosition, draggedDancer]);

  useEffect(() => {
    setBrushSelectedDancers([]);
  }, [props.editingModeActive]);

  const [brushSelectedDancers, setBrushSelectedDancers] = useState<number[]>(
    []
  );
  const [firstDancerInBrush, setFirstDancerInBrush] = useState<number>(-1);
  useEffect(() => {
    props.setBrushCopy(brushSelectedDancers);
  }, [brushSelectedDancers]);
  useEffect(() => {
    props.setCopyOfFirstDancer(firstDancerInBrush);
  }, [firstDancerInBrush]);

  const [horizontalScalingStartPosition, setHorizontalScalingStartPosition] =
    useState({
      x: -1,
      y: -1,
    });
  const [verticalScalingStartPosition, setVerticalScalingStartPosition] =
    useState({
      x: -1,
      y: -1,
    });

  const [showScalingComponent, setShowScalingComponent] = useState(false);
  const [scalingDelta, setScalingDelta] = useState<number>(0);
  const [gridSize, setGridSize] = useState<number>(15);

  const [centerPosition, setCenterPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useEffect(() => {
    let centerX: number = 0;
    let centerY: number = 0;

    brushSelectedDancers.forEach((dancerId) => {
      const coupleNumber: number = Math.floor((dancerId - 1) / 2);
      const dancerNumberInDanceCouple: number = (dancerId - 1) % 2;
      const position =
        props.pattern.positions[coupleNumber].position[
          dancerNumberInDanceCouple
        ];
      centerX += xScale(position.x);
      centerY += yScale(position.y);
    });
    if (brushSelectedDancers.length > 0) {
      centerX /= brushSelectedDancers.length;
      centerY /= brushSelectedDancers.length;
    }

    setCenterPosition({ x: centerX, y: centerY });
  }, [
    brushSelectedDancers,
    props.selectedPattern,
    props.pattern,
    dms.boundedWidth,
  ]);

  const [candidatesOnVerticalLine, setCandidatesOnVerticalLine] = useState<
    number[]
  >([]);
  const [candidatesOnHorizontalLine, setCandidatesOnHorizontalLine] = useState<
    number[]
  >([]);

  const [candidatesOnAscendingLine, setCandidatesOnAscendingLine] = useState<
    number[]
  >([]);
  const [candidatesOnDescendingLine, setCandidatesOnDescendingLine] = useState<
    number[]
  >([]);

  const xScale = useMemo(() => {
    return scaleLinear()
      .domain([-(props.danceFloor.width / 2), props.danceFloor.width / 2])
      .range([0, dms.boundedWidth]);
  }, [props.danceFloor, dms.boundedWidth]);

  const yScale = useMemo(() => {
    return scaleLinear()
      .domain([props.danceFloor.length / 2, -(props.danceFloor.length / 2)])
      .range([0, dms.boundedHeight]);
  }, [props.danceFloor, dms.boundedHeight]);

  const [isJoinCalloutVisible, setIsJoinCalloutVisible] = useState(false);
  const [joinCalloutTransform, setJoinCalloutTransform] = useState("");
  const [dancerIdToSeparate, setDancerIdToSeparate] = useState(-1);
  const [dancerIdToJoin, setDancerIdToJoin] = useState(-1);

  function showJoinCallout(
    xPosition: number,
    yPosition: number,
    joint: boolean,
    dancerId: number
  ) {
    if (
      !props.editingModeActive ||
      props.showOrientations ||
      props.showShapes ||
      props.showTransitions
    )
      return;
    setIsJoinCalloutVisible(false);
    setJoinCalloutTransform(`translate(${xPosition}, ${yPosition})`);
    setIsJoinCalloutVisible(true);
    setDancerIdToSeparate(-1);
    setDancerIdToJoin(-1);
    if (joint) {
      setDancerIdToSeparate(dancerId);
    } else {
      setDancerIdToJoin(dancerId);
    }
  }

  function hideJoinCallout() {
    setIsJoinCalloutVisible(false);
    setDancerIdToSeparate(-1);
    setDancerIdToJoin(-1);
  }

  function getCalloutContent() {
    if (dancerIdToSeparate > -1) {
      return (
        <Button
          onClick={(e) => {
            props.separateDanceCouple(
              props.selectedPattern,
              dancerIdToSeparate
            );
          }}
          variant="secondary"
        >
          Separate
        </Button>
      );
    } else if (dancerIdToJoin > -1) {
      return (
        <Button
          onClick={(e) => {
            props.joinDanceCouple(props.selectedPattern, dancerIdToJoin);
          }}
          variant="secondary"
        >
          Join
        </Button>
      );
    }
  }

  const [isJoinAllCalloutVisible, setIsJoinAllCalloutVisible] = useState(false);
  const [joinAllCalloutTransform, setJoinAllCalloutTransform] = useState("");

  function showJoinAllCallout(xPosition: number, yPosition: number) {
    if (
      !props.editingModeActive ||
      props.showOrientations ||
      props.showShapes ||
      props.showTransitions ||
      isJoinCalloutVisible
    )
      return;
    setIsJoinAllCalloutVisible(false);
    setJoinAllCalloutTransform(
      `translate(${xPosition - 170}, ${yPosition - 100})`
    );
    setIsJoinAllCalloutVisible(true);
  }

  useEffect(() => {
    if (isJoinCalloutVisible) {
      setIsJoinAllCalloutVisible(false);
    }
  }, [isJoinCalloutVisible]);

  function hideJoinAllCallout() {
    setIsJoinAllCalloutVisible(false);
  }

  function getJoinAllCalloutContent() {
    return (
      <Stack>
        <Button variant="secondary" onClick={() => setShowDraftModal(true)}>
          Save as draft
        </Button>
        <Button
          disabled={allPairsSeparated(props.pattern.positions)}
          onClick={() => separateAllPairs()}
          variant="secondary"
        >
          Separate all
        </Button>
        <Button
          onClick={() => joinAllPairs()}
          variant="secondary"
          disabled={allPairsJoint(props.pattern.positions)}
        >
          Join all
        </Button>
      </Stack>
    );
  }

  function separateAllPairs() {
    for (let i = 1; i <= props.pattern.positions.length; i++) {
      props.separateDanceCouple(props.selectedPattern, 2 * i);
    }
  }

  function joinAllPairs() {
    for (let i = 1; i <= props.pattern.positions.length; i++) {
      props.joinDanceCouple(props.selectedPattern, 2 * i);
    }
  }

  const [isShapeCalloutVisible, setIsShapeCalloutVisible] = useState(false);
  const [shapeCalloutTransform, setShapeCalloutTransform] = useState("");
  const [shapeToDelete, setShapeToDelete] = useState(-1);

  function showShapeCallout(shapeId: number) {
    if (!props.editingModeActive) return;
    setIsShapeCalloutVisible(false);

    setShapeCalloutTransform(
      `translate(${currentMousePosition.x - 40}, ${
        currentMousePosition.y - 40
      })`
    );
    setIsShapeCalloutVisible(true);
    setShapeToDelete(shapeId);
  }

  useEffect(() => {
    hideJoinCallout();
    hideShapeCallout();
    setSelectedDancerForTransitions(-1);
  }, [props.selectedPattern]);
  function hideShapeCallout() {
    setIsShapeCalloutVisible(false);
  }

  function changeHoveredDancer(newSelectedDancer: number) {
    props.setHoveredDancer(newSelectedDancer);
  }

  function mouseDownOnBackground(e: any) {
    if (!props.editingModeActive || props.showTransitions || showModal) {
      return;
    }

    const boundingRect = getBoundingClientRect("chart-wrapper");
    setMouseDownPosition({
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    });

    if (brushSelectedDancers.length > 0) {
      setBrushSelectedDancers([]);
    }
  }

  function mouseMoveOnBackground(e: any) {
    if (e.ctrlKey) return;
    const boundingRect = getBoundingClientRect("chart-wrapper");
    const currentMousePosition = {
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    };
    setCurrentMousePosition(currentMousePosition);

    proceedHorizontalScaling(e, currentMousePosition);
    proceedVerticalScaling(e, currentMousePosition);

    if (mouseDownPosition.x < 0 || mouseDownPosition.y < 0) return;

    setMouseMovePosition({
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    });

    if (props.editingModeActive && !props.showHeatmap) {
      updateBrushSelection(e, false);

      if (
        draggedHandle.dancerId > 0 &&
        draggedHandle.intermediatePatternId > -1
      ) {
      }
    }
  }

  function proceedHorizontalScaling(
    e: any,
    currentMousePosition: { x: number; y: number }
  ) {
    if (
      horizontalScalingStartPosition.x === -1 &&
      horizontalScalingStartPosition.y === -1
    ) {
      return;
    }

    let localDelta =
      scalingDelta +
      (currentMousePosition.x - horizontalScalingStartPosition.x);

    if (Math.abs(localDelta) >= gridSize) {
      let discreteDisplacementSteps = 0;
      if (localDelta < 0) {
        discreteDisplacementSteps = Math.ceil(localDelta / gridSize);
      } else {
        discreteDisplacementSteps = Math.floor(localDelta / gridSize);
      }

      brushSelectedDancers.forEach((dancerId) => {
        const coupleNumber: number = Math.floor((dancerId - 1) / 2);
        const dancerNumberInDanceCouple: number = (dancerId - 1) % 2;
        const dancer: Position =
          props.pattern.positions[coupleNumber].position[
            dancerNumberInDanceCouple
          ];
        let newX = dancer.x;
        /*let distanceToStart = Math.abs(
          dancer.x - clampToGridPosition(xScale.invert(centerPosition.x), -8, 8)
        );*/
        let distanceToStart = clampToGridPosition(
          Math.abs(xScale(dancer.x) - centerPosition.x) / gridSize,
          -8,
          8
        );
        console.log(dancerId, Math.abs(dancer.x - centerPosition.x), gridSize);

        if (dancer.x < xScale.invert(centerPosition.x)) {
          newX -= discreteDisplacementSteps * 0.5 * distanceToStart * 0.5;
          if (newX < xScale.invert(centerPosition.x)) {
            const newY: number = dancer.y;
            props.moveDancer(props.selectedPattern, dancerId, newX, newY);
          }
        } else if (dancer.x > xScale.invert(centerPosition.x)) {
          newX += discreteDisplacementSteps * 0.5 * distanceToStart * 0.5;
          console.log(newX);
          if (newX > xScale.invert(centerPosition.x)) {
            const newY: number = dancer.y;
            props.moveDancer(props.selectedPattern, dancerId, newX, newY);
          }
        }
      });

      localDelta -= discreteDisplacementSteps * gridSize;
      setScalingDelta(localDelta);
      setHorizontalScalingStartPosition(currentMousePosition);
    }

    e.stopPropagation();
  }

  function proceedVerticalScaling(
    e: any,
    currentMousePosition: { x: number; y: number }
  ) {
    if (
      verticalScalingStartPosition.x === -1 &&
      verticalScalingStartPosition.y === -1
    ) {
      return;
    }

    let localDelta =
      scalingDelta + (verticalScalingStartPosition.y - currentMousePosition.y);

    if (Math.abs(localDelta) >= gridSize) {
      let discreteDisplacementSteps = 0;
      if (localDelta < 0) {
        discreteDisplacementSteps = Math.ceil(localDelta / gridSize);
      } else {
        discreteDisplacementSteps = Math.floor(localDelta / gridSize);
      }
      brushSelectedDancers.forEach((dancerId) => {
        const coupleNumber: number = Math.floor((dancerId - 1) / 2);
        const dancerNumberInDanceCouple: number = (dancerId - 1) % 2;
        const dancer: Position =
          props.pattern.positions[coupleNumber].position[
            dancerNumberInDanceCouple
          ];
        let newY = dancer.y;
        let distanceToStart = clampToGridPosition(
          Math.abs(xScale(dancer.y) - centerPosition.y) / gridSize,
          -8,
          8
        );

        if (dancer.y < yScale.invert(centerPosition.y)) {
          newY -= discreteDisplacementSteps * 0.5 * distanceToStart * 0.5;
          if (newY < yScale.invert(centerPosition.y)) {
            const newX: number = dancer.x;
            props.moveDancer(props.selectedPattern, dancerId, newX, newY);
          }
        } else if (dancer.y > yScale.invert(centerPosition.y)) {
          newY += discreteDisplacementSteps * 0.5 * distanceToStart * 0.5;
          if (newY > yScale.invert(centerPosition.y)) {
            const newX: number = dancer.x;
            props.moveDancer(props.selectedPattern, dancerId, newX, newY);
          }
        }
      });

      localDelta -= discreteDisplacementSteps * gridSize;
      setScalingDelta(localDelta);
      setVerticalScalingStartPosition(currentMousePosition);
    }

    e.stopPropagation();
  }

  function updateBrushSelection(e: any, lastUpdate: boolean) {
    const boundingRect = getBoundingClientRect("chart-wrapper");
    const currentMousePosition = {
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    };

    let copyOfBrushSelectedDancers = [...brushSelectedDancers];

    props.pattern.positions.forEach((danceCouple: DanceCouple) => {
      for (let i = 0; i < danceCouple.position.length; i++) {
        const dancerId = 2 * danceCouple.id - (1 - i);
        const offset = 40;
        if (
          xScale(danceCouple.position[i].x) + offset >=
            getBrushX(currentMousePosition, mouseDownPosition) &&
          yScale(danceCouple.position[i].y) + offset >=
            getBrushY(currentMousePosition, mouseDownPosition) &&
          xScale(danceCouple.position[i].x) + offset <=
            getBrushX(currentMousePosition, mouseDownPosition) +
              getBrushWidth(currentMousePosition, mouseDownPosition) &&
          yScale(danceCouple.position[i].y) + offset <=
            getBrushY(currentMousePosition, mouseDownPosition) +
              getBrushHeight(currentMousePosition, mouseDownPosition)
        ) {
          if (copyOfBrushSelectedDancers.length === 0) {
            setFirstDancerInBrush(dancerId);
          }
          if (!copyOfBrushSelectedDancers.includes(dancerId)) {
            copyOfBrushSelectedDancers.push(dancerId);
          }
        } else {
          if (copyOfBrushSelectedDancers.includes(dancerId)) {
            copyOfBrushSelectedDancers = copyOfBrushSelectedDancers.filter(
              (item) => item !== dancerId
            );
          }
        }
      }
    });

    if (
      copyOfBrushSelectedDancers.length > 2 &&
      props.showShapes &&
      lastUpdate
    ) {
      const convexHull = findConvexHull(
        props.pattern.positions,
        copyOfBrushSelectedDancers
      ) as ConvexHull;
      convexHull.id = props.pattern.shapes.length;
      if (convexHull.polyline.lineSegments.length > 0) {
        props.addShape(props.selectedPattern, convexHull);
      }
    }

    if (copyOfBrushSelectedDancers.length > 2) {
      setShowScalingComponent(true);
    } else if (copyOfBrushSelectedDancers.length > 1) {
      const firstCoupleNumber: number = Math.floor(
        (copyOfBrushSelectedDancers[0] - 1) / 2
      );
      if (props.pattern.positions[firstCoupleNumber].joint) {
        setShowScalingComponent(false);
      } else {
        setShowScalingComponent(true);
      }
    } else {
      setShowScalingComponent(false);
    }

    if (copyOfBrushSelectedDancers.length === 0) {
      setFirstDancerInBrush(-1);
    }

    setBrushSelectedDancers(copyOfBrushSelectedDancers);
  }

  function mouseUpOnBackground(e: any) {
    setDraggedDancer(-1);
    setScalingDelta(0);
    setHorizontalScalingStartPosition({ x: -1, y: -1 });
    setVerticalScalingStartPosition({ x: -1, y: -1 });

    if (draggedHandle.dancerId > 0) {
      const newX: number = clampToGridPosition(
        xScale.invert(currentMousePosition.x - 40),
        -8,
        8
      );
      const newY: number = clampToGridPosition(
        yScale.invert(currentMousePosition.y - 40),
        -8,
        8
      );

      props.moveDancerInIntermediatePattern(
        props.selectedPattern,
        draggedHandle.intermediatePatternId,
        draggedHandle.dancerId,
        newX,
        newY
      );
      setDraggedHandle({ dancerId: 0, intermediatePatternId: -1 });
    } else {
      setSelectedDancerForTransitions(-1);
    }

    if (mouseDownPosition.x < 0 || mouseDownPosition.y < 0) return;

    updateBrushSelection(e, true);

    setMouseDownPosition({ x: -1, y: -1 });
    setMouseMovePosition({ x: -1, y: -1 });
  }

  function mouseClickOnBackground(e: any) {
    if (isJoinCalloutVisible) {
      hideJoinCallout();
    }
    if (isShapeCalloutVisible) {
      hideShapeCallout();
    }
    if (isJoinAllCalloutVisible) {
      hideJoinAllCallout();
    }
  }

  function gentlemanSelectedForTransition(danceCouple: DanceCouple) {
    if (selectedDancerForTransitions === -1) return true;
    if (selectedDancerForTransitions > -1) {
      if (2 * danceCouple.id - 1 === selectedDancerForTransitions) {
        return true;
      }
      if (
        props.pattern.positions[danceCouple.id - 1].joint &&
        2 * danceCouple.id === selectedDancerForTransitions
      ) {
        return true;
      }
      if (
        danceCouple.joint &&
        2 * danceCouple.id === selectedDancerForTransitions
      ) {
        return true;
      }
    }
    return false;
  }

  function ladySelectedForTransition(danceCouple: DanceCouple) {
    if (selectedDancerForTransitions === -1) return true;
    if (selectedDancerForTransitions > -1) {
      if (2 * danceCouple.id === selectedDancerForTransitions) {
        return true;
      }
      if (
        props.pattern.positions[danceCouple.id - 1].joint &&
        2 * danceCouple.id - 1 === selectedDancerForTransitions
      ) {
        return true;
      }
      if (
        danceCouple.joint &&
        2 * danceCouple.id - 1 === selectedDancerForTransitions
      ) {
        return true;
      }
    }
    return false;
  }

  function transitions() {
    if (props.hasPreviousPattern && props.showTransitions) {
      return props.previousPattern.positions.map((danceCouple: DanceCouple) => (
        <g key={danceCouple.id}>
          {gentlemanSelectedForTransition(danceCouple) && (
            <Transition
              dms={dms}
              xScale={xScale}
              yScale={yScale}
              pattern={props.pattern}
              previousPattern={props.previousPattern}
              coupleId={danceCouple.id - 1}
              numberInCouple={0}
              showTransitions={props.showTransitions}
              patternRotation={props.patternRotation}
              editingModeActive={props.editingModeActive}
              draggedHandle={draggedHandle}
              setDraggedHandle={setDraggedHandle}
              currentMousePosition={currentMousePosition}
              transitionColorScheme={props.transitionColorScheme}
            />
          )}

          {ladySelectedForTransition(danceCouple) && (
            <Transition
              dms={dms}
              xScale={xScale}
              yScale={yScale}
              pattern={props.pattern}
              previousPattern={props.previousPattern}
              coupleId={danceCouple.id - 1}
              numberInCouple={1}
              showTransitions={props.showTransitions}
              patternRotation={props.patternRotation}
              editingModeActive={props.editingModeActive}
              draggedHandle={draggedHandle}
              setDraggedHandle={setDraggedHandle}
              currentMousePosition={currentMousePosition}
              transitionColorScheme={props.transitionColorScheme}
            />
          )}
        </g>
      ));
    }
  }

  function previewDancers() {
    if (props.hasPreviousPattern) {
      return props.previousPattern.positions.map((danceCouple: DanceCouple) => (
        <g key={danceCouple.id}>
          {gentlemanSelectedForTransition(danceCouple) && (
            <PreviewDancer
              dms={dms}
              id={2 * danceCouple.id - 1}
              danceCouple={danceCouple}
              pos={danceCouple.position[0]}
              xScale={xScale}
              yScale={yScale}
              showTransitions={props.showTransitions}
              gentlemanColor={props.gentlemanColor}
              ladyColor={props.ladyColor}
              coupleColor={props.coupleColor}
              role={DancerRole.Gentleman}
              editingModeActive={props.editingModeActive}
              selectedDancerForTransitions={selectedDancerForTransitions}
              setSelectedDancerForTransitions={setSelectedDancerForTransitions}
              patternRotation={props.patternRotation}
            />
          )}
          {ladySelectedForTransition(danceCouple) && (
            <PreviewDancer
              dms={dms}
              id={2 * danceCouple.id}
              danceCouple={danceCouple}
              pos={
                danceCouple.position.length === 1
                  ? danceCouple.position[0]
                  : danceCouple.position[1]
              }
              xScale={xScale}
              yScale={yScale}
              showTransitions={props.showTransitions}
              gentlemanColor={props.gentlemanColor}
              ladyColor={props.ladyColor}
              coupleColor={props.coupleColor}
              role={DancerRole.Lady}
              editingModeActive={props.editingModeActive}
              selectedDancerForTransitions={selectedDancerForTransitions}
              setSelectedDancerForTransitions={setSelectedDancerForTransitions}
              patternRotation={props.patternRotation}
            />
          )}
        </g>
      ));
    }
  }

  return (
    <div className="chart-wrapper" ref={ref}>
      <svg
        width={dms.width}
        height={dms.height}
        style={{ overflow: "visible" }}
        onMouseDown={mouseDownOnBackground}
        onMouseMove={mouseMoveOnBackground}
        onMouseUp={mouseUpOnBackground}
        onClick={mouseClickOnBackground}
        onContextMenu={(e) => {
          e.preventDefault();
          showJoinAllCallout(e.clientX, e.clientY);
        }}
        className="dance-floor-svg"
        xmlns="http://www.w3.org2000/svg"
      >
        <g
          transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}
        >
          <PatternBackground
            dms={dms}
            xScale={xScale}
            yScale={yScale}
            height={dms.boundedHeight}
            width={dms.boundedWidth}
            hoveredDancer={props.hoveredDancer}
            positions={props.pattern.positions}
            fineGridEnabled={props.fineGridEnabled}
            draggedDancer={draggedDancer}
            draggedDancerPosition={draggedDancerPosition}
            showHeatmap={props.showHeatmap}
            discreteHeatmapEnabled={props.discreteHeatmapEnabled}
            patternRotation={props.patternRotation}
            selectedHeatmapTile={props.selectedHeatmapTile}
          />
        </g>

        <g
          transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}
          visibility={
            props.showHeatmap && props.discreteHeatmapEnabled
              ? "visible"
              : "hidden"
          }
          id="DiscreteHeatmap"
        >
          <DiscreteHeatmap
            xScale={xScale}
            yScale={yScale}
            highestFrequency={props.highestFrequency}
            heatmapData={props.discreteHeatmap}
            setSelectedHeatmapTile={props.setSelectedHeatmapTile}
          />
        </g>

        {
          <g
            transform={`translate(${[dms.marginLeft, dms.marginTop].join(
              ","
            )})`}
            visibility={
              props.showHeatmap && !props.discreteHeatmapEnabled
                ? "visible"
                : "hidden"
            }
            className="ContinuousHeatmap"
          >
            <ContinuousHeatmap
              xScale={xScale}
              yScale={yScale}
              highestFrequency={props.highestFrequency}
              heatmapData={props.discreteHeatmap}
              dms={dms}
              showHeatmap={props.showHeatmap}
              discreteHeatmapEnabled={props.discreteHeatmapEnabled}
            />
          </g>
        }

        {!props.showTransitions && !props.showShapes && (
          <NeighbourLineWrapper
            dms={dms}
            showHeatmap={props.showHeatmap}
            editingModeActive={props.editingModeActive}
            xScale={xScale}
            yScale={yScale}
            pattern={props.pattern}
            hoveredDancer={props.hoveredDancer}
            setCandidatesOnVerticalLine={setCandidatesOnVerticalLine}
            setCandidatesOnHorizontalLine={setCandidatesOnHorizontalLine}
            setCandidatesOnAscendingLine={setCandidatesOnAscendingLine}
            setCandidatesOnDescendingLine={setCandidatesOnDescendingLine}
            patternRotation={props.patternRotation}
          />
        )}

        <g
          transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}
          visibility={props.showShapes ? "visible" : "hidden"}
        >
          {props.pattern.shapes.map((shape) => (
            <g key={String(shape.id)}>
              <Shape
                xScale={xScale}
                yScale={yScale}
                shape={shape}
                positions={props.pattern.positions}
                selectedPattern={props.selectedPattern}
                showShapeCallout={showShapeCallout}
                patternRotation={props.patternRotation}
              />
            </g>
          ))}
        </g>

        {!props.showHeatmap && (
          <g
            transform={`translate(${[dms.marginLeft, dms.marginTop].join(
              ","
            )})`}
            visibility={props.showHeatmap ? "hidden" : "visible"}
          >
            <>
              {transitions()}

              {props.pattern.positions.map((danceCouple: DanceCouple) => (
                <g key={danceCouple.id}>
                  <Dancer
                    dms={dms}
                    id={2 * danceCouple.id - 1}
                    coupleId={danceCouple.id}
                    pos={danceCouple.position[0]}
                    previousPos={
                      props.hasPreviousPattern
                        ? props.previousPattern.positions[danceCouple.id - 1]
                            .position[0]
                        : danceCouple.position[0]
                    }
                    xScale={xScale}
                    yScale={yScale}
                    role={DancerRole.Gentleman}
                    gentlemanColor={props.gentlemanColor}
                    ladyColor={props.ladyColor}
                    coupleColor={props.coupleColor}
                    hoveredDancer={props.hoveredDancer}
                    setHoveredDancer={changeHoveredDancer}
                    draggedDancer={draggedDancer}
                    setDraggedDancer={setDraggedDancer}
                    setDraggedDancerPosition={setDraggedDancerPosition}
                    setMouseDownPosition={mouseDownOnBackground}
                    setMouseMovePosition={mouseMoveOnBackground}
                    setMouseUpPosition={mouseUpOnBackground}
                    showOrientations={props.showOrientations}
                    animationSpeed={props.animationSpeed}
                    selectedPattern={props.selectedPattern}
                    moveDancer={props.moveDancer}
                    rotateDancerBody={props.rotateDancerBody}
                    rotateDancerHead={props.rotateDancerHead}
                    currentMousePosition={currentMousePosition}
                    gridDragEnabled={props.gridDragEnabled}
                    mouseDownPosition={mouseDownPosition}
                    brushSelectedDancers={brushSelectedDancers}
                    firstDancerInBrush={firstDancerInBrush}
                    setBrushSelectedDancers={setBrushSelectedDancers}
                    setFirstDancerInBrush={setFirstDancerInBrush}
                    editingModeActive={props.editingModeActive}
                    danceCouple={danceCouple}
                    pattern={props.pattern}
                    previousPattern={props.previousPattern}
                    showShapes={props.showShapes}
                    addShape={props.addShape}
                    setShowModal={setShowModal}
                    isCalloutVisible={isJoinCalloutVisible}
                    showCallout={showJoinCallout}
                    candidatesOnHorizontalLine={candidatesOnHorizontalLine}
                    candidatesOnVerticalLine={candidatesOnVerticalLine}
                    candidatesOnAscendingLine={candidatesOnAscendingLine}
                    candidatesOnDescendingLine={candidatesOnDescendingLine}
                    setShowScalingComponent={setShowScalingComponent}
                    patternRotation={props.patternRotation}
                    currentlyInAnimation={props.currentlyInAnimation}
                    showTransitions={props.showTransitions}
                    selectedDancerForTransitions={selectedDancerForTransitions}
                    setSelectedDancerForTransitions={
                      setSelectedDancerForTransitions
                    }
                  />
                  <Dancer
                    dms={dms}
                    id={2 * danceCouple.id}
                    coupleId={danceCouple.id}
                    pos={danceCouple.position[1]}
                    previousPos={
                      props.hasPreviousPattern
                        ? props.previousPattern.positions[danceCouple.id - 1]
                            .position[1]
                        : danceCouple.position[1]
                    }
                    xScale={xScale}
                    yScale={yScale}
                    role={DancerRole.Lady}
                    gentlemanColor={props.gentlemanColor}
                    ladyColor={props.ladyColor}
                    coupleColor={props.coupleColor}
                    hoveredDancer={props.hoveredDancer}
                    setHoveredDancer={changeHoveredDancer}
                    draggedDancer={draggedDancer}
                    setDraggedDancer={setDraggedDancer}
                    setDraggedDancerPosition={setDraggedDancerPosition}
                    setMouseDownPosition={mouseDownOnBackground}
                    setMouseMovePosition={mouseMoveOnBackground}
                    setMouseUpPosition={mouseUpOnBackground}
                    showOrientations={props.showOrientations}
                    animationSpeed={props.animationSpeed}
                    selectedPattern={props.selectedPattern}
                    moveDancer={props.moveDancer}
                    rotateDancerBody={props.rotateDancerBody}
                    rotateDancerHead={props.rotateDancerHead}
                    currentMousePosition={currentMousePosition}
                    gridDragEnabled={props.gridDragEnabled}
                    mouseDownPosition={mouseDownPosition}
                    brushSelectedDancers={brushSelectedDancers}
                    setBrushSelectedDancers={setBrushSelectedDancers}
                    firstDancerInBrush={firstDancerInBrush}
                    setFirstDancerInBrush={setFirstDancerInBrush}
                    editingModeActive={props.editingModeActive}
                    danceCouple={danceCouple}
                    pattern={props.pattern}
                    previousPattern={props.previousPattern}
                    showShapes={props.showShapes}
                    addShape={props.addShape}
                    setShowModal={setShowModal}
                    isCalloutVisible={isJoinCalloutVisible}
                    showCallout={showJoinCallout}
                    candidatesOnHorizontalLine={candidatesOnHorizontalLine}
                    candidatesOnVerticalLine={candidatesOnVerticalLine}
                    candidatesOnAscendingLine={candidatesOnAscendingLine}
                    candidatesOnDescendingLine={candidatesOnDescendingLine}
                    setShowScalingComponent={setShowScalingComponent}
                    patternRotation={props.patternRotation}
                    currentlyInAnimation={props.currentlyInAnimation}
                    showTransitions={props.showTransitions}
                    selectedDancerForTransitions={selectedDancerForTransitions}
                    setSelectedDancerForTransitions={
                      setSelectedDancerForTransitions
                    }
                  />
                </g>
              ))}

              {previewDancers()}
            </>
          </g>
        )}

        <g
          transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}
          visibility={
            showScalingComponent &&
            props.editingModeActive &&
            !props.showShapes &&
            !props.showOrientations &&
            !props.showHeatmap &&
            !props.showTransitions
              ? "visible"
              : "hidden"
          }
          id="ScalingComponent"
        >
          <ScalingComponent
            brushSelectedDancers={brushSelectedDancers}
            dms={dms}
            verticalStartPosition={verticalScalingStartPosition}
            setVerticalStartPosition={setVerticalScalingStartPosition}
            horizontalStartPosition={horizontalScalingStartPosition}
            setHorizontalStartPosition={setHorizontalScalingStartPosition}
            setDelta={setScalingDelta}
            centerPosition={centerPosition}
          />
        </g>

        {props.editingModeActive && !props.showHeatmap && (
          <rect
            x={getBrushX(mouseMovePosition, mouseDownPosition)}
            y={getBrushY(mouseMovePosition, mouseDownPosition)}
            width={getBrushWidth(mouseMovePosition, mouseDownPosition)}
            height={getBrushHeight(mouseMovePosition, mouseDownPosition)}
            color="#aaaaaa"
            opacity={
              mouseDownPosition.x > 0 && mouseDownPosition.y > 0 ? 0.1 : 0.0
            }
          />
        )}

        <g
          transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}
        >
          {isJoinCalloutVisible && (
            <Callout
              transform={joinCalloutTransform}
              width={30}
              height={25}
              child={getCalloutContent()}
            />
          )}
        </g>

        <g>
          {isJoinAllCalloutVisible && (
            <Callout
              transform={joinAllCalloutTransform}
              width={120}
              height={25}
              child={getJoinAllCalloutContent()}
            />
          )}
        </g>

        <g
          transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}
        >
          {isShapeCalloutVisible && (
            <Callout
              transform={shapeCalloutTransform}
              width={65}
              height={25}
              child={
                <Button
                  onClick={(e) => {
                    props.removeShape(props.selectedPattern, shapeToDelete);
                  }}
                  variant="secondary"
                >
                  Delete
                </Button>
              }
            />
          )}
        </g>
      </svg>

      <SaveToDraftModal
        showModal={showDraftModal}
        setShowModal={setShowDraftModal}
        pattern={props.pattern}
        addPatternToDraft={props.addPatternToDraft}
      />
    </div>
  );
}

export default PatternView;
