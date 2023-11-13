import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "../Styles/timeslider.css";
import TimeLineDropdownMenu from "./TimeLineDropdownMenu";
import PauseButton from "./PauseButton";
import { TimeLineProps } from "../interfaces/TimeLineProps";
import { Col, Row } from "react-bootstrap";
// import NextFormationButton from "./NextFormationButton";

function TimeLine(props: TimeLineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const lineRef = useRef<SVGLineElement | null>(null);
  const diagramRef = useRef<SVGPathElement | null>(null);
  const areaRef = useRef<SVGPathElement | null>(null);
  const [data, setData] = useState<number[]>([]);
  const [diagramType, setDiagramType] = useState(0);

  const [windowWidth, setWindowWidth] = useState(props.width);
  // const [data] = useState(generateRandomArray(100, 0, 100));
  const shape = [0, 10, 50, 80, 200, 300, 800, 1000, 1300, 4000];
  let xValue = d3.scaleLinear(
    [0, props.videoLength],
    [props.padding, windowWidth - props.padding]
  );
  // const data = generateRandomArray(0, 100);
  // const data = meanErrorDiagram([1]);

  useEffect(() => {
    // if (areaRef.current || diagramRef.current) {
    //   let newData = meanErrorDiagram([]);
    //   setData(newData);
    //   console.log("test");

    // console.log("fd:", props.formationData);
    let helper = meanErrorDiagram(props.selectedDancer);
    if (helper != null) {
      setData(helper);
    }
    d3.select(diagramRef.current).datum(data).attr("d", lineGenerator);
    d3.select(areaRef.current).datum(data).attr("d", areaGenerator);
  }, [props.formationData]);

  useEffect(() => {
    if (diagramType == 0) {
      let helper = meanErrorDiagram(props.selectedDancer);
      if (helper != null) {
        setData(helper);
      }
      d3.select(diagramRef.current).datum(data).attr("d", lineGenerator);
      d3.select(areaRef.current).datum(data).attr("d", areaGenerator);
    } else if (diagramType == 1) {
      let helper = calculateVariance(meanErrorDiagram(props.selectedDancer));

      if (helper != null) {
        setData(helper);
      }
      d3.select(diagramRef.current).datum(data).attr("d", lineGenerator);
      d3.select(areaRef.current).datum(data).attr("d", areaGenerator);
    }
  }, [diagramType]);

  useEffect(() => {
    xValue = d3.scaleLinear(
      [0, props.videoLength],
      [props.padding, windowWidth - props.padding]
    );
  }, [windowWidth, svgRef]);

  useEffect(() => {
    if (!svgRef.current || !props.videoRef.current) return;
    calculateSvgWidth();

    // setShapeNr(findClosestElement(shape, xValue(props.currentTime)));

    if (
      lineRef.current &&
      circleRef.current &&
      svgRef.current &&
      areaRef.current &&
      diagramRef.current
    ) {
      d3.select(circleRef.current).attr("cx", xValue(props.currentTime));
      d3.select(lineRef.current).attr("x2", windowWidth - props.padding);
      d3.select(diagramRef.current).datum(data).attr("d", lineGenerator);
      d3.select(areaRef.current).datum(data).attr("d", areaGenerator);
      d3.select(svgRef.current).on("click", (event) => onClick(event));
      return;
    }

    const svg = d3
      .select(svgRef.current)
      .attr("class", "main")
      .attr("width", "100%")
      .attr("height", "100%")
      .on("click", (event) => onClick(event));

    const line = svg
      .append("path")
      .datum(data)
      .attr("class", "linechart")
      .attr("d", lineGenerator);
    diagramRef.current = line.node();

    var newxScale = d3
      .scaleLinear()
      .range([props.padding, windowWidth - props.padding])
      .domain([0, props.videoLength]);

    svg
      .append("g")
      .attr("transform", "translate(0," + (props.height - 30) + ")")
      .call(d3.axisBottom(newxScale));

    svg
      .append("text")
      .attr("x", windowWidth / 2)
      .attr("y", props.height - 30 + 30)
      .attr("text-anchor", "middle")
      .text("Zeit in Sekunden");

    const yAxis = d3.axisLeft(yScale);

    yAxis.ticks(2);
    svg
      .append("g")
      .attr("transform", "translate(" + props.padding + ",0)")
      .call(yAxis);

    svg
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "left")
      .attr("transform", "rotate(90)")
      .text("Abweichung");

    const area = svg
      .append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", areaGenerator);
    areaRef.current = area.node();

    const newLine = svg
      .append("line")
      .attr("class", "line")
      .attr("x1", props.padding)
      .attr("y1", props.height - 30)
      .attr("x2", windowWidth - props.padding)
      .attr("y2", props.height - 30);
    lineRef.current = newLine.node();

    shape.forEach((element) => {
      svg
        .append("circle")
        .attr("cx", xValue.invert(element + props.padding) + props.padding)
        .attr("cy", props.height - 30)
        .attr("r", 5);
    });

    const newCircle = svg
      .append("circle")
      .attr("class", "circle")
      .attr("cx", xValue(props.currentTime))
      .attr("cy", props.height - 30)
      .attr("r", props.radius)
      .call(
        d3
          .drag<SVGCircleElement, any, any>()
          .on("start", (event) => onDragStart(event))
          .on("drag", (event) => onDrag(event))
          .on("end", (event) => onDragEnd(event))
      );
    circleRef.current = newCircle.node();
  }, [windowWidth, props.currentTime]);

  function onClick(event: MouseEvent) {
    const currentTime = Math.max(
      0,
      Math.min(xValue.invert(event.x), props.videoLength)
    );
    props.onTimeChange(currentTime);
  }

  function onDragStart(event: d3.D3DragEvent<SVGCircleElement, any, any>) {
    d3.select<SVGCircleElement, any>(event.subject)
      .raise()
      .classed("active", true);
  }

  function onDrag(event: d3.D3DragEvent<SVGCircleElement, any, any>) {
    const currentTime = Math.max(
      0,
      Math.min(xValue.invert(event.x), props.videoLength)
    );
    props.onTimeChange(currentTime);
  }

  function onDragEnd(event: d3.D3DragEvent<SVGCircleElement, any, any>) {
    d3.select<SVGCircleElement, any>(event.subject).classed("active", false);
  }

  const xScale = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([props.padding, windowWidth - props.padding]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 5])
    .range([props.height - 30, 0]);

  const lineGenerator = d3
    .line<number>()
    .x((_d, i) => xScale(i))
    .y((d) => yScale(d))
    .curve(d3.curveMonotoneX);

  const areaGenerator = d3
    .area<number>()
    .x((_d, i) => xScale(i))
    .y0(props.height - 30)
    .y1((d) => yScale(d))
    .curve(d3.curveMonotoneX);

  function meanErrorDiagram(selectedDancer: number[]) {
    if (
      props.transformedTrajectoryData.length == 0 ||
      props.formationData.length == 0 ||
      props.selectedDancer.length == 0
    )
      return [];

    let meanErrorPerFrame: number[] = [];

    for (let i = 0; i < 2065; i++) {
      let helper = 0;
      for (const dancer of selectedDancer) {
        var x_trajectory = props.transformedTrajectoryData[dancer][i][0];
        var y_trajectory = props.transformedTrajectoryData[dancer][i][1];

        var x_formation = props.formationData[dancer][i][0];
        var y_formation = props.formationData[dancer][i][1];

        var MSEx = Math.pow(x_trajectory - x_formation, 2);
        var MSEy = Math.pow(y_trajectory - y_formation, 2);

        var MSE = Math.sqrt(MSEx + MSEy);

        helper = helper + MSE;
      }
      meanErrorPerFrame.push(helper / selectedDancer.length);
    }
    // console.log(meanErrorPerFrame);
    return meanErrorPerFrame;
  }

  function calculateVariance(meanErrorPerFrame: number[]) {
    if (meanErrorPerFrame.length === 0 || props.formationData.length === 0)
      return null;

    const meanErrorMean =
      meanErrorPerFrame.reduce((acc, value) => acc + value, 0) /
      meanErrorPerFrame.length;
    const variance =
      meanErrorPerFrame.reduce(
        (acc, value) => acc + Math.pow(value - meanErrorMean, 2),
        0
      ) / meanErrorPerFrame.length;

    return variance;
  }

  // function generateRandomArray(min: number, max: number): number[] {
  //   meanErrorDiagram([]);
  //   if (min > max) {
  //     throw new Error("Invalid input parameters");
  //   }

  //   const randomArray: number[] = [];

  //   for (let i = 0; i < props.videoLength; i++) {
  //     const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  //     randomArray.push(randomNumber);
  //   }

  //   return randomArray;
  // }

  function calculateSvgWidth() {
    if (svgRef.current) {
      const actualWidth = svgRef.current.clientWidth;
      // console.log(actualWidth);
      // Use actualWidth as needed, e.g., update state or props
      setWindowWidth(actualWidth); // Assuming you have a state variable to hold the width
    }
  }
  return (
    <>
      <svg ref={svgRef} style={{ padding: "0", bottom: "0" }}></svg>
      <Row>
        <Col>
          <PauseButton
            videoRef={props.videoRef}
            isPaused={props.isPaused}
            setIsPaused={props.setIsPaused}
          ></PauseButton>
          {/* <NextFormationButton currentTime={props.currentTime} setCurrentTime={props.onTimeChange} padding={props.padding}></NextFormationButton> */}
        </Col>
        <Col>
          <TimeLineDropdownMenu
            setDiagramType={setDiagramType}
          ></TimeLineDropdownMenu>
        </Col>
      </Row>
    </>
  );
}

export default TimeLine;
