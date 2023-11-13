import { useMemo } from "react";
import { DanceCouple, Pattern } from "../interfaces/Choreography";
import { AxisProps } from "../interfaces/PatternView";
import {
  calcSimpleCoordinatesAfterRotation,
  isHighlighted,
  isInteger,
} from "../services/VisServices";

import "../styles/App.css";

const fontScaling = 0.028;

const normalFontColor = "Black";
const dampedFontColor = "LightGray";

function isAxisDescriptionVisible(
  value: number,
  selectedDancer: number,
  positions: DanceCouple[],
  axisAlignment: "horizontal" | "vertical",
  draggedDancerPosition: { x: number; y: number },
  draggedDancer: number,
  patternRotation: "Front" | "Back" | "Left" | "Right",
  showHeatmap: boolean,
  selectedHeatmapTile: { x: number; y: number }
) {
  if (
    isHighlighted(
      value,
      selectedDancer,
      positions,
      axisAlignment,
      showHeatmap ? selectedHeatmapTile : draggedDancerPosition,
      showHeatmap ? "Front" : patternRotation
    )
  ) {
    return true;
  }

  if (draggedDancer > -1) {
    if (axisAlignment === "horizontal") {
      if (draggedDancer > -1) {
        if (Math.abs(draggedDancerPosition.y - value) <= 0.5) {
          return false;
        }
      }
    } else {
      if (draggedDancer > -1) {
        if (Math.abs(draggedDancerPosition.x - value) <= 0.5) {
          return false;
        }
      }
    }
  }

  if (showHeatmap) {
    if (axisAlignment === "horizontal") {
      if (Math.abs(selectedHeatmapTile.y - value) <= 0.5) {
        return false;
      }
    } else {
      if (Math.abs(selectedHeatmapTile.x - value) <= 0.5) {
        return false;
      }
    }
  }

  if (selectedDancer > -1) {
    const coupleNumber: number = Math.floor((selectedDancer - 1) / 2);
    const dancerNumberInDanceCouple: number = (selectedDancer - 1) % 2;

    if (axisAlignment === "horizontal") {
      const selectedDancerXPosition: number =
        calcSimpleCoordinatesAfterRotation(
          positions[coupleNumber].position[dancerNumberInDanceCouple],
          patternRotation
        ).x;

      if (Math.abs(selectedDancerXPosition - value) <= 0.5) {
        return false;
      }
    } else {
      const selectedDancerYPosition: number =
        calcSimpleCoordinatesAfterRotation(
          positions[coupleNumber].position[dancerNumberInDanceCouple],
          patternRotation
        ).y;

      if (Math.abs(selectedDancerYPosition - value) <= 0.5) {
        return false;
      }
    }
  }

  if (isInteger(value)) {
    return true;
  }

  return false;
}

export function BottomAxis(props: AxisProps) {
  const domain = props.scale.domain();
  const range = props.scale.range();

  const ticks = useMemo(() => {
    const numTicks = (Math.abs(domain[0]) + domain[1]) * 2 + 1;
    return props.scale.ticks(numTicks).map((value) => ({
      value,
      xOffset: props.scale(value),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.scale.domain().join("-"), props.scale.range().join("-")]);

  function getValueAfterRotation(value: number) {
    if (props.patternRotation === "Back" || props.patternRotation === "Right") {
      return -value;
    }
    return value;
  }

  return (
    <g>
      <path
        d={["M", range[0], 6, "v", -6, "H", range[1], "v", 6].join(" ")}
        fill="none"
        stroke="currentColor"
        visibility={props.showHeatmap ? "hidden" : "visible"}
      />
      {ticks.map(({ value, xOffset }) => (
        <g key={value} transform={`translate(${xOffset}, 0)`}>
          <line
            y2="6"
            stroke="currentcolor"
            visibility={props.showHeatmap ? "hidden" : "visible"}
          />
          <text
            key={value}
            visibility={
              isAxisDescriptionVisible(
                value,
                props.selectedDancer,
                props.positions,
                "horizontal",
                props.draggedDancerPosition,
                props.draggedDancer,
                props.patternRotation,
                props.showHeatmap,
                props.selectedHeatmapTile
              )
                ? "visible"
                : "hidden"
            }
            style={{
              fontSize: fontScaling * props.dms.boundedWidth,
              transform: "translateY(" + props.dms.boundedWidth / 20 + "px)",
              fill:
                props.selectedDancer > -1 ||
                (props.showHeatmap && props.discreteHeatmapEnabled)
                  ? isHighlighted(
                      value,
                      props.selectedDancer,
                      props.positions,
                      "horizontal",
                      props.showHeatmap
                        ? props.selectedHeatmapTile
                        : props.draggedDancerPosition,
                      props.patternRotation
                    )
                    ? normalFontColor
                    : dampedFontColor
                  : normalFontColor,
              fontWeight:
                props.selectedDancer > -1 ||
                props.draggedDancer > -1 ||
                (props.showHeatmap && props.selectedHeatmapTile.x > -9)
                  ? isHighlighted(
                      value,
                      props.selectedDancer,
                      props.positions,
                      "horizontal",
                      props.showHeatmap
                        ? props.selectedHeatmapTile
                        : props.draggedDancerPosition,
                      props.patternRotation
                    )
                    ? "bold"
                    : "normal"
                  : "normal",
              textAnchor: "middle",
            }}
            className="unselectable-text"
          >
            {getValueAfterRotation(value)}
          </text>
        </g>
      ))}
    </g>
  );
}

export function TopAxis(props: AxisProps) {
  const domain = props.scale.domain();
  const range = props.scale.range();

  const ticks = useMemo(() => {
    const numTicks = (Math.abs(domain[0]) + domain[1]) * 2 + 1;
    return props.scale.ticks(numTicks).map((value) => ({
      value,
      xOffset: props.scale(value),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.scale.domain().join("-"), props.scale.range().join("-")]);

  function getValueAfterRotation(value: number) {
    if (props.patternRotation === "Back" || props.patternRotation === "Right") {
      return -value;
    }
    return value;
  }

  return (
    <g>
      <path
        d={["M", range[0], -6, "v", 6, "H", range[1], "v", -6].join(" ")}
        fill="none"
        stroke="currentColor"
        visibility={props.showHeatmap ? "hidden" : "visible"}
      />
      {ticks.map(({ value, xOffset }) => (
        <g key={value} transform={`translate(${xOffset}, 0)`}>
          <line
            y2="-6"
            stroke="currentColor"
            visibility={props.showHeatmap ? "hidden" : "visible"}
          />
          <text
            key={value}
            visibility={
              isAxisDescriptionVisible(
                value,
                props.selectedDancer,
                props.positions,
                "horizontal",
                props.draggedDancerPosition,
                props.draggedDancer,
                props.patternRotation,
                props.showHeatmap,
                props.selectedHeatmapTile
              )
                ? "visible"
                : "hidden"
            }
            style={{
              fontSize: fontScaling * props.dms.boundedWidth,
              transform: "translateY(" + props.dms.boundedWidth / -30 + "px)",
              fill:
                props.selectedDancer > -1 ||
                (props.showHeatmap && props.discreteHeatmapEnabled)
                  ? isHighlighted(
                      value,
                      props.selectedDancer,
                      props.positions,
                      "horizontal",
                      props.showHeatmap
                        ? props.selectedHeatmapTile
                        : props.draggedDancerPosition,
                      props.patternRotation
                    )
                    ? normalFontColor
                    : dampedFontColor
                  : normalFontColor,
              fontWeight:
                props.selectedDancer > -1 ||
                props.draggedDancer > -1 ||
                props.showHeatmap
                  ? isHighlighted(
                      value,
                      props.selectedDancer,
                      props.positions,
                      "horizontal",
                      props.showHeatmap
                        ? props.selectedHeatmapTile
                        : props.draggedDancerPosition,
                      props.patternRotation
                    )
                    ? "bold"
                    : "normal"
                  : "normal",
              textAnchor: "middle",
            }}
            className="unselectable-text"
          >
            {getValueAfterRotation(value)}
          </text>
        </g>
      ))}
    </g>
  );
}

export function LeftAxis(props: AxisProps) {
  const domain = props.scale.domain();
  const range = props.scale.range();

  const ticks = useMemo(() => {
    const numTicks = (Math.abs(domain[0]) + Math.abs(domain[1])) * 2 + 1;
    return props.scale.ticks(numTicks).map((value) => ({
      value,
      yOffset: props.scale(value),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.scale.domain().join("-"), props.scale.range().join("_")]);

  function getValueAfterRotation(value: number) {
    if (props.patternRotation === "Left" || props.patternRotation === "Back") {
      return -value;
    }
    return value;
  }

  return (
    <g>
      <path
        d={["M", -6, range[0], "h", 6, "V", range[1], "h", -6].join(" ")}
        fill="none"
        stroke="currentColor"
        visibility={props.showHeatmap ? "hidden" : "visible"}
      />
      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(0, ${yOffset})`}>
          <line
            x2="-6"
            stroke="currentColor"
            visibility={props.showHeatmap ? "hidden" : "visible"}
          />
          <text
            key={value}
            visibility={
              isAxisDescriptionVisible(
                value,
                props.selectedDancer,
                props.positions,
                "vertical",
                props.draggedDancerPosition,
                props.draggedDancer,
                props.patternRotation,
                props.showHeatmap,
                props.selectedHeatmapTile
              )
                ? "visible"
                : "hidden"
            }
            style={{
              fontSize: fontScaling * props.dms.boundedWidth,
              transform:
                "translateX(" +
                props.dms.boundedWidth / -25 +
                "px) translateY(" +
                props.dms.boundedWidth / 120 +
                "px)",
              fill:
                props.selectedDancer > -1 ||
                (props.showHeatmap && props.discreteHeatmapEnabled)
                  ? isHighlighted(
                      value,
                      props.selectedDancer,
                      props.positions,
                      "vertical",
                      props.showHeatmap
                        ? props.selectedHeatmapTile
                        : props.draggedDancerPosition,
                      props.patternRotation
                    )
                    ? normalFontColor
                    : dampedFontColor
                  : normalFontColor,
              fontWeight:
                props.selectedDancer > -1 ||
                props.draggedDancer > -1 ||
                props.showHeatmap
                  ? isHighlighted(
                      value,
                      props.selectedDancer,
                      props.positions,
                      "vertical",
                      props.showHeatmap
                        ? props.selectedHeatmapTile
                        : props.draggedDancerPosition,
                      props.patternRotation
                    )
                    ? "bold"
                    : "normal"
                  : "normal",
              textAnchor: "middle",
            }}
            className="unselectable-text"
          >
            {getValueAfterRotation(value)}
          </text>
        </g>
      ))}
    </g>
  );
}

export function RightAxis(props: AxisProps) {
  const domain = props.scale.domain();
  const range = props.scale.range();

  const ticks = useMemo(() => {
    const numTicks = (Math.abs(domain[0]) + Math.abs(domain[1])) * 2 + 1;
    return props.scale.ticks(numTicks).map((value) => ({
      value,
      yOffset: props.scale(value),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.scale.domain().join("-"), props.scale.range().join("_")]);

  function getValueAfterRotation(value: number) {
    if (props.patternRotation === "Left" || props.patternRotation === "Back") {
      return -value;
    }
    return value;
  }

  return (
    <g>
      <path
        d={["M", 6, range[0], "h", -6, "V", range[1], "h", 6].join(" ")}
        fill="none"
        stroke="currentColor"
        visibility={props.showHeatmap ? "hidden" : "visible"}
      />
      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(0, ${yOffset})`}>
          <line
            x2="6"
            stroke="currentColor"
            visibility={props.showHeatmap ? "hidden" : "visible"}
          />
          <text
            key={value}
            visibility={
              isAxisDescriptionVisible(
                value,
                props.selectedDancer,
                props.positions,
                "vertical",
                props.draggedDancerPosition,
                props.draggedDancer,
                props.patternRotation,
                props.showHeatmap,
                props.selectedHeatmapTile
              )
                ? "visible"
                : "hidden"
            }
            style={{
              fontSize: fontScaling * props.dms.boundedWidth,
              transform:
                "translateX(" +
                props.dms.boundedWidth / 25 +
                "px) translateY(" +
                props.dms.boundedWidth / 120 +
                "px)",
              fill:
                props.selectedDancer > -1 ||
                (props.showHeatmap && props.discreteHeatmapEnabled)
                  ? isHighlighted(
                      value,
                      props.selectedDancer,
                      props.positions,
                      "vertical",
                      props.showHeatmap
                        ? props.selectedHeatmapTile
                        : props.draggedDancerPosition,
                      props.patternRotation
                    )
                    ? normalFontColor
                    : dampedFontColor
                  : normalFontColor,
              fontWeight:
                props.selectedDancer > -1 ||
                props.draggedDancer > -1 ||
                props.showHeatmap
                  ? isHighlighted(
                      value,
                      props.selectedDancer,
                      props.positions,
                      "vertical",
                      props.showHeatmap
                        ? props.selectedHeatmapTile
                        : props.draggedDancerPosition,
                      props.patternRotation
                    )
                    ? "bold"
                    : "normal"
                  : "normal",
              textAnchor: "middle",
            }}
            className="unselectable-text"
          >
            {getValueAfterRotation(value)}
          </text>
        </g>
      ))}
    </g>
  );
}
