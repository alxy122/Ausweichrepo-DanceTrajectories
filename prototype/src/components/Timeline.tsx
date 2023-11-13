import { useEffect, useRef, useState } from "react";
import "../styles/Timeline.css";
import "../styles/Visualization.css";
import { TimelineProps } from "../interfaces/Timeline";
import MiniPatternView from "./MiniPatternView";
import Callout from "./Callout";
import { PlusCircle } from "react-bootstrap-icons";
import SetBarAndBeatModal from "./SetBarAndBeatModal";
import { ReassuranceModal } from "./ReassuranceModal";

function Timeline(props: TimelineProps) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => {
    if (props.editingModeActive) {
      setShow(true);
    }
  };
  const [selectedBarModal, setSelectedBarModal] = useState(-1);
  const [selectedBeatModal, setSelectedBeatModal] = useState(-1);

  const [showReassuranceModal, setShowReassuranceModal] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

  const [selectedBar, setSelectedBar] = useState<number>(-1);
  const [selectedBeat, setSelectedBeat] = useState<number>(-1);

  const [
    newIntermediatePatternMarkerVisible,
    setNewIntermediatePatternMarkerVisible,
  ] = useState(true);

  const [hoveredNewBarArea, setHoveredNewBarArea] = useState(false);

  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const [calloutTransform, setCalloutTransform] = useState("");

  function showCallout(xPosition: number, yPosition: number) {
    setIsCalloutVisible(false);
    setCalloutTransform(`translate(${xPosition}, ${yPosition})`);
    setIsCalloutVisible(true);
  }

  function hideCallout() {
    setIsCalloutVisible(false);
  }

  const barWidth: number = 200;
  const beatWidth: number = barWidth / 8;

  const timelineHeight: number = 80;

  const quarterTickWidth = 3;
  const eighthTickWidth = 1;

  const quarterTickMapValues = [0, 1, 2, 3];
  const eighthTickMapValues = [1, 3, 5, 7];

  const beatMapValues = [0, 1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    const localHighestBarNumber =
      props.choreo.patterns[props.choreo.patterns.length - 1].bar + 1;
    let temp: number[] = [];
    for (let i = 0; i <= localHighestBarNumber; i++) {
      temp.push(i);
    }
    props.setHighestBarNumber(localHighestBarNumber);
    props.setTimelineMapValues(temp);
  }, []);

  useEffect(() => {
    if (divRef.current) {
      let scrollX = props.choreo.patterns[props.selectedPattern].bar * barWidth;
      if (scrollX > window.innerWidth / 2) {
        scrollX -= window.innerWidth / 2;
      }
      divRef.current.scrollTo(scrollX, 0);
    }
  }, [props.selectedPattern]);

  function getBarFill(barNumber: number, isInChoreo: boolean) {
    if (isInChoreo) {
      return "#e1e1fc";
    }
    if (barNumber % 2 < 1) {
      return "#eeeeee";
    }

    return "#dddddd";
  }

  function getBeatFill(bar: number, beat: number) {
    if (bar === selectedBar && beat === selectedBeat) {
      return "#bbbbbb";
    }

    let isInChoreo = false;
    props.choreo.patterns.forEach((pattern) => {
      if (pattern.beat === beat && pattern.bar === bar) {
        isInChoreo = true;
        return;
      }
    });

    return getBarFill(bar, isInChoreo);
  }

  function mouseEnterBeat(barNumber: number, beatNumber: number) {
    setSelectedBeat(beatNumber);
    setSelectedBar(barNumber);

    let found = false;
    props.choreo.patterns.forEach((pattern) => {
      if (pattern.bar === barNumber && pattern.beat === beatNumber) {
        found = true;
        return;
      }
    });
    if (found) {
      setNewIntermediatePatternMarkerVisible(false);
    } else {
      setNewIntermediatePatternMarkerVisible(true);
    }

    const miniPatternView = getMiniPatternView(barNumber, beatNumber);
    if (miniPatternView !== undefined) {
      showCallout(barWidth * barNumber + (beatNumber * barWidth) / 8 + 32, 0);
    }
  }

  function mouseLeaveBeat() {
    setSelectedBeat(-1);
    setSelectedBar(-1);
    hideCallout();
  }

  function mouseClickBeat(barNumber: number, beatNumber: number) {
    if (
      barNumber === props.choreo.patterns[props.selectedPattern].bar &&
      beatNumber === props.choreo.patterns[props.selectedPattern].beat
    ) {
      setSelectedBarModal(props.choreo.patterns[props.selectedPattern].bar);
      setSelectedBeatModal(props.choreo.patterns[props.selectedPattern].beat);
      handleShow();
      return;
    }

    let searchedPatternId = -1;

    props.choreo.patterns.forEach((pattern) => {
      if (pattern.bar === barNumber && pattern.beat === beatNumber) {
        searchedPatternId = pattern.id;
      }
    });
    if (searchedPatternId > -1) {
      props.setSelectedPattern(searchedPatternId);
    } else {
      if (props.editingModeActive) {
        props.addIntermediatePattern(barNumber, beatNumber);
      }
    }

    setSelectedBarModal(props.choreo.patterns[props.selectedPattern].bar);
    setSelectedBeatModal(props.choreo.patterns[props.selectedPattern].beat);
  }

  function applyModalValues() {
    props.setBarAndBeat(
      props.selectedPattern,
      selectedBarModal,
      selectedBeatModal,
      props.highestBarNumber
    );
    handleClose();
  }

  function getMiniPatternView(barNumber: number, beatNumber: number) {
    let hoveredPattern = -1;
    props.choreo.patterns.forEach((pattern) => {
      if (pattern.beat === beatNumber && pattern.bar === barNumber) {
        hoveredPattern = pattern.id;
        return;
      }
    });

    if (hoveredPattern === -1) {
      return undefined;
    }

    return (
      <MiniPatternView
        danceFloor={props.choreo.danceFloor}
        pattern={props.choreo.patterns[hoveredPattern]}
        gentlemanColor={props.gentlemanColor}
        ladyColor={props.ladyColor}
        coupleColor={props.coupleColor}
      />
    );
  }

  return (
    <div
      ref={divRef}
      className="not-for-mobile my-footer timeline adaptive-timeline"
    >
      <svg
        width={(props.highestBarNumber + 1) * barWidth}
        height={timelineHeight}
      >
        {props.timelineMapValues.map((barNumber) => (
          <g
            transform={`translate(${barWidth * barNumber},${0})`}
            key={String(barNumber)}
          >
            <rect
              x={0}
              y={0}
              width={barWidth}
              height={timelineHeight}
              strokeWidth="1"
            />

            {beatMapValues.map((beatNumber) => (
              <rect
                x={(beatNumber * barWidth) / 8}
                y={0}
                width={barWidth / 8}
                height={timelineHeight}
                stroke="none"
                fill={getBeatFill(barNumber, beatNumber)}
                onMouseEnter={() => mouseEnterBeat(barNumber, beatNumber)}
                onMouseLeave={() => mouseLeaveBeat()}
                onClick={() => mouseClickBeat(barNumber, beatNumber)}
                className="pointer-cursor"
                key={String(beatNumber)}
              />
            ))}

            {quarterTickMapValues.map((i) => (
              <line
                x1={(i * barWidth) / 4}
                y1={0}
                x2={(i * barWidth) / 4}
                y2={timelineHeight / 8}
                stroke="black"
                strokeWidth={quarterTickWidth}
                key={String(i)}
              />
            ))}

            {eighthTickMapValues.map((i) => (
              <line
                x1={(i * barWidth) / 8}
                y1={0}
                x2={(i * barWidth) / 8}
                y2={timelineHeight / 12}
                stroke="black"
                strokeWidth={eighthTickWidth}
                key={String(i)}
              />
            ))}

            <text
              x={5}
              y={timelineHeight - 5}
              className="unselectable-text"
              fontSize="10"
            >
              {barNumber + 1}
            </text>
          </g>
        ))}
        <g
          transform={`translate(${
            barWidth * selectedBar + beatWidth * selectedBeat
          },${0})`}
        >
          <circle
            cx={beatWidth / 2}
            cy={0.5 * timelineHeight - 5}
            r="5"
            fill="black"
            visibility={
              newIntermediatePatternMarkerVisible && props.editingModeActive
                ? "visible"
                : "hidden"
            }
            id="marker"
            className="marker"
          />
        </g>
        <g transform={`translate(${barWidth * props.highestBarNumber},${0})`}>
          <rect
            x={0}
            y={0}
            width={barWidth}
            height={timelineHeight}
            fill={
              hoveredNewBarArea
                ? "#bbbbbb"
                : props.timelineMapValues.length % 2 !== 0
                ? "#eeeeee"
                : "#dddddd"
            }
            strokeWidth="1"
            id="newBarField"
            onMouseEnter={() => setHoveredNewBarArea(true)}
            onMouseLeave={() => setHoveredNewBarArea(false)}
            onClick={() => props.addNewBar()}
          />
          <PlusCircle
            fontSize={!hoveredNewBarArea ? 24 : 28}
            x={!hoveredNewBarArea ? barWidth / 2 - 12 : barWidth / 2 - 14}
            y={
              !hoveredNewBarArea
                ? timelineHeight / 2 - 12
                : timelineHeight / 2 - 14
            }
            onMouseEnter={() => setHoveredNewBarArea(true)}
            onMouseLeave={() => setHoveredNewBarArea(false)}
            onClick={() => props.addNewBar()}
          />
        </g>
        {props.choreo.patterns.map((pattern) => (
          <g
            transform={`translate(${
              pattern.id < 10
                ? pattern.bar * barWidth + pattern.beat * beatWidth + 8
                : pattern.bar * barWidth + pattern.beat * beatWidth + 3
            },${0})`}
            key={String(pattern.id)}
          >
            <text
              x={0}
              y={
                props.choreo.patterns[props.selectedPattern].bar ===
                  pattern.bar &&
                props.choreo.patterns[props.selectedPattern].beat ===
                  pattern.beat
                  ? timelineHeight / 2.5
                  : timelineHeight / 2
              }
              className="unselectable-text pointer-cursor"
              fontWeight={
                props.selectedPattern === pattern.id ? "bold" : "normal"
              }
              onMouseEnter={() => mouseEnterBeat(pattern.bar, pattern.beat)}
              onMouseLeave={() => mouseLeaveBeat()}
              onClick={() => mouseClickBeat(pattern.bar, pattern.beat)}
            >
              {pattern.id}
            </text>
          </g>
        ))}
        {props.choreo.patterns.map((pattern) => (
          <g
            transform={`translate(${
              pattern.bar * barWidth + pattern.beat * beatWidth + 3
            },${0})`}
            key={String(pattern.id)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x={0}
              y={timelineHeight / 2}
              width="16"
              height="16"
              visibility={
                props.choreo.patterns[props.selectedPattern].bar ===
                  pattern.bar &&
                props.choreo.patterns[props.selectedPattern].beat ===
                  pattern.beat
                  ? "visible"
                  : "hidden"
              }
              fill="currentColor"
              className="bi bi-pencil"
              viewBox="0 0 16 16"
              onMouseEnter={() => mouseEnterBeat(pattern.bar, pattern.beat)}
              onMouseLeave={() => mouseLeaveBeat()}
              onClick={() => mouseClickBeat(pattern.bar, pattern.beat)}
            >
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
            </svg>
          </g>
        ))}
        {props.choreo.patterns.map((pattern) => (
          <g key={String(pattern.id)}>
            {pattern.id > 0 && (
              <line
                x1={
                  props.choreo.patterns[pattern.id - 1].bar * barWidth +
                  props.choreo.patterns[pattern.id - 1].beat * beatWidth +
                  beatWidth
                }
                x2={pattern.bar * barWidth + pattern.beat * beatWidth}
                y1={0.5 * timelineHeight - 5}
                y2={0.5 * timelineHeight - 5}
                stroke="black"
                strokeWidth="3"
                className="pointer-cursor"
              />
            )}
          </g>
        ))}
        ;
        {props.choreo.patterns.map((pattern) => (
          <g key={String(pattern.id)}>
            {pattern.intermediatePatterns.map((intermediatePattern) => (
              <g
                transform={`translate(${
                  intermediatePattern.bar * barWidth +
                  intermediatePattern.beat * beatWidth
                },${0})`}
              >
                <circle
                  cx={beatWidth / 2}
                  cy={0.5 * timelineHeight - 5}
                  r="5"
                />
              </g>
            ))}
          </g>
        ))}
        ;
        <g id="callout-group">
          {isCalloutVisible && (
            <Callout
              transform={calloutTransform}
              width={64}
              height={64}
              child={getMiniPatternView(selectedBar, selectedBeat)}
            />
          )}
        </g>
      </svg>

      <SetBarAndBeatModal
        show={show}
        handleClose={handleClose}
        selectedBarModal={selectedBarModal}
        setSelectedBarModal={setSelectedBarModal}
        selectedBeatModal={selectedBeatModal}
        setSelectedBeatModal={setSelectedBeatModal}
        highestBarNumber={props.highestBarNumber}
        setShowReassuranceModal={setShowReassuranceModal}
        applyModalValues={applyModalValues}
      />

      <ReassuranceModal
        showReassuranceModal={showReassuranceModal}
        setShowReassuranceModal={setShowReassuranceModal}
        selectedPattern={props.selectedPattern}
        removePattern={props.removePattern}
      />
    </div>
  );
}

export default Timeline;
