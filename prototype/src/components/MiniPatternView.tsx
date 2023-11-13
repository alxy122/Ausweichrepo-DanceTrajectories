import { scaleLinear } from "d3-scale";
import { MiniPatternViewProps } from "../interfaces/Timeline";
import { DanceCouple } from "../interfaces/Choreography";

function MiniPatternView(props: MiniPatternViewProps) {
  const xScale = scaleLinear()
    .domain([-(props.danceFloor.width / 2), props.danceFloor.width / 2])
    .range([0, 64]);

  const yScale = scaleLinear()
    .domain([props.danceFloor.length / 2, -(props.danceFloor.length / 2)])
    .range([0, 64]);

  return (
    <svg width={64} height={64}>
      {props.pattern.positions.map((danceCouple: DanceCouple) => (
        <g key={String(danceCouple.id)}>
          <circle
            cx={xScale(danceCouple.position[0].x)}
            cy={yScale(danceCouple.position[0].y)}
            r={2}
            fill={
              danceCouple.joint
                ? String(props.coupleColor)
                : String(props.gentlemanColor)
            }
          />
          <circle
            cx={xScale(danceCouple.position[1].x)}
            cy={yScale(danceCouple.position[1].y)}
            r={2}
            fill={
              danceCouple.joint
                ? String(props.coupleColor)
                : String(props.ladyColor)
            }
          />
        </g>
      ))}
    </svg>
  );
}

export default MiniPatternView;
