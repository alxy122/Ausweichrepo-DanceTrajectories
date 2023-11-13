import { ScaleLinear } from "d3-scale";
import { DiscreteHeatmap } from "./Choreography";

export interface DiscreteHeatmapProps {
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;

    heatmapData: DiscreteHeatmap;
    highestFrequency: number;

    setSelectedHeatmapTile: (newTile: {x: number, y: number}) => void;
}

export interface ContinuousHeatmapProps {
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    dms: any;

    heatmapData: DiscreteHeatmap;
    highestFrequency: number;

    showHeatmap: boolean;
    discreteHeatmapEnabled: boolean;
}