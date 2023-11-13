import { interpolateReds } from "d3-scale-chromatic";
import { useState } from "react";
import { DiscreteHeatmapProps } from "../interfaces/Heatmap";
import Callout from "./Callout";

function DiscreteHeatmap(props: DiscreteHeatmapProps) {
  function getGridResolutionInPixels() {
    return Math.abs(props.xScale(0.5) - props.xScale(0));
  }

  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const [calloutFrequency, setCalloutFrequency] = useState(0);
  const [calloutTransform, setCalloutTransform] = useState("");

  function showCallout(
    frequency: number,
    xPosition: number,
    yPosition: number
  ) {
    setIsCalloutVisible(false);
    setCalloutFrequency(frequency);
    setCalloutTransform(`translate(${xPosition}, ${yPosition})`);
    setIsCalloutVisible(true);
  }

  function hideCallout() {
    setIsCalloutVisible(false);
  }

  function getXPosition(columnIndex: number) {
    return (
      props.xScale((columnIndex - 16) / 2) - getGridResolutionInPixels() / 2
    );
  }

  function getYPosition(rowIndex: number) {
    return props.yScale((rowIndex - 16) / 2) - getGridResolutionInPixels() / 2;
  }

  return (
    <>
      {props.heatmapData.values.map((row, columnIndex) =>
        row.map((value, rowIndex) => (
          <g
            transform={`translate(${getXPosition(columnIndex)},${getYPosition(
              rowIndex
            )})`}
            key={"(" + rowIndex + "," + columnIndex + ")"}
          >
            <rect
              x="0"
              y="0"
              width={getGridResolutionInPixels() - 1}
              height={getGridResolutionInPixels() - 1}
              fill={interpolateReds(
                Math.min(value / props.highestFrequency, 1)
              )}
              onMouseEnter={() => {
                showCallout(
                  value,
                  getXPosition(columnIndex),
                  getYPosition(rowIndex) - 25
                );
                props.setSelectedHeatmapTile({
                  x: (rowIndex - 16) / 2,
                  y: (columnIndex - 16) / 2,
                });
              }}
              onMouseLeave={() => {
                hideCallout();
                props.setSelectedHeatmapTile({ x: -9, y: -9 });
              }}
            />
          </g>
        ))
      )}

      <g>
        {isCalloutVisible && (
          <Callout
            transform={calloutTransform}
            width={20}
            height={20}
            child={<b>{calloutFrequency}</b>}
          />
        )}
      </g>
    </>
  );
}

export default DiscreteHeatmap;
