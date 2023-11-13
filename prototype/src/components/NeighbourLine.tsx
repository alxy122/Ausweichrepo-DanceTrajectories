import { useEffect, useState } from "react";
import { NeighbourLineProps } from "../interfaces/PatternView";

function NeighbourLine(props: NeighbourLineProps) {
  function getStrokeWidth() {
    if (props.hoveredDancer > -1) {
      if (
        props.orientation === "vertical" ||
        props.orientation === "horizontal"
      ) {
        return "3";
      } else {
        return "3";
      }
    } else {
      return "0";
    }
  }

  const [position, setPosition] = useState({
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  });

  useEffect(() => {
    const minPosition = calcCoordinatesAfterRotation(
      { x: props.positions.minX, y: props.positions.minY },
      props.patternRotation
    );
    const maxPosition = calcCoordinatesAfterRotation(
      { x: props.positions.maxX, y: props.positions.maxY },
      props.patternRotation
    );

    setPosition({
      minX: minPosition.x,
      minY: minPosition.y,
      maxX: maxPosition.x,
      maxY: maxPosition.y,
    });
  }, [props.patternRotation, props.positions]);

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

  return (
    <>
      {props.hoveredDancer > -1 && (
        <line
          x1={props.xScale(position.minX)}
          y1={props.yScale(position.minY)}
          x2={props.xScale(position.maxX)}
          y2={props.yScale(position.maxY)}
          stroke="black"
          strokeWidth={getStrokeWidth()}
        />
      )}
    </>
  );
}

export default NeighbourLine;
