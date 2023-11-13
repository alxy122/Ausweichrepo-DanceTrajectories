// CoordinateSystem.tsx
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface CoordinateSystemProps {
  transformedTrajectoryData: number[][][];
  formationData: number[][][];
  currentTime: number;
  selectedDancer: number[];
  setSelectedDancer: React.Dispatch<React.SetStateAction<number[]>>;
}

function CoordinateSystem({
  transformedTrajectoryData,
  formationData,
  currentTime,
  selectedDancer,
  setSelectedDancer,
}: CoordinateSystemProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [formationCircles, setFormationCircles] = useState<
    d3.Selection<SVGCircleElement, unknown, null, undefined>[]
  >([]);
  const [dancerCircles, setDancerCircles] = useState<
    d3.Selection<SVGCircleElement, unknown, null, undefined>[]
  >([]);
  const width = 800;
  const height = 800;
  const padding = 20;
  const fps = 30;
  var selectD: number[] = [];
  const xScale = d3
    .scaleLinear()
    .domain([-8, 8])
    .range([padding, width - padding]);
  const yScale = d3
    .scaleLinear()
    .domain([-8, 8])
    .range([height - padding, padding]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const innerWidth = width - 2 * padding;
    const innerHeight = height - 2 * padding;

    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    for (let x = -8; x <= 8; x += 1) {
      const gridLineData = [
        { x, y: -8 },
        { x, y: 8 },
      ];
      for (let y = -8; y <= 8; y += 1) {
        const gridLineData = [
          { x: -8, y },
          { x: 8, y },
        ];

        svg
          .append("path")
          .attr("d", line(gridLineData) as string)
          .attr("stroke", "lightgray")
          .attr("stroke-width", 1)
          .attr("fill", "none");
      }

      svg
        .append("path")
        .attr("d", line(gridLineData) as string)
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1)
        .attr("fill", "none");
    }

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    xAxis.ticks(16);
    yAxis.ticks(16);

    svg
      .append("g")
      .attr("transform", `translate(0, ${innerHeight + padding})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", `translate(0, ${innerHeight + padding - innerHeight})`)
      .call(xAxis.tickPadding(-20));

    svg.append("g").attr("transform", `translate(${padding}, 0)`).call(yAxis);

    svg
      .append("g")
      .attr("transform", `translate(${padding + innerWidth}, 0)`)
      .call(yAxis.tickPadding(-20));

    var helper: d3.Selection<SVGCircleElement, unknown, null, undefined>[] = [];

    for (let i = 0; i < formationData.length; i = i + 1) {
      var circle = svg
        .append("circle")
        .attr("cx", xScale(formationData[i][0][0]))
        .attr("cy", yScale(formationData[i][0][1]))
        .attr("r", 5)
        .attr("fill", "gray")
        .attr("stroke", "black");
      helper.push(circle);
    }
    setFormationCircles(helper);
    helper = [];

    for (let i = 0; i < transformedTrajectoryData.length; i = i + 1) {
      var circle = svg
        .append("circle")
        .attr("cx", xScale(transformedTrajectoryData[i][0][0]))
        .attr("cy", yScale(transformedTrajectoryData[i][0][1]))
        .attr("r", 10)
        .attr("fill", "red")
        .attr("stroke", "black")
        .on("click", clickFunctions[i]);
      helper.push(circle);
    }
    setDancerCircles(helper);
  }, [formationData]);

  useEffect(() => {
    if (
      transformedTrajectoryData.length == 0 ||
      formationData.length == 0 ||
      dancerCircles.length == 0 ||
      formationCircles.length == 0
    )
      return;

    for (var i = 0; i < formationCircles.length; i = i + 1) {
      formationCircles[i].attr(
        "cx",
        xScale(formationData[i][Math.round(currentTime * fps)][0])
      );
      formationCircles[i].attr(
        "cy",
        yScale(formationData[i][Math.round(currentTime * fps)][1])
      );
    }

    for (var i = 0; i < dancerCircles.length; i = i + 1) {
      dancerCircles[i].attr(
        "cx",
        xScale(transformedTrajectoryData[i][Math.round(currentTime * fps)][0])
      );
      dancerCircles[i].attr(
        "cy",
        yScale(transformedTrajectoryData[i][Math.round(currentTime * fps)][1])
      );
    }
  }, [currentTime]);

  const clickFunctions = formationData.map((data, i) => () => {
    // if (selectedDancer.includes(i)) {
    //   var index = selectedDancer.indexOf(i);
    //   setSelectedDancer([
    //     ...selectedDancer.slice(0, index),
    //     ...selectedDancer.slice(index + 1),
    //   ]);
    //   circles[i].attr("stroke-width", 1);
    // } else {
    //   var array = [...selectedDancer, i];
    //   setSelectedDancer(array);
    //   circles[i].attr("stroke-width", 5);
    // }
    console.log(selectD);
    setSelectedDancer([2, 3]);

    // if (parseInt(helper[i].attr("stroke-width"), 10) == 5) {
    //   helper[i].attr("stroke-width", 1);
    // } else {
    //   helper[i].attr("stroke-width", 5);
    // }
  });

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default CoordinateSystem;
