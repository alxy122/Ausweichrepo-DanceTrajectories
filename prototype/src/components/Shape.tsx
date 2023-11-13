import { ShapeProps } from "../interfaces/PatternView";
import { useState } from "react";
import "../styles/Visualization.css";
import { getPositionAfterPatterRotation } from "../services/VisServices";

function Shape(props: ShapeProps) {
  function getPoints() {
    let resultingPoints = "";
    props.shape.polyline.lineSegments.forEach((lineSegment) => {
      resultingPoints += props.xScale(
        getPositionAfterPatterRotation(
          props.positions[Math.floor((lineSegment.sourceId - 1) / 2)].position[
            (lineSegment.sourceId - 1) % 2
          ],
          props.patternRotation
        ).x
      );
      resultingPoints += ",";
      resultingPoints += props.yScale(
        getPositionAfterPatterRotation(
          props.positions[Math.floor((lineSegment.sourceId - 1) / 2)].position[
            (lineSegment.sourceId - 1) % 2
          ],
          props.patternRotation
        ).y
      );
      resultingPoints += " ";
    });
    return resultingPoints;
  }

  const [isHovered, setIsHovered] = useState(false);
  function getPolygonFill() {
    if (isHovered) {
      return "#9edaf7";
    }
    return "#c3e8fa";
  }

  return (
    <g>
      <polygon
        points={getPoints()}
        fill={getPolygonFill()}
        stroke={getPolygonFill()}
        strokeWidth="2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={(e) => {
          e.preventDefault();
          props.showShapeCallout(props.shape.id);
        }}
      />
    </g>
  );
}

export default Shape;
