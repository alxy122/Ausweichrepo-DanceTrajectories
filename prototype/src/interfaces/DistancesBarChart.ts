import {  ScaleLinear } from "d3-scale";
import { Choreography, Pattern } from "./Choreography";

export interface DistancesBarChartProps {
    numCouples: number;
    pattern: Pattern;
    previousPattern: Pattern;
    hasPreviousPattern: boolean;

    showHeatmap: boolean;
    choreo: Choreography;

    hoveredDancer: number;

    gentlemanColor:string | number | readonly string[] | undefined;
    ladyColor:string | number | readonly string[] | undefined;
}

export interface ChartBottomAxisProps {
    dms: any;
    scale: ScaleLinear<number, number>;
    numCouples: number;
}

export interface ChartLeftAxisProps {
    dms: any;
    scale: ScaleLinear<number, number>;
    maxDistance: number;
}

