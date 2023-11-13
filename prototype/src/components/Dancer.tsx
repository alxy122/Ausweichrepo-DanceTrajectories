import { useEffect, useState } from "react";
import { animated, config, SpringValue, useSpring } from "@react-spring/web";

import { DancerProps } from "../interfaces/PatternView";
import { DancerRole } from "../interfaces/Choreography";
import Color from "color";

import "../styles/Visualization.css";
import {
  clampToGridPosition,
  getPositionAfterPatterRotation,
  getOrientationAfterRotation,
  getIntermediatePositionAfterPatterRotation,
} from "../services/VisServices";
import OrientationVisModal from "./OrientationVisModal";

function Dancer(props: DancerProps) {
  const colorLightenFactor = 0.6;
  let color: string = String(determineColor());

  const [showModal, setShowModal] = useState(false);

  function determineColor() {
    if (props.danceCouple.position[0].x === props.danceCouple.position[1].x) {
      if (props.danceCouple.position[0].y === props.danceCouple.position[1].y) {
        return props.coupleColor;
      }
    }

    switch (props.role) {
      case DancerRole.Gentleman:
        return props.gentlemanColor;
      case DancerRole.Lady:
        return props.ladyColor;
    }
  }

  function getOrientationBacksideFill(): string {
    return Color(color).lighten(colorLightenFactor).hex();
  }

  function getFill(): string | SpringValue<string> {
    if (props.showShapes) {
      return Color(String(highlightFill)).lighten(0.5).hex();
    }

    if (props.id === props.hoveredDancer) {
      return highlightFill;
    }
    const partnerId = props.id % 2 === 1 ? props.id + 1 : props.id - 1;
    if (
      !props.editingModeActive &&
      !props.showShapes &&
      !props.showTransitions &&
      props.hoveredDancer !== -1 &&
      props.hoveredDancer !== props.id
    ) {
      if (
        props.candidatesOnAscendingLine.includes(props.id) ||
        props.candidatesOnDescendingLine.includes(props.id) ||
        props.candidatesOnVerticalLine.includes(props.id) ||
        props.candidatesOnHorizontalLine.includes(props.id) ||
        (props.danceCouple.joint &&
          (props.candidatesOnAscendingLine.includes(partnerId) ||
            props.candidatesOnDescendingLine.includes(partnerId) ||
            props.candidatesOnVerticalLine.includes(partnerId) ||
            props.candidatesOnHorizontalLine.includes(partnerId)))
      ) {
        return Color(String(highlightFill)).lighten(0.6).hex();
      } else {
        return dampedFill;
      }
    }

    if (props.editingModeActive || props.showTransitions) {
      return color;
    }
    return animatedFill.fill;
  }

  const animatedFill = useSpring({
    fill: color,
    delay: 300,
  });

  const highlightFill = color;
  const dampedFill = "LightGray";

  function hoverThisDancer(e: any) {
    if (props.mouseDownPosition.x > -1) {
      return;
    }
    selectThisDancer(e);
  }

  function dehoverThisDancer(e: any) {
    props.setHoveredDancer(-1);
  }

  function clickThisDancer(e: any) {
    //hideCallout();
    if (props.showOrientations) {
      setShowModal(true);
      props.setShowModal(true);
    }
    if (props.showTransitions) {
      props.setSelectedDancerForTransitions(props.id);
    }

    if (e.ctrlKey && props.editingModeActive) {
      if (!props.brushSelectedDancers.includes(props.id)) {
        let copyOfBrushSelectedDancers = [...props.brushSelectedDancers];
        if (copyOfBrushSelectedDancers.length === 0) {
          props.setFirstDancerInBrush(props.id);
        }
        copyOfBrushSelectedDancers.push(props.id);
        props.setBrushSelectedDancers(copyOfBrushSelectedDancers);
      } else {
        let copyOfBrushSelectedDancers = [...props.brushSelectedDancers];
        copyOfBrushSelectedDancers = copyOfBrushSelectedDancers.filter(
          (id) => id !== props.id
        );
        if (props.id === props.firstDancerInBrush) {
          if (copyOfBrushSelectedDancers.length > 0) {
            props.setFirstDancerInBrush(copyOfBrushSelectedDancers[0]);
          } else {
            props.setFirstDancerInBrush(-1);
          }
        }
        props.setBrushSelectedDancers(copyOfBrushSelectedDancers);
      }
    }
    e.stopPropagation();
  }

  function selectThisDancer(e: any): void {
    if (props.showOrientations) {
      return;
    }

    if (props.draggedDancer !== props.id) {
      props.setHoveredDancer(props.id);
    }
    e.stopPropagation();
  }

  useEffect(() => {
    color = String(determineColor());
  }, [props.role]);

  function getAnimationDuration() {
    if (!props.previousPattern) return 1000;

    let beatDistance: number = props.pattern.beat - props.previousPattern.beat;
    if (props.pattern.bar !== props.previousPattern.bar) {
      beatDistance =
        props.pattern.beat +
        1 +
        (7 - props.previousPattern.beat) +
        (props.pattern.bar - props.previousPattern.bar - 1) * 8;
    }

    const intermediatePatternAmount = props.pattern.intermediatePatterns.length;
    const totalDuration: number = beatDistance * 125;

    return (
      (totalDuration * (1 / props.animationSpeed)) /
      (intermediatePatternAmount + 1)
    );
  }

  const { transform } = useSpring({
    from: {
      transform: `translate(${props.xScale(
        getPositionAfterPatterRotation(props.previousPos, props.patternRotation)
          .x
      )}, ${props.yScale(
        getPositionAfterPatterRotation(props.previousPos, props.patternRotation)
          .y
      )})`,
    },
    to: async (next, cancel) => {
      for (let i = 0; i < props.pattern.intermediatePatterns.length; i++) {
        await next({
          transform: `translate(${props.xScale(
            getIntermediatePositionAfterPatterRotation(
              props.pattern.intermediatePatterns[i].positions[
                props.coupleId - 1
              ].position[(props.id + 1) % 2],
              props.patternRotation
            ).x
          )}, ${props.yScale(
            getIntermediatePositionAfterPatterRotation(
              props.pattern.intermediatePatterns[i].positions[
                props.coupleId - 1
              ].position[(props.id + 1) % 2],
              props.patternRotation
            ).y
          )})`,
        });
      }
      await next({
        transform: `translate(${props.xScale(
          getPositionAfterPatterRotation(props.pos, props.patternRotation).x
        )}, ${props.yScale(
          getPositionAfterPatterRotation(props.pos, props.patternRotation).y
        )})`,
      });
    },
    config: { duration: getAnimationDuration() },
  });

  function getTransform() {
    if (props.draggedDancer === props.id) {
      return calculateDraggedDancerPosition();
    }

    if (
      props.brushSelectedDancers.includes(props.id) &&
      props.draggedDancer > -1 &&
      props.brushSelectedDancers.includes(props.draggedDancer)
    ) {
      return calculateBrushDraggedDancerPosition(true);
    }

    if (!props.editingModeActive && props.currentlyInAnimation) {
      return transform;
    } else {
      return `translate(${props.xScale(
        getPositionAfterPatterRotation(props.pos, props.patternRotation).x
      )}, ${props.yScale(
        getPositionAfterPatterRotation(props.pos, props.patternRotation).y
      )})`;
    }
  }

  function mouseDownOnDancer(e: any) {
    if (
      props.showOrientations ||
      !props.editingModeActive ||
      props.showTransitions ||
      props.isCalloutVisible ||
      e.button !== 0 ||
      e.ctrlKey
    ) {
      e.stopPropagation();
      return;
    }

    if (props.mouseDownPosition.x === -1 && props.mouseDownPosition.y === -1) {
      props.setDraggedDancer(props.id);
      props.setShowScalingComponent(false);
    }

    e.stopPropagation();
  }

  function mouseMoveOnDancer(e: any) {
    if (
      props.showOrientations ||
      props.isCalloutVisible ||
      props.showTransitions ||
      e.button !== 0 ||
      e.ctrlKey
    ) {
      return;
    }
    props.setMouseMovePosition(e);
  }

  function mouseUpOnDancer(e: any) {
    if (
      !props.editingModeActive ||
      props.showOrientations ||
      props.isCalloutVisible ||
      e.button !== 0
    ) {
      return;
    }

    const delta = calculateBrushDraggedDancerPosition(false) as {
      x: number;
      y: number;
    };
    props.brushSelectedDancers.forEach((dancerId) => {
      if (dancerId !== props.draggedDancer) {
        props.moveDancer(
          props.selectedPattern,
          dancerId,
          props.xScale.invert(
            props.xScale(
              props.pattern.positions[Math.floor((dancerId - 1) / 2)].position[
                (dancerId - 1) % 2
              ].x
            ) + delta.x
          ),
          props.yScale.invert(
            props.yScale(
              props.pattern.positions[Math.floor((dancerId - 1) / 2)].position[
                (dancerId - 1) % 2
              ].y
            ) + delta.y
          )
        );
      }
    });

    props.moveDancer(
      props.selectedPattern,
      props.id,
      props.xScale.invert(props.currentMousePosition.x - 40),
      props.yScale.invert(props.currentMousePosition.y - 40)
    );

    if (props.brushSelectedDancers.length > 0) {
      props.setShowScalingComponent(true);
    }

    props.setMouseUpPosition(e);
    props.setDraggedDancer(-1);
    e.stopPropagation();
  }

  function calculateBrushDraggedDancerPosition(returnAsTransform: boolean) {
    let choreoPositionX: number;
    let choreoPositionY: number;

    const deltaX =
      props.currentMousePosition.x -
      40 -
      props.xScale(
        props.pattern.positions[Math.floor((props.draggedDancer - 1) / 2)]
          .position[(props.draggedDancer - 1) % 2].x
      );

    const deltaY =
      props.currentMousePosition.y -
      40 -
      props.yScale(
        props.pattern.positions[Math.floor((props.draggedDancer - 1) / 2)]
          .position[(props.draggedDancer - 1) % 2].y
      );

    if (props.gridDragEnabled) {
      choreoPositionX = props.xScale(
        clampToGridPosition(
          props.xScale.invert(props.xScale(props.pos.x) + deltaX),
          -8,
          8
        )
      );
      choreoPositionY = props.yScale(
        clampToGridPosition(
          props.yScale.invert(props.yScale(props.pos.y) + deltaY),
          -8,
          8
        )
      );
    } else {
      choreoPositionX = props.xScale(props.pos.x) + deltaX;
      choreoPositionY = props.yScale(props.pos.y) + deltaY;
    }

    if (returnAsTransform) {
      return `translate(${choreoPositionX}, ${choreoPositionY})`;
    } else {
      return {
        x: deltaX,
        y: deltaY,
      };
    }
  }

  function calculateDraggedDancerPosition() {
    let choreoPositionX: number;
    let choreoPositionY: number;

    let discreteX;
    let discreteY;

    if (props.gridDragEnabled) {
      discreteX = clampToGridPosition(
        props.xScale.invert(props.currentMousePosition.x - 40),
        -8,
        8
      );
      choreoPositionX = props.xScale(discreteX);
      discreteY = -clampToGridPosition(
        props.xScale.invert(props.currentMousePosition.y - 40),
        -8,
        8
      );
      choreoPositionY = props.yScale(discreteY);
    } else {
      choreoPositionX = props.currentMousePosition.x - 40;
      choreoPositionY = props.currentMousePosition.y - 40;
    }

    return `translate(${choreoPositionX}, ${choreoPositionY})`;
  }

  function getStrokeWidth() {
    return props.brushSelectedDancers.includes(props.id) ? "3" : "0";
  }

  function getDancerIcon() {
    let radius: number = 0.028 * props.dms.boundedWidth;
    if (props.showShapes) {
      radius /= 1.6;
    }
    if (!props.showOrientations) {
      return (
        <animated.circle
          fill={getFill()}
          r={radius}
          stroke={props.firstDancerInBrush === props.id ? "green" : "black"}
          strokeWidth={getStrokeWidth()}
        />
      );
    }

    const bodyOrientationAfterRotation = getOrientationAfterRotation(
      props.pos.bodyOrientation,
      props.patternRotation
    );

    return (
      <>
        <animated.path
          fill={getFill()}
          stroke={props.firstDancerInBrush === props.id ? "blue" : "black"}
          strokeWidth={getStrokeWidth()}
          d={
            "M " +
            -radius +
            " 0 A " +
            radius +
            " " +
            radius +
            " 0 0 1 " +
            radius +
            " 0"
          }
          transform={`rotate(${bodyOrientationAfterRotation})`}
        />
        <animated.path
          fill={getOrientationBacksideFill()}
          stroke="black"
          strokeWidth={getStrokeWidth()}
          d={
            "M " +
            -radius +
            " 0 A " +
            radius +
            " " +
            radius +
            " 0 0 1 " +
            radius +
            " 0"
          }
          transform={`rotate(${bodyOrientationAfterRotation + 180})`}
        />
      </>
    );
  }

  function getHeadOrientationMarker() {
    const radius: number = 0.028 * props.dms.boundedWidth;

    const headOrientationAfterRotation = getOrientationAfterRotation(
      props.pos.headOrientation,
      props.patternRotation
    );

    return (
      <animated.line
        x1={0}
        y1={0}
        x2={
          1.7 *
          radius *
          Math.sin(headOrientationAfterRotation * (Math.PI / 180))
        }
        y2={
          -1.7 *
          radius *
          Math.cos(headOrientationAfterRotation * (Math.PI / 180))
        }
        stroke="black"
        strokeWidth="3"
      />
    );
  }

  function getDancerLabel() {
    return (
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
        {props.coupleId}
      </animated.text>
    );
  }

  function getDancerVisibility() {
    if (!props.showTransitions) {
      if (props.danceCouple.joint && props.id % 2 === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    } else {
      if (props.selectedDancerForTransitions === -1) return "visible";
      if (props.selectedDancerForTransitions > -1) {
        if (props.pattern.id === 0) return "visible";

        if (props.selectedDancerForTransitions === props.id) {
          return "visible";
        }
        if (
          props.danceCouple.joint ||
          props.previousPattern.positions[props.coupleId - 1].joint
        ) {
          if (
            props.id % 2 === 0 &&
            props.selectedDancerForTransitions === props.id - 1
          ) {
            return "visible";
          }
          if (
            props.id % 2 === 1 &&
            props.selectedDancerForTransitions === props.id + 1
          ) {
            return "visible";
          }
        }
      }
    }

    return "hidden";
  }

  return (
    <>
      <animated.g
        key={props.id}
        id={"dancer" + props.id}
        transform={getTransform() as string}
        style={{
          cursor: "pointer",
          zIndex: props.draggedDancer === props.id ? "-1" : "0",
        }}
        onMouseOver={hoverThisDancer}
        onClick={clickThisDancer}
        onMouseLeave={dehoverThisDancer}
        onMouseDown={mouseDownOnDancer}
        onMouseUp={mouseUpOnDancer}
        onMouseMove={mouseMoveOnDancer}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.showCallout(
            props.xScale(props.pos.x) + 0.028 * props.dms.boundedWidth,
            props.yScale(props.pos.y) - 0.028 * props.dms.boundedWidth - 5,
            props.danceCouple.joint,
            props.id
          );
        }}
        visibility={getDancerVisibility()}
      >
        {props.showOrientations && getHeadOrientationMarker()}
        {getDancerIcon()}
        {getDancerLabel()}
      </animated.g>

      <OrientationVisModal
        showModal={showModal}
        setShowModal={setShowModal}
        setShowModalForPatternView={props.setShowModal}
        selectedPattern={props.selectedPattern}
        dancerId={props.id}
        frontsideColor={color}
        backsideColor={getOrientationBacksideFill()}
        rotateDancerBody={props.rotateDancerBody}
        rotateDancerHead={props.rotateDancerHead}
        editingModeActive={props.editingModeActive}
        brushSelectedDancers={props.brushSelectedDancers}
        joint={props.danceCouple.joint}
        pos={props.pos}
        numCouples={props.pattern.positions.length}
      />
    </>
  );
}

export default Dancer;
