import { relative } from "path";
import { IntermediatePattern, Pattern } from "../interfaces/Choreography";
import { TransitionProps } from "../interfaces/PatternView";
import {
  clampToGridPosition,
  getBeatDistance,
  getIntermediatePositionAfterPatterRotation,
  getPositionAfterPatterRotation,
} from "../services/VisServices";
import { interpolateRdYlBu, interpolateRdYlGn } from "d3-scale-chromatic";
import { useEffect, useState } from "react";

function Transition(props: TransitionProps) {
  const [colorScheme, setColorScheme] = useState(
    () => (x: number) => interpolateRdYlBu(x)
  );
  useEffect(() => {
    switch (props.transitionColorScheme) {
      case "RdYlBu":
        setColorScheme(() => (x: number) => interpolateRdYlBu(x));
        break;
      case "RdYlGn":
        setColorScheme(() => (x: number) => interpolateRdYlGn(x));
        break;
    }
  }, [props.transitionColorScheme]);

  /**
   * Given a pattern and an id, find the stored intermediate pattern with the given id.
   * Precondition: pattern.intermediatePatterns.length > 0
   * @param id id to search for
   * @param pattern pattern that saves the intermediate patterns we are searching in
   * @returns intermediate pattern with id @argument id. If this intermediate pattern does not exist
   * the first intermediate pattern will be returned
   */
  function getIntermediatePatternWithId(pattern: Pattern, id: number) {
    let result: IntermediatePattern = pattern.intermediatePatterns[0];
    pattern.intermediatePatterns.forEach((intermediatePattern) => {
      if (intermediatePattern.id === id) {
        result = intermediatePattern;
        return;
      }
    });
    return result;
  }

  function isDraggedHandle(dancerId: number, intermediatePatternId: number) {
    return (
      dancerId === props.draggedHandle.dancerId &&
      intermediatePatternId === props.draggedHandle.intermediatePatternId
    );
  }

  function getFirstTransitionStops(
    firstIntermediatePattern: IntermediatePattern
  ) {
    const distanceToFirstPattern = getBeatDistance(
      props.previousPattern,
      firstIntermediatePattern
    );
    const completeDistance = getBeatDistance(
      props.previousPattern,
      props.pattern
    );
    const relativeDistance = distanceToFirstPattern / completeDistance;
    const offsetForYellow = 1 / (2 * relativeDistance);
    return (
      <>
        <stop offset="0%" stopColor={colorScheme(0)} />
        {relativeDistance >= 0.5 && (
          <stop
            offset={offsetForYellow * 100 + "%"}
            stopColor={colorScheme(0.5)}
          />
        )}
        <stop offset="100%" stopColor={colorScheme(relativeDistance)} />
      </>
    );
  }

  function getLastTransitionStops(
    lastIntermediatePattern: IntermediatePattern
  ) {
    const distanceToIntermediatePattern = getBeatDistance(
      props.previousPattern,
      lastIntermediatePattern
    );
    const completeDistance = getBeatDistance(
      props.previousPattern,
      props.pattern
    );
    const distanceToNextPattern = getBeatDistance(
      lastIntermediatePattern,
      props.pattern
    );
    const relativeDistance = distanceToIntermediatePattern / completeDistance;
    const offsetForYellow = 0.5 - relativeDistance;
    return (
      <>
        <stop offset="0%" stopColor={colorScheme(relativeDistance)} />
        {relativeDistance <= 0.5 && (
          <stop
            offset={Math.round(offsetForYellow * 100) + "%"}
            stopColor={colorScheme(0.5)}
          />
        )}
        <stop offset="100%" stopColor={colorScheme(1)} />
      </>
    );
  }

  function getMiddleTransitionStops(
    intermediatePattern: IntermediatePattern,
    nextIntermediatePattern: IntermediatePattern
  ) {
    const distanceToIntermediatePattern = getBeatDistance(
      props.previousPattern,
      intermediatePattern
    );

    const distanceToNextPattern = getBeatDistance(
      props.previousPattern,
      nextIntermediatePattern
    );
    const fromCurrentToNext = getBeatDistance(
      intermediatePattern,
      nextIntermediatePattern
    );
    const completeDistance = getBeatDistance(
      props.previousPattern,
      props.pattern
    );
    const firstStopColorScaleValue =
      distanceToIntermediatePattern / completeDistance;
    const lastStopColorScaleValue = distanceToNextPattern / completeDistance;

    const offsetForYellow =
      (0.5 - distanceToIntermediatePattern / completeDistance) /
      (fromCurrentToNext / completeDistance);
    return (
      <>
        <stop offset="0%" stopColor={colorScheme(firstStopColorScaleValue)} />
        {firstStopColorScaleValue <= 0.5 && lastStopColorScaleValue >= 0.5 && (
          <stop
            offset={Math.round(offsetForYellow * 100) + "%"}
            stopColor={colorScheme(0.5)}
          />
        )}
        <stop offset="100%" stopColor={colorScheme(lastStopColorScaleValue)} />
      </>
    );
  }

  /**
   * Returns a line which goes from the previous pattern to the current pattern
   * (if no intermediate pattern exists) or a line from the previous pattern to the first
   * intermediate pattern (if one exists).
   */
  function getFirstTransition() {
    if (props.pattern.intermediatePatterns.length > 0) {
      const firstIntermediatePattern: IntermediatePattern =
        getIntermediatePatternWithId(props.pattern, 0);
      return (
        <g>
          <linearGradient
            id={`transition-gradient-couple${props.coupleId}-dancer${props.numberInCouple}-first`}
            gradientUnits="userSpaceOnUse"
            x1={props.xScale(
              getPositionAfterPatterRotation(
                props.previousPattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y1={props.yScale(
              getPositionAfterPatterRotation(
                props.previousPattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
            x2={props.xScale(
              getIntermediatePositionAfterPatterRotation(
                firstIntermediatePattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y2={props.yScale(
              getIntermediatePositionAfterPatterRotation(
                firstIntermediatePattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
          >
            {getFirstTransitionStops(firstIntermediatePattern)}
          </linearGradient>
          <line
            x1={props.xScale(
              getPositionAfterPatterRotation(
                props.previousPattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y1={props.yScale(
              getPositionAfterPatterRotation(
                props.previousPattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
            x2={props.xScale(
              getIntermediatePositionAfterPatterRotation(
                firstIntermediatePattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y2={props.yScale(
              getIntermediatePositionAfterPatterRotation(
                firstIntermediatePattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
            stroke={`url(#transition-gradient-couple${props.coupleId}-dancer${props.numberInCouple}-first)`}
            strokeWidth="2"
          />
        </g>
      );
    } else {
      return (
        <g>
          <linearGradient
            id={`transition-gradient-couple${props.coupleId}-dancer${props.numberInCouple}-first`}
            gradientUnits="userSpaceOnUse"
            x1={props.xScale(
              getPositionAfterPatterRotation(
                props.previousPattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y1={props.yScale(
              getPositionAfterPatterRotation(
                props.previousPattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
            x2={props.xScale(
              getPositionAfterPatterRotation(
                props.pattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y2={props.yScale(
              getPositionAfterPatterRotation(
                props.pattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
          >
            <stop offset="0%" stopColor={colorScheme(0)} />
            <stop offset="50%" stopColor={colorScheme(0.5)} />
            <stop offset="100%" stopColor={colorScheme(1)} />
          </linearGradient>
          <line
            x1={props.xScale(
              getPositionAfterPatterRotation(
                props.previousPattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y1={props.yScale(
              getPositionAfterPatterRotation(
                props.previousPattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
            x2={props.xScale(
              getPositionAfterPatterRotation(
                props.pattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y2={props.yScale(
              getPositionAfterPatterRotation(
                props.pattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
            stroke={`url(#transition-gradient-couple${props.coupleId}-dancer${props.numberInCouple}-first)`}
            strokeWidth="2"
          />
        </g>
      );
    }
  }

  function getLastTransition() {
    if (props.pattern.intermediatePatterns.length > 0) {
      const lastIntermediatePattern: IntermediatePattern =
        getIntermediatePatternWithId(
          props.pattern,
          props.pattern.intermediatePatterns.length - 1
        );
      return (
        <g>
          <linearGradient
            id={`transition-gradient-couple${props.coupleId}-dancer${props.numberInCouple}-last`}
            gradientUnits="userSpaceOnUse"
            x1={props.xScale(
              getIntermediatePositionAfterPatterRotation(
                lastIntermediatePattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y1={props.yScale(
              getIntermediatePositionAfterPatterRotation(
                lastIntermediatePattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
            x2={props.xScale(
              getPositionAfterPatterRotation(
                props.pattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y2={props.yScale(
              getPositionAfterPatterRotation(
                props.pattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
          >
            {getLastTransitionStops(lastIntermediatePattern)}
          </linearGradient>
          <line
            x1={props.xScale(
              getIntermediatePositionAfterPatterRotation(
                lastIntermediatePattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y1={props.yScale(
              getIntermediatePositionAfterPatterRotation(
                lastIntermediatePattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
            x2={props.xScale(
              getPositionAfterPatterRotation(
                props.pattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).x
            )}
            y2={props.yScale(
              getPositionAfterPatterRotation(
                props.pattern.positions[props.coupleId].position[
                  props.numberInCouple
                ],
                props.patternRotation
              ).y
            )}
            stroke={`url(#transition-gradient-couple${props.coupleId}-dancer${props.numberInCouple}-last)`}
            strokeWidth="2"
          />
        </g>
      );
    }
  }

  /**
   * Returns a line which goes from the last intermediate pattern to the current pattern
   * (if at least one intermediate pattern exists) or returns nothing (if no intermediate pattern exists)
   */
  function getOtherTransitions() {
    return props.pattern.intermediatePatterns.map(
      (intermediatePattern, index) => {
        if (
          intermediatePattern.id ===
          props.pattern.intermediatePatterns.length - 1
        )
          return;
        const nextIntermediatePattern: IntermediatePattern =
          getIntermediatePatternWithId(
            props.pattern,
            intermediatePattern.id + 1
          );
        return (
          <>
            <linearGradient
              id={`transition-gradient-couple${props.coupleId}-dancer${props.numberInCouple}-middle-${index}`}
              gradientUnits="userSpaceOnUse"
              x1={props.xScale(
                getIntermediatePositionAfterPatterRotation(
                  intermediatePattern.positions[props.coupleId].position[
                    props.numberInCouple
                  ],
                  props.patternRotation
                ).x
              )}
              y1={props.yScale(
                getIntermediatePositionAfterPatterRotation(
                  intermediatePattern.positions[props.coupleId].position[
                    props.numberInCouple
                  ],
                  props.patternRotation
                ).y
              )}
              x2={props.xScale(
                getIntermediatePositionAfterPatterRotation(
                  nextIntermediatePattern.positions[props.coupleId].position[
                    props.numberInCouple
                  ],
                  props.patternRotation
                ).x
              )}
              y2={props.yScale(
                getIntermediatePositionAfterPatterRotation(
                  nextIntermediatePattern.positions[props.coupleId].position[
                    props.numberInCouple
                  ],
                  props.patternRotation
                ).y
              )}
            >
              {getMiddleTransitionStops(
                intermediatePattern,
                nextIntermediatePattern
              )}
            </linearGradient>
            <line
              x1={props.xScale(
                getIntermediatePositionAfterPatterRotation(
                  intermediatePattern.positions[props.coupleId].position[
                    props.numberInCouple
                  ],
                  props.patternRotation
                ).x
              )}
              y1={props.yScale(
                getIntermediatePositionAfterPatterRotation(
                  intermediatePattern.positions[props.coupleId].position[
                    props.numberInCouple
                  ],
                  props.patternRotation
                ).y
              )}
              x2={props.xScale(
                getIntermediatePositionAfterPatterRotation(
                  nextIntermediatePattern.positions[props.coupleId].position[
                    props.numberInCouple
                  ],
                  props.patternRotation
                ).x
              )}
              y2={props.yScale(
                getIntermediatePositionAfterPatterRotation(
                  nextIntermediatePattern.positions[props.coupleId].position[
                    props.numberInCouple
                  ],
                  props.patternRotation
                ).y
              )}
              stroke={`url(#transition-gradient-couple${props.coupleId}-dancer${props.numberInCouple}-middle-${index})`}
              strokeWidth="2"
            />
          </>
        );
      }
    );
  }

  function getHandles() {
    const dancerId: number =
      (props.coupleId + 1) * 2 - (1 - props.numberInCouple);
    return props.pattern.intermediatePatterns.map(
      (intermediatePattern, index) => {
        return (
          <circle
            cx={
              !isDraggedHandle(dancerId, intermediatePattern.id)
                ? props.xScale(
                    getIntermediatePositionAfterPatterRotation(
                      intermediatePattern.positions[props.coupleId].position[
                        props.numberInCouple
                      ],
                      props.patternRotation
                    ).x
                  )
                : props.xScale(
                    clampToGridPosition(
                      props.xScale.invert(props.currentMousePosition.x - 40),
                      -8,
                      8
                    )
                  )
            }
            cy={
              !isDraggedHandle(dancerId, intermediatePattern.id)
                ? props.yScale(
                    getIntermediatePositionAfterPatterRotation(
                      intermediatePattern.positions[props.coupleId].position[
                        props.numberInCouple
                      ],
                      props.patternRotation
                    ).y
                  )
                : props.yScale(
                    clampToGridPosition(
                      props.yScale.invert(props.currentMousePosition.y - 40),
                      -8,
                      8
                    )
                  )
            }
            r="5"
            fill="black"
            onMouseDown={() =>
              props.setDraggedHandle({
                dancerId: dancerId,
                intermediatePatternId: intermediatePattern.id,
              })
            }
          />
        );
      }
    );
  }

  return (
    <g
      style={{
        cursor: "pointer",
        visibility: props.showTransitions ? "visible" : "hidden",
      }}
    >
      <linearGradient
        id="transition-gradient"
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1="360"
        x2="360"
        y2="0"
      >
        <stop offset="0%" stopColor="blue" />{" "}
        <stop offset="100%" stopColor="red" />
      </linearGradient>
      <g>
        {getFirstTransition()} {getOtherTransitions()} {getLastTransition()}
      </g>
      {props.editingModeActive && <g>{getHandles()}</g>}
    </g>
  );
}

export default Transition;
