import { POVArrowProps } from "../interfaces/PatternView";

function POVArrow(props: POVArrowProps) {
  function getFirstLineStart() {
    switch (props.patternRotation) {
      case "Front":
        return { x: props.xScale(-0.25), y: props.yScale(8) };
      case "Back":
        return { x: props.xScale(-0.25), y: props.yScale(-8) };
      case "Left":
        return { x: props.xScale(8), y: props.yScale(0.25) };
      case "Right":
        return { x: props.xScale(-8), y: props.yScale(-0.25) };
    }
  }

  function getFirstLineEnd() {
    switch (props.patternRotation) {
      case "Front":
        return { x: props.xScale(0), y: props.yScale(8.3) };
      case "Back":
        return { x: props.xScale(0), y: props.yScale(-8.3) };
      case "Left":
        return { x: props.xScale(8.3), y: props.yScale(0) };
      case "Right":
        return { x: props.xScale(-8.3), y: props.yScale(0) };
    }
  }

  function getSecondLineStart() {
    switch (props.patternRotation) {
      case "Front":
        return { x: props.xScale(0.25), y: props.yScale(8) };
      case "Back":
        return { x: props.xScale(0.25), y: props.yScale(-8) };
      case "Left":
        return { x: props.xScale(8), y: props.yScale(-0.25) };
      case "Right":
        return { x: props.xScale(-8), y: props.yScale(0.25) };
    }
  }

  function getSecondLineEnd() {
    switch (props.patternRotation) {
      case "Front":
        return { x: props.xScale(0), y: props.yScale(8.3) };
      case "Back":
        return { x: props.xScale(0), y: props.yScale(-8.3) };
      case "Left":
        return { x: props.xScale(8.3), y: props.yScale(0) };
      case "Right":
        return { x: props.xScale(-8.3), y: props.yScale(0) };
    }
  }

  return (
    <>
      <line
        x1={getFirstLineStart().x}
        y1={getFirstLineStart().y}
        x2={getFirstLineEnd().x}
        y2={getFirstLineEnd().y}
        stroke="black"
        strokeWidth="3"
      />
      <line
        x1={getSecondLineStart().x}
        y1={getSecondLineStart().y}
        x2={getSecondLineEnd().x}
        y2={getSecondLineEnd().y}
        stroke="black"
        strokeWidth="3"
      />
    </>
  );
}

export default POVArrow;
