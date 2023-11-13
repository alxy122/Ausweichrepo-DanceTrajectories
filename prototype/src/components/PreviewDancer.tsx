import { animated, useSpring } from "@react-spring/web";
import Color from "color";
import { DancerRole } from "../interfaces/Choreography";

import { PreviewDancerProps } from "../interfaces/PatternView";
import { getPositionAfterPatterRotation } from "../services/VisServices";

function PreviewDancer(props: PreviewDancerProps) {
  const colorLightenFactor = 0.7;
  let color: Color = determineColor();

  function determineColor(): Color {
    if (props.danceCouple.position[0].x === props.danceCouple.position[1].x) {
      if (props.danceCouple.position[0].y === props.danceCouple.position[1].y) {
        return Color(String(props.coupleColor)).lighten(colorLightenFactor);
      }
    }

    switch (props.role) {
      case DancerRole.Gentleman:
        return Color(String(props.gentlemanColor)).lighten(colorLightenFactor);
      case DancerRole.Lady:
        return Color(String(props.ladyColor)).lighten(colorLightenFactor);
    }
  }

  function getTransform() {
    return `translate(${props.xScale(
      getPositionAfterPatterRotation(props.pos, props.patternRotation).x
    )}, ${props.yScale(
      getPositionAfterPatterRotation(props.pos, props.patternRotation).y
    )})`;
  }

  function clickThisPreviewDancer(e: any) {
    if (props.showTransitions) {
      props.setSelectedDancerForTransitions(props.id);
    }
    e.stopPropagation();
  }

  return (
    <animated.g
      key={props.id}
      transform={getTransform() as string}
      style={{
        cursor: "pointer",
      }}
      visibility={!props.showTransitions ? "hidden" : "visible"}
      onClick={clickThisPreviewDancer}
    >
      <animated.circle fill={color.hex()} r={0.015 * props.dms.boundedWidth} />
      <animated.text
        key={props.id}
        textAnchor="middle"
        alignmentBaseline="middle"
        fill="white"
        className="unselectable-text"
        style={{
          fontSize: 0.028 * props.dms.boundedWidth,
          transform: "translateY(" + props.dms.boundedWidth / 100 + "px)",
        }}
      >
        {props.danceCouple.id}
      </animated.text>
    </animated.g>
  );
}

export default PreviewDancer;
