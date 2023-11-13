import { useEffect, useState } from "react";
import { ScalingComponentProps } from "../interfaces/PatternView";
import { getBoundingClientRect } from "../services/VisServices";
import "../styles/Visualization.css";

function ScalingComponent(props: ScalingComponentProps) {
  const [hovered, setHovered] = useState<boolean>(false);

  const [lineLength, setLineLength] = useState<number>(0);

  useEffect(() => {
    setLineLength(Number(props.dms.boundedWidth) / 5);
  }, [props.dms.boundedWidth]);

  function getFill() {
    if (hovered) return "black";
    return "gray";
  }

  function startVerticalScaling(e: any) {
    const boundingRect = getBoundingClientRect("chart-wrapper");
    props.setVerticalStartPosition({
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    });
    e.stopPropagation();
  }

  function startHorizontalScaling(e: any) {
    const boundingRect = getBoundingClientRect("chart-wrapper");
    props.setHorizontalStartPosition({
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    });
    e.stopPropagation();
  }

  return (
    <g>
      <line
        x1={props.centerPosition.x}
        x2={props.centerPosition.x + lineLength}
        y1={props.centerPosition.y}
        y2={props.centerPosition.y}
        stroke={getFill()}
        strokeWidth={1}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <line
        x1={props.centerPosition.x}
        x2={props.centerPosition.x}
        y1={props.centerPosition.y}
        y2={props.centerPosition.y - lineLength}
        stroke={getFill()}
        strokeWidth={1}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <circle
        cx={props.centerPosition.x + lineLength}
        cy={props.centerPosition.y}
        r="5"
        fill={getFill()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseDown={(e) => startHorizontalScaling(e)}
        className="pointer-cursor"
      />
      <circle
        cx={props.centerPosition.x}
        cy={props.centerPosition.y - lineLength}
        r="5"
        fill={getFill()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseDown={(e) => startVerticalScaling(e)}
        className="pointer-cursor"
      />
    </g>
  );
}

export default ScalingComponent;
