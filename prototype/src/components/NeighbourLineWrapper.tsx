import { useState } from "react";
import { NeighbourLineWrapperProps } from "../interfaces/PatternView";
import NeighbourLine from "./NeighbourLine";
import { useEffect } from "react";
import { Position } from "../interfaces/Choreography";

function NeighbourLineWrapper(props: NeighbourLineWrapperProps) {
  const [verticalPositions, setVerticalPositions] = useState({
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  });
  const [horizontalPositions, setHorizontalPositions] = useState({
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  });
  const [ascendingPositions, setAscendingPositions] = useState({
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  });
  const [descendingPositions, setDescendingPositions] = useState({
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  });

  useEffect(() => {
    if (props.hoveredDancer > -1) {
      const verticalMinimum = getMinimumPosition("vertical");
      const verticalMaximum = getMaximumPosition("vertical");
      setVerticalPositions({
        minX: verticalMinimum.x,
        maxX: verticalMaximum.x,
        minY: verticalMinimum.y,
        maxY: verticalMaximum.y,
      });

      const horizontalMinimum = getMinimumPosition("horizontal");
      const horizontalMaximum = getMaximumPosition("horizontal");
      setHorizontalPositions({
        minX: horizontalMinimum.x,
        minY: horizontalMinimum.y,
        maxX: horizontalMaximum.x,
        maxY: horizontalMaximum.y,
      });

      setPositionsForAscendingDiagonal();
      setPositionsForDescendingDiagonal();
    } else {
      setVerticalPositions({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
      setHorizontalPositions({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
      setAscendingPositions({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
      setDescendingPositions({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    }
  }, [props.hoveredDancer]);

  function getMinimumPosition(orientation: string) {
    if (props.hoveredDancer === -1) return { x: 0, y: 0 };

    const coupleNumber: number = Math.floor((props.hoveredDancer - 1) / 2);
    const dancerNumberInDanceCouple: number = (props.hoveredDancer - 1) % 2;

    let minimumPosition = {
      x: props.pattern.positions[coupleNumber].position[
        dancerNumberInDanceCouple
      ].x,
      y: props.pattern.positions[coupleNumber].position[
        dancerNumberInDanceCouple
      ].y,
    };

    let candidates: number[] = [];
    props.pattern.positions.forEach((danceCouple) => {
      for (let i = 0; i < danceCouple.position.length; i++) {
        const xPosition = danceCouple.position[i].x;
        const yPosition = danceCouple.position[i].y;

        switch (orientation) {
          case "horizontal":
            if (minimumPosition.y === yPosition) {
              candidates.push(danceCouple.id * 2 - 1 + i);
              if (xPosition < minimumPosition.x) {
                minimumPosition.x = xPosition;
              }
            }
            break;
          case "vertical":
            if (minimumPosition.x === xPosition) {
              candidates.push(danceCouple.id * 2 - 1 + i);
              if (yPosition < minimumPosition.y) {
                minimumPosition.y = yPosition;
              }
            }
            break;
        }
      }
    });
    return minimumPosition;
  }

  function getMaximumPosition(orientation: string) {
    if (props.hoveredDancer === -1) return { x: 0, y: 0 };

    const coupleNumber: number = Math.floor((props.hoveredDancer - 1) / 2);
    const dancerNumberInDanceCouple: number = (props.hoveredDancer - 1) % 2;

    let maximumPosition = {
      x: props.pattern.positions[coupleNumber].position[
        dancerNumberInDanceCouple
      ].x,
      y: props.pattern.positions[coupleNumber].position[
        dancerNumberInDanceCouple
      ].y,
    };

    let candidates: number[] = [];
    props.pattern.positions.forEach((danceCouple) => {
      for (let i = 0; i < danceCouple.position.length; i++) {
        const xPosition = danceCouple.position[i].x;
        const yPosition = danceCouple.position[i].y;

        switch (orientation) {
          case "horizontal":
            if (maximumPosition.y === yPosition) {
              candidates.push(danceCouple.id * 2 - 1 + i);
              if (xPosition > maximumPosition.x) {
                maximumPosition.x = xPosition;
              }
            }
            break;
          case "vertical":
            if (maximumPosition.x === xPosition) {
              candidates.push(danceCouple.id * 2 - 1 + i);
              if (yPosition > maximumPosition.y) {
                maximumPosition.y = yPosition;
              }
            }
            break;
        }
      }
    });

    const hoveredDancerX =
      props.pattern.positions[coupleNumber].position[dancerNumberInDanceCouple]
        .x;
    const hoveredDancerY =
      props.pattern.positions[coupleNumber].position[dancerNumberInDanceCouple]
        .y;

    const EPS = 0.01;
    let nearestCandidatesLeft: number[] = [];
    let nearestCandidatesRight: number[] = [];
    let minimalDistanceLeft = Number.MAX_VALUE;
    let minimalDistanceRight = Number.MAX_VALUE;
    switch (orientation) {
      case "horizontal":
        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          const candidateX =
            props.pattern.positions[Math.floor((candidate - 1) / 2)].position[
              (candidate - 1) % 2
            ].x;
          const candidateY =
            props.pattern.positions[Math.floor((candidate - 1) / 2)].position[
              (candidate - 1) % 2
            ].y;
          if (
            candidate === props.hoveredDancer ||
            candidateY !== hoveredDancerY
          )
            continue;

          const distance = Math.abs(hoveredDancerX - candidateX);
          if (distance > 0) {
            if (distance < minimalDistanceLeft) {
              minimalDistanceLeft = distance;
              nearestCandidatesLeft = [];
              nearestCandidatesLeft.push(candidate);
            } else if (distance <= minimalDistanceLeft) {
              nearestCandidatesLeft.push(candidate);
            }
          } else if (distance < 0) {
            if (-distance < minimalDistanceRight) {
              minimalDistanceRight = distance;
              nearestCandidatesLeft = [];
              nearestCandidatesLeft.push(candidate);
            } else if (distance <= minimalDistanceRight) {
              nearestCandidatesLeft.push(candidate);
            }
          }
        }
        let temp: number[] = [];
        nearestCandidatesLeft.forEach((candidate) => {
          temp.push(candidate);
        });
        nearestCandidatesRight.forEach((candidate) => {
          temp.push(candidate);
        });

        props.setCandidatesOnHorizontalLine(temp);
        break;
      case "vertical":
        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          const candidateX =
            props.pattern.positions[Math.floor((candidate - 1) / 2)].position[
              (candidate - 1) % 2
            ].x;
          const candidateY =
            props.pattern.positions[Math.floor((candidate - 1) / 2)].position[
              (candidate - 1) % 2
            ].y;
          if (
            candidate === props.hoveredDancer ||
            candidateX !== hoveredDancerX
          )
            continue;
          const distance = Math.abs(hoveredDancerY - candidateY);
          if (distance > 0) {
            if (distance < minimalDistanceLeft) {
              minimalDistanceLeft = distance;
              nearestCandidatesLeft = [];
              nearestCandidatesLeft.push(candidate);
            } else if (distance <= minimalDistanceLeft) {
              nearestCandidatesLeft.push(candidate);
            }
          } else if (distance < 0) {
            if (-distance < minimalDistanceRight) {
              minimalDistanceRight = distance;
              nearestCandidatesLeft = [];
              nearestCandidatesLeft.push(candidate);
            } else if (distance <= minimalDistanceRight) {
              nearestCandidatesLeft.push(candidate);
            }
          }
        }
        let temp1: number[] = [];
        nearestCandidatesLeft.forEach((candidate) => {
          temp1.push(candidate);
        });
        nearestCandidatesRight.forEach((candidate) => {
          temp1.push(candidate);
        });

        props.setCandidatesOnVerticalLine(temp1);

        break;
    }
    return maximumPosition;
  }

  function setPositionsForAscendingDiagonal() {
    if (props.hoveredDancer === -1) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const coupleNumber: number = Math.floor((props.hoveredDancer - 1) / 2);
    const dancerNumberInDanceCouple: number = (props.hoveredDancer - 1) % 2;

    let hoveredDancer: Position =
      props.pattern.positions[coupleNumber].position[dancerNumberInDanceCouple];
    let leftCandidates: { id: number; x: number; y: number }[] = [];
    let rightCandidates: { id: number; x: number; y: number }[] = [];

    props.pattern.positions.forEach((danceCouple) => {
      const gentleman = danceCouple.position[0];
      const lady = danceCouple.position[1];

      if (gentleman.x < hoveredDancer.x && gentleman.y < hoveredDancer.y) {
        if (
          !(
            coupleNumber + 1 === danceCouple.id &&
            dancerNumberInDanceCouple === 0
          )
        ) {
          leftCandidates.push({
            id: 2 * danceCouple.id - 1,
            x: gentleman.x,
            y: gentleman.y,
          });
        }
      }

      if (gentleman.x > hoveredDancer.x && gentleman.y > hoveredDancer.y) {
        if (
          !(
            coupleNumber + 1 === danceCouple.id &&
            dancerNumberInDanceCouple === 0
          )
        ) {
          rightCandidates.push({
            id: 2 * danceCouple.id - 1,
            x: gentleman.x,
            y: gentleman.y,
          });
        }
      }

      if (!danceCouple.joint) {
        if (lady.x < hoveredDancer.x && lady.y < hoveredDancer.y) {
          if (
            !(
              coupleNumber + 1 === danceCouple.id &&
              dancerNumberInDanceCouple === 1
            )
          ) {
            leftCandidates.push({
              id: 2 * danceCouple.id,
              x: lady.x,
              y: lady.y,
            });
          }
        }

        if (lady.x > hoveredDancer.x && lady.y > hoveredDancer.y) {
          if (
            !(
              coupleNumber + 1 === danceCouple.id &&
              dancerNumberInDanceCouple === 1
            )
          ) {
            rightCandidates.push({
              id: 2 * danceCouple.id,
              x: lady.x,
              y: lady.y,
            });
          }
        }
      }
    });

    let returnValue = { minX: 9, maxX: -9, minY: 9, maxY: -9 };
    let returnCandidates: { id: number; x: number; y: number }[] = [];

    const EPS = 0.0001;
    if (leftCandidates.length > 0 && rightCandidates.length > 0) {
      leftCandidates.forEach((leftCandidate) => {
        rightCandidates.forEach((rightCandidate) => {
          const rightSlope =
            (rightCandidate.y - hoveredDancer.y) /
            (rightCandidate.x - hoveredDancer.x);
          const leftSlope =
            (hoveredDancer.y - leftCandidate.y) /
            (hoveredDancer.x - leftCandidate.x);
          if (Math.abs(rightSlope - leftSlope) < EPS) {
            let candidatesOnLine: { id: number; x: number; y: number }[] = [];
            leftCandidates.forEach((leftCandidateOnLine) => {
              const candidateOnLineSlope =
                (hoveredDancer.y - leftCandidateOnLine.y) /
                (hoveredDancer.x - leftCandidateOnLine.x);
              if (Math.abs(candidateOnLineSlope - leftSlope) < EPS) {
                candidatesOnLine.push(leftCandidateOnLine);
              }
            });
            rightCandidates.forEach((rightCandidateOnLine) => {
              const candidateOnLineSlope =
                (rightCandidateOnLine.y - hoveredDancer.y) /
                (rightCandidateOnLine.x - hoveredDancer.x);
              if (Math.abs(candidateOnLineSlope - rightSlope) < EPS) {
                candidatesOnLine.push(rightCandidateOnLine);
              }
            });

            candidatesOnLine.push({
              id: props.hoveredDancer,
              x: hoveredDancer.x,
              y: hoveredDancer.y,
            });

            if (candidatesOnLine.length >= 4) {
              if (
                rightCandidate.x >= returnValue.maxX &&
                leftCandidate.x <= returnValue.minX
              ) {
                returnValue = {
                  minX: leftCandidate.x,
                  maxX: rightCandidate.x,
                  minY: leftCandidate.y,
                  maxY: rightCandidate.y,
                };
                returnCandidates = candidatesOnLine;
              }
            }
          }
        });
      });
    }
    if (rightCandidates.length > 0 && returnValue.minX === 9) {
      rightCandidates.forEach((candidate) => {
        const candidateSlope =
          (candidate.y - hoveredDancer.y) / (candidate.x - hoveredDancer.x);
        let lineCandidates: { id: number; x: number; y: number }[] = [];
        rightCandidates.forEach((lineCandidate) => {
          const lineCandidateSlope =
            (lineCandidate.y - hoveredDancer.y) /
            (lineCandidate.x - hoveredDancer.x);
          if (Math.abs(lineCandidateSlope - candidateSlope) < EPS) {
            lineCandidates.push(lineCandidate);
          }
        });
        lineCandidates.push({
          id: props.hoveredDancer,
          x: hoveredDancer.x,
          y: hoveredDancer.y,
        });
        if (lineCandidates.length >= 4) {
          if (candidate.x >= returnValue.maxX) {
            returnValue = {
              minX: hoveredDancer.x,
              maxX: candidate.x,
              minY: hoveredDancer.y,
              maxY: candidate.y,
            };
            returnCandidates = lineCandidates;
          }
        }
      });
    }
    if (leftCandidates.length > 0 && returnValue.minX === 9) {
      leftCandidates.forEach((candidate) => {
        const candidateSlope =
          (hoveredDancer.y - candidate.y) / (hoveredDancer.x - candidate.x);
        let lineCandidates: { id: number; x: number; y: number }[] = [];
        leftCandidates.forEach((lineCandidate) => {
          const lineCandidateSlope =
            (hoveredDancer.y - lineCandidate.y) /
            (hoveredDancer.x - lineCandidate.x);
          if (Math.abs(lineCandidateSlope - candidateSlope) < EPS) {
            lineCandidates.push(lineCandidate);
          }
        });
        lineCandidates.push({
          id: props.hoveredDancer,
          x: hoveredDancer.x,
          y: hoveredDancer.y,
        });
        if (lineCandidates.length >= 4) {
          if (candidate.x <= returnValue.minX) {
            returnValue = {
              minX: hoveredDancer.x,
              maxX: candidate.x,
              minY: hoveredDancer.y,
              maxY: candidate.y,
            };
            returnCandidates = lineCandidates;
          }
        }
      });
    }

    if (returnValue.minX === 9) {
      setAscendingPositions({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
    } else {
      setAscendingPositions(returnValue);
    }

    let returnIds: number[] = [];
    let minimalDistance: number = Number.MAX_VALUE;
    returnCandidates.forEach((candidate) => {
      if (props.hoveredDancer === candidate.id) {
        return;
      }

      const deltaX = hoveredDancer.x - candidate.x;
      const deltaY = hoveredDancer.y - candidate.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < minimalDistance) {
        minimalDistance = distance;
        returnIds = [];
        returnIds.push(candidate.id);
      } else if (distance - minimalDistance < EPS) {
        returnIds.push(candidate.id);
      }
    });
    props.setCandidatesOnAscendingLine(returnIds);
  }

  function setPositionsForDescendingDiagonal() {
    if (props.hoveredDancer === -1) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const coupleNumber: number = Math.floor((props.hoveredDancer - 1) / 2);
    const dancerNumberInDanceCouple: number = (props.hoveredDancer - 1) % 2;

    let hoveredDancer: Position =
      props.pattern.positions[coupleNumber].position[dancerNumberInDanceCouple];
    let leftCandidates: { id: number; x: number; y: number }[] = [];
    let rightCandidates: { id: number; x: number; y: number }[] = [];

    props.pattern.positions.forEach((danceCouple) => {
      const gentleman = danceCouple.position[0];
      const lady = danceCouple.position[1];

      if (gentleman.x < hoveredDancer.x && gentleman.y > hoveredDancer.y) {
        if (
          !(
            coupleNumber + 1 === danceCouple.id &&
            dancerNumberInDanceCouple === 0
          )
        ) {
          leftCandidates.push({
            id: 2 * danceCouple.id - 1,
            x: gentleman.x,
            y: gentleman.y,
          });
        }
      }

      if (gentleman.x > hoveredDancer.x && gentleman.y < hoveredDancer.y) {
        if (
          !(
            coupleNumber + 1 === danceCouple.id &&
            dancerNumberInDanceCouple === 0
          )
        ) {
          rightCandidates.push({
            id: 2 * danceCouple.id - 1,
            x: gentleman.x,
            y: gentleman.y,
          });
        }
      }

      if (!danceCouple.joint) {
        if (lady.x < hoveredDancer.x && lady.y > hoveredDancer.y) {
          if (
            !(
              coupleNumber + 1 === danceCouple.id &&
              dancerNumberInDanceCouple === 1
            )
          ) {
            leftCandidates.push({
              id: 2 * danceCouple.id,
              x: lady.x,
              y: lady.y,
            });
          }
        }

        if (lady.x > hoveredDancer.x && lady.y < hoveredDancer.y) {
          if (
            !(
              coupleNumber + 1 === danceCouple.id &&
              dancerNumberInDanceCouple === 1
            )
          ) {
            rightCandidates.push({
              id: 2 * danceCouple.id,
              x: lady.x,
              y: lady.y,
            });
          }
        }
      }
    });

    let returnValue = { minX: 9, maxX: -9, minY: 9, maxY: -9 };
    let returnCandidates: { id: number; x: number; y: number }[] = [];

    const EPS = 0.0001;
    if (leftCandidates.length > 0 && rightCandidates.length > 0) {
      leftCandidates.forEach((leftCandidate) => {
        rightCandidates.forEach((rightCandidate) => {
          const rightSlope =
            (hoveredDancer.y - rightCandidate.y) /
            (rightCandidate.x - hoveredDancer.x);
          const leftSlope =
            (leftCandidate.y - hoveredDancer.y) /
            (hoveredDancer.x - leftCandidate.x);
          if (Math.abs(rightSlope - leftSlope) < EPS) {
            let candidatesOnLine: { id: number; x: number; y: number }[] = [];
            leftCandidates.forEach((leftCandidateOnLine) => {
              const candidateOnLineSlope =
                (leftCandidateOnLine.y - hoveredDancer.y) /
                (hoveredDancer.x - leftCandidateOnLine.x);
              if (Math.abs(candidateOnLineSlope - leftSlope) < EPS) {
                candidatesOnLine.push(leftCandidateOnLine);
              }
            });
            rightCandidates.forEach((rightCandidateOnLine) => {
              const candidateOnLineSlope =
                (hoveredDancer.y - rightCandidateOnLine.y) /
                (rightCandidateOnLine.x - hoveredDancer.x);
              if (Math.abs(candidateOnLineSlope - rightSlope) < EPS) {
                candidatesOnLine.push(rightCandidateOnLine);
              }
            });

            candidatesOnLine.push({
              id: props.hoveredDancer,
              x: hoveredDancer.x,
              y: hoveredDancer.y,
            });

            if (candidatesOnLine.length >= 4) {
              if (
                rightCandidate.x >= returnValue.maxX &&
                leftCandidate.x <= returnValue.minX
              ) {
                returnValue = {
                  minX: leftCandidate.x,
                  maxX: rightCandidate.x,
                  minY: leftCandidate.y,
                  maxY: rightCandidate.y,
                };
                returnCandidates = candidatesOnLine;
              }
            }
          }
        });
      });
    }
    if (rightCandidates.length > 0 && returnValue.minX === 9) {
      rightCandidates.forEach((candidate) => {
        const candidateSlope =
          (hoveredDancer.y - candidate.y) / (candidate.x - hoveredDancer.x);
        let lineCandidates: { id: number; x: number; y: number }[] = [];
        rightCandidates.forEach((lineCandidate) => {
          const lineCandidateSlope =
            (hoveredDancer.y - lineCandidate.y) /
            (lineCandidate.x - hoveredDancer.x);
          if (Math.abs(lineCandidateSlope - candidateSlope) < EPS) {
            lineCandidates.push(lineCandidate);
          }
        });
        lineCandidates.push({
          id: props.hoveredDancer,
          x: hoveredDancer.x,
          y: hoveredDancer.y,
        });
        if (lineCandidates.length >= 4) {
          if (candidate.x >= returnValue.maxX) {
            returnValue = {
              minX: hoveredDancer.x,
              maxX: candidate.x,
              minY: hoveredDancer.y,
              maxY: candidate.y,
            };
            returnCandidates = lineCandidates;
          }
        }
      });
    }
    if (leftCandidates.length > 0 && returnValue.minX === 9) {
      leftCandidates.forEach((candidate) => {
        const candidateSlope =
          (candidate.y - hoveredDancer.y) / (hoveredDancer.x - candidate.x);
        let lineCandidates: { id: number; x: number; y: number }[] = [];
        leftCandidates.forEach((lineCandidate) => {
          const lineCandidateSlope =
            (lineCandidate.y - hoveredDancer.y) /
            (hoveredDancer.x - lineCandidate.x);
          if (Math.abs(lineCandidateSlope - candidateSlope) < EPS) {
            lineCandidates.push(lineCandidate);
          }
        });
        lineCandidates.push({
          id: props.hoveredDancer,
          x: hoveredDancer.x,
          y: hoveredDancer.y,
        });

        if (lineCandidates.length >= 4) {
          if (candidate.x <= returnValue.minX) {
            returnValue = {
              minX: candidate.x,
              maxX: hoveredDancer.x,
              minY: candidate.y,
              maxY: hoveredDancer.y,
            };
            returnCandidates = lineCandidates;
          }
        }
      });
    }

    if (returnValue.minX === 9) {
      setDescendingPositions({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
    } else {
      setDescendingPositions(returnValue);
    }

    let returnIds: number[] = [];
    let minimalDistance: number = Number.MAX_VALUE;
    returnCandidates.forEach((candidate) => {
      if (props.hoveredDancer === candidate.id) {
        return;
      }

      const deltaX = hoveredDancer.x - candidate.x;
      const deltaY = hoveredDancer.y - candidate.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < minimalDistance) {
        minimalDistance = distance;
        returnIds = [];
        returnIds.push(candidate.id);
      } else if (distance - minimalDistance < EPS) {
        returnIds.push(candidate.id);
      }
    });
    props.setCandidatesOnDescendingLine(returnIds);
  }

  function neighbourLine(
    positions: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    },
    orientation: string
  ) {
    return (
      <NeighbourLine
        hoveredDancer={props.hoveredDancer}
        pattern={props.pattern}
        xScale={props.xScale}
        yScale={props.yScale}
        positions={positions}
        orientation={orientation}
        patternRotation={props.patternRotation}
      />
    );
  }

  return (
    <g
      transform={`translate(${[props.dms.marginLeft, props.dms.marginTop].join(
        ","
      )})`}
      visibility={
        props.showHeatmap || props.editingModeActive ? "hidden" : "visible"
      }
      id="neighbourLines"
    >
      <>
        {props.hoveredDancer > -1 &&
          neighbourLine(horizontalPositions, "horizontal")}
        {props.hoveredDancer > -1 &&
          neighbourLine(verticalPositions, "vertical")}
        {props.hoveredDancer > -1 &&
          neighbourLine(ascendingPositions, "ascending")}
        {props.hoveredDancer > -1 &&
          neighbourLine(descendingPositions, "descending")}
      </>
    </g>
  );
}

export default NeighbourLineWrapper;
