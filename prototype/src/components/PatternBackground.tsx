import Grid from "./Grid";
import { BottomAxis, TopAxis, LeftAxis, RightAxis } from "./Axis";

import { PatternBackgroundProps } from "../interfaces/PatternView";
import POVArrow from "./POVArrow";

function PatternBackground(props: PatternBackgroundProps) {
  return (
    <g>
      <Grid
        xScale={props.xScale}
        yScale={props.yScale}
        selectedDancer={props.hoveredDancer}
        positions={props.positions}
        fineGridEnabled={props.fineGridEnabled}
        draggedDancerPosition={props.draggedDancerPosition}
        showHeatmap={props.showHeatmap}
        patternRotation={props.patternRotation}
      />

      <g transform={`translate(${[0, props.height].join(",")})`}>
        <BottomAxis
          dms={props.dms}
          selectedDancer={props.hoveredDancer}
          positions={props.positions}
          scale={props.xScale}
          draggedDancer={props.draggedDancer}
          draggedDancerPosition={props.draggedDancerPosition}
          showHeatmap={props.showHeatmap}
          discreteHeatmapEnabled={props.discreteHeatmapEnabled}
          patternRotation={props.patternRotation}
          selectedHeatmapTile={props.selectedHeatmapTile}
        />
      </g>
      <g transform={`translate(${[0, 0].join(",")})`}>
        <LeftAxis
          dms={props.dms}
          selectedDancer={props.hoveredDancer}
          positions={props.positions}
          scale={props.yScale}
          draggedDancer={props.draggedDancer}
          draggedDancerPosition={props.draggedDancerPosition}
          showHeatmap={props.showHeatmap}
          discreteHeatmapEnabled={props.discreteHeatmapEnabled}
          patternRotation={props.patternRotation}
          selectedHeatmapTile={props.selectedHeatmapTile}
        />
      </g>
      <g transform={`translate(${[0, 0].join(",")})`}>
        <TopAxis
          dms={props.dms}
          selectedDancer={props.hoveredDancer}
          positions={props.positions}
          scale={props.xScale}
          draggedDancer={props.draggedDancer}
          draggedDancerPosition={props.draggedDancerPosition}
          showHeatmap={props.showHeatmap}
          discreteHeatmapEnabled={props.discreteHeatmapEnabled}
          patternRotation={props.patternRotation}
          selectedHeatmapTile={props.selectedHeatmapTile}
        />
      </g>
      <g transform={`translate(${[props.width, 0].join(",")})`}>
        <RightAxis
          dms={props.dms}
          selectedDancer={props.hoveredDancer}
          positions={props.positions}
          scale={props.yScale}
          draggedDancer={props.draggedDancer}
          draggedDancerPosition={props.draggedDancerPosition}
          showHeatmap={props.showHeatmap}
          discreteHeatmapEnabled={props.discreteHeatmapEnabled}
          patternRotation={props.patternRotation}
          selectedHeatmapTile={props.selectedHeatmapTile}
        />
      </g>
      {!props.showHeatmap && (
        <POVArrow
          xScale={props.xScale}
          yScale={props.yScale}
          patternRotation={props.patternRotation}
        />
      )}
    </g>
  );
}

export default PatternBackground;
