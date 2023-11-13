import { useEffect, useRef, useState } from "react";
import { ContinuousHeatmapProps } from "../interfaces/Heatmap";
import { interpolateReds } from "d3-scale-chromatic";

import { getGaussian2DKernel } from "../services/VisServices";
import Color from "color";

function ContinuousHeatmap(props: ContinuousHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasWidth, setCanvasWidth] = useState(400);
  const [canvasHeight, setCanvasHeight] = useState(400);

  const [kernelDomainWidth, setKernelDomainWidth] = useState<number>(1);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    setCanvasHeight(props.dms.boundedHeight);
    setCanvasWidth(props.dms.boundedWidth);

    ctx.canvas.width = props.dms.boundedWidth;
    ctx.canvas.height = props.dms.boundedHeight;

    function render() {
      if (!ctx || !props.showHeatmap || props.discreteHeatmapEnabled) return;
      console.log("Calc heatmap");
      const canvas = ctx.canvas;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const data = imageData.data;
      for (let i = 0; i < canvas.width * canvas.height * 4; i += 4) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }

      let newKernelPixelWidth = Math.round(
        5.1 * (props.xScale(0.5) - props.xScale(0))
      );
      if (newKernelPixelWidth % 2 === 0) {
        newKernelPixelWidth += 1;
      }

      const kernel = getGaussian2DKernel(newKernelPixelWidth);

      let continuousHeatmapData: number[][] = [];
      for (let i = 0; i < canvas.height; i++) {
        continuousHeatmapData.push([]);
        for (let j = 0; j < canvas.width; j++) {
          continuousHeatmapData[i].push(0);
        }
      }
      console.log(
        "Continuous Heatmap dimensions: ",
        continuousHeatmapData.length,
        continuousHeatmapData[0].length
      );

      const kernelExtent = Math.floor(newKernelPixelWidth / 2);
      const minPatternPositionX = props.xScale(-8);
      const maxPatternPositionX = props.xScale(8) - 1;
      const minPatternPositionY = props.yScale(8);
      const maxPatternPositionY = props.yScale(-8) - 1;

      for (let row = 0; row < props.heatmapData.values.length; row++) {
        for (
          let column = 0;
          column < props.heatmapData.values[row].length;
          column++
        ) {
          const heatmapValue = props.heatmapData.values[row][column];
          if (heatmapValue <= 0) continue;

          const kernelCenterX = Math.round(props.xScale(row / 2 - 8));
          const kernelCenterY = Math.round(props.yScale(column / 2 - 8));

          for (let i = 0; i < newKernelPixelWidth; i++) {
            for (let j = 0; j < newKernelPixelWidth; j++) {
              const patternPositionX = kernelCenterX + (i - kernelExtent);
              const patternPositionY = kernelCenterY + (j - kernelExtent);

              if (
                patternPositionX >= minPatternPositionX &&
                patternPositionY >= minPatternPositionY &&
                patternPositionX <= maxPatternPositionX &&
                patternPositionY <= maxPatternPositionY
              ) {
                continuousHeatmapData[patternPositionY][patternPositionX] +=
                  heatmapValue * kernel[i][j];
              } else {
                //console.log(patternPositionX, patternPositionY);
              }
            }
          }
        }
      }

      let maxValue = 0;
      for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
          if (continuousHeatmapData[i][j] > maxValue) {
            maxValue = continuousHeatmapData[i][j];
          }
        }
      }

      const colorScalingFactor: number = 1 / maxValue;

      for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
          const rowMajorPosition: number = (i * canvas.height + j) * 4;

          const color = Color(
            interpolateReds(continuousHeatmapData[i][j] * colorScalingFactor)
          );

          data[rowMajorPosition] = color.red();
          data[rowMajorPosition + 1] = color.green();
          data[rowMajorPosition + 2] = color.blue();
          data[rowMajorPosition + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    requestAnimationFrame(render);
  }, [
    props.showHeatmap,
    props.discreteHeatmapEnabled,
    props.heatmapData,
    kernelDomainWidth,
    props.dms.boundedHeight,
    props.dms.boundedWidth,
  ]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
  }, [props.dms.boundedHeight, props.dms.boundedWidth]);

  return (
    <foreignObject height={canvasHeight} width={canvasWidth}>
      <canvas ref={canvasRef} height={canvasHeight} width={canvasWidth} />
    </foreignObject>
  );
}

export default ContinuousHeatmap;
