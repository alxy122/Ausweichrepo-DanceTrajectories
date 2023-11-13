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
    d3.Selection<SVGGElement, unknown, null, undefined>[]
  >([]);
  const [dancerCircles, setDancerCircles] = useState<
    d3.Selection<SVGGElement, unknown, null, undefined>[]
  >([]);
  const [linesInbetween, setLinesInbetween] = useState<
    d3.Selection<SVGLineElement, unknown, null, undefined>[]
  >([]);
  const width = 800;
  const height = 800;
  const padding = 20;
  const fps = 25;
  var selectD: number[] = [];
  const xScale = d3
    .scaleLinear()
    .domain([-8, 8])
    .range([padding, width - padding]);
  const yScale = d3
    .scaleLinear()
    .domain([-8, 8])
    .range([height - padding, padding]);
  // const color = d3
  //   .scaleLinear()
  //   .domain([0, 1])
  //   .range(["#0075B4", "#70B5DC"] as Iterable<number>);
  // const color = d3.schemeYlGn;
  // const color = d3[`scheme${"YlGn"}`];
  const color = d3
    .scaleLinear()
    .domain([0.5, 3, 100])
    .range(["#ffffe5", "#004529", "#004529"] as Iterable<number>);

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

    setFormationCircles(definePoints(svg, formationData, "gray", 10));
    setDancerCircles(definePoints(svg, transformedTrajectoryData, "red", 20));

    // for (let i = 0; i < formationData.length; i = i + 1) {
    //   var circle = svg
    //     .append("circle")
    //     .attr("cx", xScale(formationData[i][0][0]))
    //     .attr("cy", yScale(formationData[i][0][1]))
    //     .attr("r", 5)
    //     .attr("fill", "gray")
    //     .attr("stroke", "black");
    //   helper.push(circle);
    // }
    // setFormationCircles(helper);
    // helper = [];

    // for (let i = 0; i < transformedTrajectoryData.length; i = i + 1) {
    //   var circle = svg
    //     .append("circle")
    //     .attr("cx", xScale(transformedTrajectoryData[i][0][0]))
    //     .attr("cy", yScale(transformedTrajectoryData[i][0][1]))
    //     .attr("r", 10)
    //     .attr("fill", "red")
    //     .attr("stroke", "black")
    //     .on("click", clickFunctions[i]);
    //   helper.push(circle);
    // }
    // setDancerCircles(helper);
  }, [formationData]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (linesInbetween.length != 0) {
      return;
    }
    setLinesInbetween(defineLines(svg, formationCircles, dancerCircles));
  }, [formationCircles, dancerCircles]);

  function definePoints(
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    data: number[][][],
    colour: string,
    radius: number
  ): d3.Selection<SVGGElement, unknown, null, undefined>[] {
    var helper: d3.Selection<SVGGElement, unknown, null, undefined>[] = [];
    for (let i = 0; i < data.length; i = i + 1) {
      var group = svg.append("g");

      group
        .append("circle")
        .attr("cx", xScale(data[i][0][0]))
        .attr("cy", yScale(data[i][0][1]))
        .attr("r", radius)
        .attr("fill", colour)
        .attr("stroke", "black");

      group
        .append("text")
        .attr("x", xScale(data[i][0][0]))
        .attr("y", yScale(data[i][0][1]))
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text(i)
        .style("user-select", "none")
        .style("pointer-events", "none");

      if (radius < 10) {
        // group.select("text").attr("visibility", "hidden");
      } else {
        group.select("circle").on("click", clickFunctions[i]);
      }
      helper.push(group);
    }
    return helper;
  }

  function defineLines(
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    formationCircles: d3.Selection<SVGGElement, unknown, null, undefined>[],
    dancerCircles: d3.Selection<SVGGElement, unknown, null, undefined>[]
  ): d3.Selection<SVGLineElement, unknown, null, undefined>[] {
    if (formationCircles.length == 0 || dancerCircles.length == 0) {
      return [];
    }
    var helper: d3.Selection<SVGLineElement, unknown, null, undefined>[] = [];
    for (var i = 0; i < formationCircles.length; i = i + 1) {
      const line = svg
        .append("line")
        .attr("class", "line")
        .attr("x1", formationCircles[i].select("circle").attr("cx"))
        .attr("y1", formationCircles[i].select("circle").attr("cy"))
        .attr("x2", dancerCircles[i].select("circle").attr("cx"))
        .attr("y2", dancerCircles[i].select("circle").attr("cx"));

      helper.push(line);
    }

    return helper;
  }

  useEffect(() => {
    manipulatePoints(formationCircles, formationData, xScale, yScale);
    manipulatePoints(dancerCircles, transformedTrajectoryData, xScale, yScale);
    manipulateLines(linesInbetween, formationCircles, dancerCircles);
  }, [currentTime]);

  function manipulatePoints(
    circles: d3.Selection<SVGGElement, unknown, null, undefined>[],
    data: number[][][],
    xScale: d3.ScaleLinear<number, number, never>,
    yScale: d3.ScaleLinear<number, number, never>
  ): void {
    if (data.length == 0 || circles.length == 0) {
      return;
    }
    var index =
      Math.round(currentTime * fps) < data[0].length
        ? Math.round(currentTime * fps)
        : data[0].length - 1;
    for (var i = 0; i < circles.length; i = i + 1) {
      circles[i].select("circle").attr("cx", xScale(data[i][index][0]));
      circles[i].select("text").attr("x", xScale(data[i][index][0]));
      circles[i].select("circle").attr("cy", yScale(data[i][index][1]));
      circles[i].select("text").attr("y", yScale(data[i][index][1]));
    }
  }

  function manipulateLines(
    linesInbetween: d3.Selection<SVGLineElement, unknown, null, undefined>[],
    formationCircles: d3.Selection<SVGGElement, unknown, null, undefined>[],
    dancerCircles: d3.Selection<SVGGElement, unknown, null, undefined>[]
  ): void {
    if (formationCircles.length == 0 || dancerCircles.length == 0) {
      return;
    }
    for (var i = 0; i < formationCircles.length; i = i + 1) {
      // console.log(i);
      var x1 = formationCircles[i].select("circle").attr("cx");
      var y1 = formationCircles[i].select("circle").attr("cy");
      var x2 = dancerCircles[i].select("circle").attr("cx");
      var y2 = dancerCircles[i].select("circle").attr("cy");
      linesInbetween[i]
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2);
      // console.log(
      //   xScale.invert(parseFloat(x1)),
      //   xScale.invert(parseFloat(y1)),
      //   xScale.invert(parseFloat(x2)),
      //   xScale.invert(parseFloat(y2))
      // );
      var colorValue = Math.sqrt(
        Math.pow(
          xScale.invert(parseFloat(x1)) - xScale.invert(parseFloat(x2)),
          2
        ) +
          Math.pow(
            yScale.invert(parseFloat(y1)) - yScale.invert(parseFloat(y2)),
            2
          )
      );
      console.log(colorValue);
      dancerCircles[i].select("circle").attr("fill", color(colorValue));
    }
  }

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
