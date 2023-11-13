import { useMemo } from "react";
import {
  ChartBottomAxisProps,
  ChartLeftAxisProps,
} from "../interfaces/DistancesBarChart";

import "../styles/Visualization.css";

const fontScaling: number = 0.03;

export function ChartBottomAxis(props: ChartBottomAxisProps) {
  const domain = props.scale.domain();
  const range = props.scale.range();

  const ticks = useMemo(() => {
    //const numTicks = Math.abs(domain[0]) + Math.abs(domain[1]);
    const numTicks = props.numCouples;
    return props.scale.ticks(numTicks).map((value) => ({
      value,
      xOffset: props.scale(value),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.scale.domain().join("-"), props.scale.range().join("_")]);

  return (
    <g>
      <path
        d={["M", range[0], 6, "v", -6, "H", range[1] * 2].join(" ")}
        fill="none"
        stroke="currentColor"
      />

      {ticks.map(({ value, xOffset }) => (
        <g
          key={value}
          transform={`translate(${
            xOffset * 1.66 + props.dms.boundedWidth / 16 - 2
          }, ${20})`}
        >
          <text
            key={value}
            style={{
              fontSize: Math.max(11, fontScaling * props.dms.boundedHeight),
              transform:
                "translateX(" +
                0 +
                "px) translateY(" +
                props.dms.boundedWidth / 120 +
                "px)",
              textAnchor: "middle",
            }}
            className="unselectable-text"
          >
            {value}
          </text>
        </g>
      ))}
    </g>
  );
}

export function ChartLeftAxis(props: ChartLeftAxisProps) {
  const domain = props.scale.domain();
  const range = props.scale.range();

  const ticks = useMemo(() => {
    const numTicks = Math.min(Math.abs(domain[0]) + Math.abs(domain[1]) + 1, 7);
    return props.scale.ticks(numTicks).map((value) => ({
      value,
      yOffset: props.scale(value),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.scale.domain().join("-"), props.scale.range().join("_")]);

  return (
    <g>
      <path
        d={["M", -6, range[0], "h", 6, "V", range[1], "h", -6].join(" ")}
        fill="none"
        stroke="currentColor"
      />
      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(0, ${yOffset})`}>
          <line x2="-6" stroke="currentColor" />
          <text
            key={value}
            style={{
              fontSize: Math.max(11, fontScaling * props.dms.boundedHeight),
              transform:
                "translateX(" +
                props.dms.boundedWidth / -20 +
                "px) translateY(" +
                props.dms.boundedWidth / 120 +
                "px)",
              textAnchor: "middle",
            }}
            className="unselectable-text"
          >
            {props.maxDistance - value}
          </text>
        </g>
      ))}
    </g>
  );
}
