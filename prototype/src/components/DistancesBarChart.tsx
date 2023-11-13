import Color from "color";
import { scaleLinear } from "d3-scale";
import { useEffect, useMemo, useState } from "react";
import useChartDimensions from "../hooks/UseChartDimensions";
import { DistancesBarChartProps } from "../interfaces/DistancesBarChart";
import { ChartBottomAxis, ChartLeftAxis } from "./ChartAxis";
import Callout from "./Callout";
import "../styles/Visualization.css";
import { IntermediatePattern, Position } from "../interfaces/Choreography";

const chartSettings = {};
const fontScaling: number = 0.03;

function DistancesBarChart(props: DistancesBarChartProps) {
  const [ref, dms] = useChartDimensions(chartSettings);

  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const [calloutDistance, setCalloutDistance] = useState(0);
  const [calloutTransform, setCalloutTransform] = useState("");

  const leftMargin: number = dms.marginLeft;
  const topMargin: number = dms.marginTop / 3;

  const [data, setData] = useState<{ dancerId: number; distance: number }[]>(
    []
  );
  const [maxDistance, setMaxDistance] = useState<number>(0);

  useEffect(() => {
    if (props.hasPreviousPattern || props.showHeatmap) {
      determineData();
    }
  }, [props.pattern, props.previousPattern, props.showHeatmap]);

  const xScale = useMemo(() => {
    return scaleLinear()
      .domain([1, props.choreo.numCouples])
      .range([0, dms.boundedHeight / 1.9]);
  }, [props.pattern, props.previousPattern, dms.boundedHeight]);

  const yScale = useMemo(() => {
    return scaleLinear()
      .domain([0, maxDistance])
      .range([0, dms.boundedHeight / 1.9]);
  }, [props.pattern, props.previousPattern, dms.boundedHeight, maxDistance]);

  useEffect(() => {
    if (props.hoveredDancer > 0 && props.hasPreviousPattern) {
      showCallout(
        data[props.hoveredDancer - 1].distance,
        (5 + data[props.hoveredDancer - 1].dancerId * dms.boundedWidth) /
          (props.choreo.numCouples * 2),
        yScale(8 - data[props.hoveredDancer - 1].distance)
      );
    }
  }, [props.hoveredDancer]);

  if (!props.hasPreviousPattern && !props.showHeatmap) {
    return <div ref={ref}> {<p>No previous pattern exists</p>}</div>;
  }

  function showCallout(distance: number, xPosition: number, yPosition: number) {
    setIsCalloutVisible(false);
    setCalloutDistance(distance);
    setCalloutTransform(`translate(${xPosition}, ${yPosition})`);
    setIsCalloutVisible(true);
  }

  function hideCallout() {
    setIsCalloutVisible(false);
  }

  function determineData() {
    let distances = [];
    let maxDistance = 0;
    if (!props.showHeatmap) {
      for (let i = 0; i < props.choreo.numCouples; i++) {
        const sourceMan = props.previousPattern.positions[i].position[0];
        const sourceWoman = props.previousPattern.positions[i].position[1];

        const targetMan = props.pattern.positions[i].position[0];
        const targetWoman = props.pattern.positions[i].position[1];

        let distanceMan = Math.sqrt(
          Math.pow(Math.abs(targetMan.x - sourceMan.x), 2) +
            Math.pow(Math.abs(targetMan.y - sourceMan.y), 2)
        );

        let distanceWoman = Math.sqrt(
          Math.pow(Math.abs(targetWoman.x - sourceWoman.x), 2) +
            Math.pow(Math.abs(targetWoman.y - sourceWoman.y), 2)
        );

        if (props.pattern.intermediatePatterns.length > 0) {
          distanceMan = 0;
          distanceWoman = 0;
          const intermediatePosMan =
            props.pattern.intermediatePatterns[0].positions[i].position[0];
          const intermediatePosWoman =
            props.pattern.intermediatePatterns[0].positions[i].position[1];
          distanceMan += Math.sqrt(
            Math.pow(Math.abs(intermediatePosMan.x - sourceMan.x), 2) +
              Math.pow(Math.abs(intermediatePosMan.y - sourceMan.y), 2)
          );

          distanceWoman += Math.sqrt(
            Math.pow(Math.abs(intermediatePosWoman.x - sourceWoman.x), 2) +
              Math.pow(Math.abs(intermediatePosWoman.y - sourceWoman.y), 2)
          );
        }

        for (
          let i = 1;
          i < props.pattern.intermediatePatterns.length - 1;
          i++
        ) {
          const firstIntermediatePattern: IntermediatePattern =
            props.pattern.intermediatePatterns[i];
          const secondIntermediatePattern: IntermediatePattern =
            props.pattern.intermediatePatterns[i + 1];

          const firstIntermediatePosMan =
            firstIntermediatePattern.positions[i].position[0];
          const firstIntermediatePosWoman =
            firstIntermediatePattern.positions[i].position[1];

          const secondIntermediatePosMan =
            secondIntermediatePattern.positions[i].position[0];
          const secondIntermediatePosWoman =
            secondIntermediatePattern.positions[i].position[1];

          distanceMan += Math.sqrt(
            Math.pow(
              Math.abs(secondIntermediatePosMan.x - firstIntermediatePosMan.x),
              2
            ) +
              Math.pow(
                Math.abs(
                  secondIntermediatePosMan.y - firstIntermediatePosMan.y
                ),
                2
              )
          );

          distanceWoman += Math.sqrt(
            Math.pow(
              Math.abs(
                secondIntermediatePosWoman.x - firstIntermediatePosWoman.x
              ),
              2
            ) +
              Math.pow(
                Math.abs(
                  secondIntermediatePosWoman.y - firstIntermediatePosWoman.y
                ),
                2
              )
          );
        }

        if (props.pattern.intermediatePatterns.length > 0) {
          const lastIntermediatePattern: IntermediatePattern =
            props.pattern.intermediatePatterns[
              props.pattern.intermediatePatterns.length - 1
            ];
          const intermediatePosMan =
            lastIntermediatePattern.positions[i].position[0];
          const intermediatePosWoman =
            lastIntermediatePattern.positions[i].position[1];
          distanceMan += Math.sqrt(
            Math.pow(Math.abs(targetMan.x - intermediatePosMan.x), 2) +
              Math.pow(Math.abs(targetMan.y - intermediatePosMan.y), 2)
          );

          distanceWoman += Math.sqrt(
            Math.pow(Math.abs(targetWoman.x - intermediatePosWoman.x), 2) +
              Math.pow(Math.abs(targetWoman.y - intermediatePosWoman.y), 2)
          );
        }

        if (distanceMan > maxDistance) {
          maxDistance = Math.ceil(distanceMan);
        }
        if (distanceWoman > maxDistance) {
          maxDistance = Math.ceil(distanceWoman);
        }

        setMaxDistance(maxDistance);
        distances.push({ dancerId: 2 * i, distance: distanceMan });
        distances.push({ dancerId: 2 * i + 1, distance: distanceWoman });
        setData(distances);
      }
    } else {
      let distanceBuffer = [];
      for (let i = 0; i < props.choreo.numCouples * 2; i++) {
        distanceBuffer.push(0);
      }
      for (
        let patternId = 0;
        patternId < props.choreo.patterns.length - 1;
        patternId++
      ) {
        for (let i = 0; i < props.choreo.numCouples; i++) {
          const sourceMan: Position =
            props.choreo.patterns[patternId].positions[i].position[0];
          const sourceWoman: Position =
            props.choreo.patterns[patternId].positions[i].position[1];

          const targetMan: Position =
            props.choreo.patterns[patternId + 1].positions[i].position[0];
          const targetWoman: Position =
            props.choreo.patterns[patternId + 1].positions[i].position[1];

          let distanceMan = Math.sqrt(
            Math.pow(Math.abs(targetMan.x - sourceMan.x), 2) +
              Math.pow(Math.abs(targetMan.y - sourceMan.y), 2)
          );

          let distanceWoman = Math.sqrt(
            Math.pow(Math.abs(targetWoman.x - sourceWoman.x), 2) +
              Math.pow(Math.abs(targetWoman.y - sourceWoman.y), 2)
          );

          if (
            props.choreo.patterns[patternId].intermediatePatterns.length > 0
          ) {
            distanceMan = 0;
            distanceWoman = 0;
            const intermediatePosMan =
              props.choreo.patterns[patternId].intermediatePatterns[0]
                .positions[i].position[0];
            const intermediatePosWoman =
              props.choreo.patterns[patternId].intermediatePatterns[0]
                .positions[i].position[1];
            distanceMan += Math.sqrt(
              Math.pow(Math.abs(intermediatePosMan.x - sourceMan.x), 2) +
                Math.pow(Math.abs(intermediatePosMan.y - sourceMan.y), 2)
            );

            distanceWoman += Math.sqrt(
              Math.pow(Math.abs(intermediatePosWoman.x - sourceWoman.x), 2) +
                Math.pow(Math.abs(intermediatePosWoman.y - sourceWoman.y), 2)
            );
          }

          for (
            let i = 0;
            i <
            props.choreo.patterns[patternId].intermediatePatterns.length - 1;
            i++
          ) {
            const firstIntermediatePattern: IntermediatePattern =
              props.choreo.patterns[patternId].intermediatePatterns[i];
            const secondIntermediatePattern: IntermediatePattern =
              props.choreo.patterns[patternId].intermediatePatterns[i + 1];

            const firstIntermediatePosMan =
              firstIntermediatePattern.positions[i].position[0];
            const firstIntermediatePosWoman =
              firstIntermediatePattern.positions[i].position[1];

            const secondIntermediatePosMan =
              secondIntermediatePattern.positions[i].position[0];
            const secondIntermediatePosWoman =
              secondIntermediatePattern.positions[i].position[1];

            distanceMan += Math.sqrt(
              Math.pow(
                Math.abs(
                  secondIntermediatePosMan.x - firstIntermediatePosMan.x
                ),
                2
              ) +
                Math.pow(
                  Math.abs(
                    secondIntermediatePosMan.y - firstIntermediatePosMan.y
                  ),
                  2
                )
            );

            distanceWoman += Math.sqrt(
              Math.pow(
                Math.abs(
                  secondIntermediatePosWoman.x - firstIntermediatePosWoman.x
                ),
                2
              ) +
                Math.pow(
                  Math.abs(
                    secondIntermediatePosWoman.y - firstIntermediatePosWoman.y
                  ),
                  2
                )
            );
          }

          if (
            props.choreo.patterns[patternId].intermediatePatterns.length > 0
          ) {
            const lastIntermediatePattern: IntermediatePattern =
              props.choreo.patterns[patternId].intermediatePatterns[
                props.choreo.patterns[patternId].intermediatePatterns.length - 1
              ];
            const intermediatePosMan =
              lastIntermediatePattern.positions[i].position[0];
            const intermediatePosWoman =
              lastIntermediatePattern.positions[i].position[1];
            distanceMan += Math.sqrt(
              Math.pow(Math.abs(targetMan.x - intermediatePosMan.x), 2) +
                Math.pow(Math.abs(targetMan.y - intermediatePosMan.y), 2)
            );

            distanceWoman += Math.sqrt(
              Math.pow(Math.abs(targetWoman.x - intermediatePosWoman.x), 2) +
                Math.pow(Math.abs(targetWoman.y - intermediatePosWoman.y), 2)
            );
          }

          distanceBuffer[2 * i] += distanceMan;
          distanceBuffer[2 * i + 1] += distanceWoman;
        }
      }
      for (let i = 0; i < distanceBuffer.length; i++) {
        distances.push({ dancerId: i, distance: distanceBuffer[i] });
        if (distanceBuffer[i] > maxDistance) {
          maxDistance = distanceBuffer[i];
        }
      }

      setMaxDistance(Math.ceil(maxDistance));
      setData(distances);
    }
  }

  function isHighlighted(dancerId: number): boolean {
    if (props.hoveredDancer !== -1) {
      if (props.hoveredDancer === dancerId + 1) {
        return true;
      }
    }
    return false;
  }

  function getBarFill(dataPoint: { dancerId: number; distance: number }) {
    if (props.hoveredDancer !== -1) {
      const coupleNumber: number = Math.floor((props.hoveredDancer - 1) / 2);
      const partnerId: number =
        props.hoveredDancer % 2 === 0
          ? props.hoveredDancer - 1
          : props.hoveredDancer + 1;

      if (!props.pattern.positions[coupleNumber].joint) {
        if (props.hoveredDancer !== dataPoint.dancerId + 1) {
          return "lightGray";
        }
      } else {
        if (
          props.hoveredDancer !== dataPoint.dancerId + 1 &&
          partnerId !== dataPoint.dancerId + 1
        ) {
          return "lightGray";
        }
      }
    }

    if (dataPoint.dancerId % 2 === 0) {
      return Color(props.gentlemanColor).lighten(0.2).toString();
    } else {
      return Color(props.ladyColor).lighten(0.2).toString();
    }
  }

  return (
    <div id="chartContainer" ref={ref}>
      <svg
        width={dms.boundedWidth}
        height={dms.height / 1.9}
        style={{ overflow: "visible" }}
        transform={`translate(${[leftMargin, topMargin].join(",")})`}
      >
        <g transform={`translate(${[0, dms.boundedHeight / 1.9].join(",")})`}>
          <ChartBottomAxis
            dms={dms}
            scale={xScale}
            numCouples={props.choreo.numCouples}
          />
          <text
            className="unselectable-text"
            transform={`translate(${dms.boundedWidth * 1.07},${
              dms.boundedWidth / 120 + 20
            })`}
            style={{
              fontSize: Math.max(11, fontScaling * dms.boundedHeight),
              textAnchor: "middle",
              fontStyle: "italic",
            }}
          >
            Couple
          </text>
        </g>

        <g transform={`translate(${[0, 0].join(",")})`}>
          <ChartLeftAxis dms={dms} scale={yScale} maxDistance={maxDistance} />
          <text
            transform={`translate(${dms.boundedWidth / 50},${0})`}
            style={{
              fontSize: Math.max(11, fontScaling * dms.boundedHeight),
              fontStyle: "italic",
            }}
          >
            Distance in m
          </text>
        </g>
        <g>
          {data.map((dataPoint) => (
            <rect
              style={{
                fill: getBarFill(dataPoint),
              }}
              x={
                (5 + dataPoint.dancerId * dms.boundedWidth) /
                (props.choreo.numCouples * 2)
              }
              y={yScale(maxDistance - dataPoint.distance)}
              width={dms.boundedWidth / (props.choreo.numCouples * 2) - 2}
              height={yScale(dataPoint.distance)}
              onMouseEnter={() =>
                showCallout(
                  dataPoint.distance,
                  (5 + dataPoint.dancerId * dms.boundedWidth) /
                    (props.choreo.numCouples * 2),
                  yScale(maxDistance - dataPoint.distance) - 40
                )
              }
              onMouseLeave={() => hideCallout()}
              key={String(dataPoint.dancerId)}
            />
          ))}
        </g>

        <g>
          {isCalloutVisible && (
            <Callout
              transform={calloutTransform}
              width={40}
              height={30}
              child={<b>{Math.round(calloutDistance * 10) / 10}</b>}
            />
          )}
        </g>
      </svg>
    </div>
  );
}

export default DistancesBarChart;
