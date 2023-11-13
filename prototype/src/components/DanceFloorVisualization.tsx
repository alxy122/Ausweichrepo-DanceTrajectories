import { useEffect, useState } from "react";
import { DanceFloorVisProps } from "../interfaces/DanceFloorVis";
import PatternView from "./PatternView";

function DanceFloorVisualization(props: DanceFloorVisProps) {
  return (
    <>
      <PatternView
        danceFloor={props.choreo.danceFloor}
        pattern={props.choreo.patterns[props.selectedPattern]}
        selectedPattern={props.selectedPattern}
        previousPattern={props.choreo.patterns[props.selectedPattern - 1]}
        hasPreviousPattern={props.selectedPattern === 0 ? false : true}
        gentlemanColor={props.gentlemanColor}
        ladyColor={props.ladyColor}
        coupleColor={props.coupleColor}
        transitionColorScheme={props.transitionColorScheme}
        showHeatmap={props.showHeatmap}
        discreteHeatmapEnabled={props.discreteHeatmapEnabled}
        discreteHeatmap={props.discreteHeatmap}
        highestFrequency={props.highestFrequency}
        showTransitions={props.showTransitions}
        showOrientations={props.showOrientations}
        showShapes={props.showShapes}
        addShape={props.addShape}
        removeShape={props.removeShape}
        moveDancer={props.moveDancer}
        rotateDancerBody={props.rotateDancerBody}
        rotateDancerHead={props.rotateDancerHead}
        fineGridEnabled={props.fineGridEnabled}
        gridDragEnabled={props.gridDragEnabled}
        editingModeActive={props.editingModeActive}
        hoveredDancer={props.hoveredDancer}
        setHoveredDancer={props.setHoveredDancer}
        animationSpeed={props.animationSpeed}
        separateDanceCouple={props.separateDanceCouple}
        joinDanceCouple={props.joinDanceCouple}
        patternRotation={props.patternRotation}
        currentlyInAnimation={props.currentlyInAnimation}
        moveDancerInIntermediatePattern={props.moveDancerInIntermediatePattern}
        setSelectedHeatmapTile={props.setSelectedHeatmapTile}
        selectedHeatmapTile={props.selectedHeatmapTile}
        addPatternToDraft={props.addPatternToDraft}
        setBrushCopy={props.setBrushCopy}
        setCopyOfFirstDancer={props.setCopyOfFirstDancer}
      />
    </>
  );
}

export default DanceFloorVisualization;
