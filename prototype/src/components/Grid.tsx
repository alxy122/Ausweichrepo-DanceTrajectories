import { useMemo } from "react";
import { isHighlighted, isInteger } from "../services/VisServices";

import { GridProps } from "../interfaces/PatternView";

function Grid(props: GridProps) {
  const xScale = props.xScale;
  const yScale = props.yScale;
  const xDomain = xScale.domain();
  const xRange = xScale.range();
  const yDomain = yScale.domain();
  const yRange = yScale.range();

  const verticalLines = useMemo(() => {
    const numLines = (Math.abs(xDomain[0]) + Math.abs(xDomain[1])) * 2 + 1;
    let lines = xScale.ticks(numLines).map((value) => ({
      value,
      xOffset: xScale(value),
    }));
    return lines;
  }, [xScale, xDomain]);

  const horizontalLines = useMemo(() => {
    const numLines = (Math.abs(yDomain[0]) + Math.abs(yDomain[1])) * 2 + 1;
    let lines = yScale.ticks(numLines).map((value) => ({
      value,
      yOffset: yScale(value),
    }));
    return lines;
  }, [yScale, yDomain]);

  function getLineColor(
    value: number,
    alignment: "horizontal" | "vertical"
  ): string {
    if (
      isHighlighted(
        value,
        props.selectedDancer,
        props.positions,
        alignment,
        calcCoordinatesAfterRotation(
          props.draggedDancerPosition,
          props.patternRotation
        ),
        props.patternRotation
      )
    ) {
      return "#000000";
    }

    if (value === 0) return "gray";

    if (props.fineGridEnabled) {
      return isInteger(value) ? "#aaaaaa" : "lightGray";
    }
    return "lightGray";
  }

  function calcCoordinatesAfterRotation(
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

  function getStrokeOpacity(
    value: number,
    alignment: "horizontal" | "vertical"
  ) {
    if (
      isHighlighted(
        value,
        props.selectedDancer,
        props.positions,
        alignment,
        calcCoordinatesAfterRotation(
          props.draggedDancerPosition,
          props.patternRotation
        ),
        props.patternRotation
      )
    ) {
      return "100%";
    }

    if (!isInteger(value)) {
      if (props.fineGridEnabled) {
        return "100%";
      } else {
        return "0%";
      }
    }

    return "100%";
  }

  return (
    <g visibility={props.showHeatmap ? "hidden" : "visible"}>
      <g>
        {verticalLines.map(({ value, xOffset }) => (
          <g key={value} transform={`translate(${xOffset}, 0)`}>
            <line
              y2={yRange[1]}
              stroke={getLineColor(value, "horizontal")}
              strokeOpacity={getStrokeOpacity(value, "horizontal")}
            />
          </g>
        ))}
      </g>
      <g visibility={props.showHeatmap ? "hidden" : "visible"}>
        {horizontalLines.map(({ value, yOffset }) => (
          <g key={value} transform={`translate(0, ${yOffset})`}>
            <line
              x2={xRange[1]}
              stroke={getLineColor(value, "vertical")}
              strokeOpacity={getStrokeOpacity(value, "vertical")}
            />
          </g>
        ))}
      </g>
    </g>
  );
}

export default Grid;
