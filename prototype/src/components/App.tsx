import { ChangeEvent, useCallback, useEffect, useState } from "react";
import "../styles/App.css";
import "../styles/Toolbar.css";
import "../styles/Timeline.css";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarComponent from "./TopNavbar";
import { Container, Row, Col, Form, Modal, Button } from "react-bootstrap";
import RemarksAccordionComponent from "./RemarksAccordionComponent";
import AccordionComponent from "./AccordionComponent";
import DanceFloorVisualization from "./DanceFloorVisualization";
import VerticalToolbar from "./VerticalToolbar";
import BottomNavbar from "./BottomNavbar";
import {
  Choreography,
  ConvexHull,
  DanceCouple,
  DiscreteHeatmap,
  IntermediateDanceCouple,
  IntermediatePattern,
  IntermediatePosition,
  Pattern,
  Pose,
  Position,
} from "../interfaces/Choreography";
import { SelectOption } from "../interfaces/Toolbar";
import { fetchChoreography } from "../services/FileServices";
import TableView from "./TableView";
import DistancesBarChart from "./DistancesBarChart";
import Timeline from "./Timeline";
import { useImmer } from "use-immer";
import {
  clampToGridPosition,
  getBeatDistance,
  findMaxFrequencyInHeatmap,
  findConvexHull,
  checkDiagonalRotationValidity,
} from "../services/VisServices";
import DismissibleAlert from "./DismissibleAlert";
import { Eye, Pencil } from "react-bootstrap-icons";
import View3D from "./3DView";
import PoseView from "./PoseView";

function App() {
  const [choreo, setChoreo] = useImmer<Choreography | null>(null);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [discreteHeatmap, setDiscreteHeatmap] =
    useImmer<DiscreteHeatmap | null>(null);
  const [highestFrequency, setHighestFrequency] = useState(25);

  const [hoveredDancer, setHoveredDancer] = useState<number>(-1);
  const [selectedDancerFor3D, setSelectedDancerFor3D] = useState(0);
  const [selectedHeatmapTile, setSelectedHeatmapTile] = useState({
    x: -9,
    y: -9,
  });
  const [brushCopy, setBrushCopy] = useState<number[]>([]);
  const [copyOfFirstDancer, setCopyOfFirstDancer] = useState<number>(-1);
  const [brushRotationAngle, setBrushRotationAngle] = useState<number>(0);

  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([
    { value: -1, label: "", key: "-1" },
  ]);

  const [gentlemanColor, setGentlemanColor] = useState<
    string | number | readonly string[] | undefined
  >("#0000ff");
  const [ladyColor, setLadyColor] = useState<
    string | number | readonly string[] | undefined
  >("#ff0000");
  const [coupleColor, setCoupleColor] = useState<
    string | number | readonly string[] | undefined
  >("#4b0082");
  const [transitionColorScheme, setTransitionColorScheme] =
    useState<string>("RdYlBu");

  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [show, setShow] = useState(false);
  const [editingModeActive, setEditingModeActive] = useState(false);
  const [patternRotation, setPatternRotation] = useState<
    "Front" | "Back" | "Left" | "Right"
  >("Front");

  const switchModeModalShowTime = 1000;
  useEffect(() => {
    setShow(true);
    setPatternRotation("Front");
    setTimeout(function () {
      setShow(false);
    }, switchModeModalShowTime);
  }, [editingModeActive, setEditingModeActive]);

  const [fineGridEnabled, setFineGridEnabled] = useState(true);
  const [discreteHeatmapEnabled, setDiscreteHeatmapEnabled] = useState(true);

  const [gridDragEnabled, setGridDragEnabled] = useState(true);

  const [show3DView, setShow3DView] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [showTransitions, setShowTransitions] = useState(false);
  const [showOrientations, setShowOrientations] = useState(false);

  const [showSliderForAnimatedChoreo, setShowSliderForAnimatedChoreo] =
    useState(false);
  const [speedForAnimatedChoreo, setSpeedForAnimatedChoreo] = useState(1);
  const [currentlyInAnimation, setCurrentlyInAnimation] = useState(false);
  useEffect(() => {
    if (currentlyInAnimation) {
      setShowOrientations(false);
      setShowTransitions(false);
      setShowShapes(false);
    }
  }, [currentlyInAnimation]);

  const [showAlert, setShowAlert] = useState(false);
  const [showRotationAlert, setShowRotationAlert] = useState(false);

  const [highestBarNumber, setHighestBarNumber] = useState(60);
  const [timelineMapValues, setTimelineMapValues] = useState<number[]>([]);

  const setChoreoName = useCallback(
    (newChoreoName: string) => {
      setChoreo((draft) => {
        draft!.name = newChoreoName;
      });
    },
    [setChoreo]
  );

  const rotateBrush = useCallback(
    (
      patternId: number,
      brush: number[],
      firstDancer: number,
      rotationAngle: number
    ) => {
      setChoreo((draft) => {
        let pattern = draft!.patterns[patternId];
        let validDiagonalInBrush = checkDiagonalRotationValidity(
          pattern.positions,
          brush,
          firstDancer
        );
        if (!validDiagonalInBrush) {
          setShowRotationAlert(true);
          return;
        }

        let correctedRotationAngle =
          rotationAngle >= 0 ? rotationAngle : 270 + (90 + rotationAngle);

        let firstDancerPosition =
          pattern.positions[Math.floor((firstDancer - 1) / 2)].position[
            (firstDancer - 1) % 2
          ];

        brush.forEach((dancerId) => {
          if (dancerId === firstDancer) return;
          const coupleNumber: number = Math.floor((dancerId - 1) / 2);
          const dancerNumberInDanceCouple: number = (dancerId - 1) % 2;

          const dancerPosition =
            pattern.positions[coupleNumber].position[dancerNumberInDanceCouple];

          const localX = dancerPosition.x - firstDancerPosition.x;
          const localY = dancerPosition.y - firstDancerPosition.y;
          const distance = Math.sqrt(localX * localX + localY * localY);

          const newAngleDeg = correctedRotationAngle;
          const newAngleRad = (newAngleDeg * Math.PI) / 180;

          const newLocalX = clampToGridPosition(
            Math.cos(newAngleRad) * distance,
            -8,
            8
          );
          const newLocalY = clampToGridPosition(
            Math.sin(newAngleRad) * distance,
            -8,
            8
          );

          dancerPosition.x = clampToGridPosition(
            firstDancerPosition.x + newLocalX,
            -8,
            8
          );
          dancerPosition.y = clampToGridPosition(
            firstDancerPosition.y + newLocalY,
            -8,
            8
          );
        });
      });
    },
    [setChoreo]
  );

  const setChoreoDescription = useCallback(
    (newChoreoDescription: string) => {
      setChoreo((draft) => {
        draft!.description = newChoreoDescription;
      });
    },
    [setChoreo]
  );

  const setRemarks = useCallback(
    (patternId: number, newRemarks: string) => {
      setChoreo((draft) => {
        const todo = draft?.patterns[patternId];
        todo!.remarks = newRemarks;
      });
    },
    [setChoreo]
  );

  const setBarAndBeat = useCallback(
    (
      patternId: number,
      newBar: number,
      newBeat: number,
      highestBarNumber: number
    ) => {
      setChoreo((draft) => {
        const pattern = draft!.patterns[patternId];
        if (patternId > 0) {
          let previousPattern: Pattern | IntermediatePattern =
            draft!.patterns[patternId - 1];
          if (draft!.patterns[patternId].intermediatePatterns.length > 0) {
            const lastIntermediatePatternId: number =
              draft!.patterns[patternId].intermediatePatterns.length - 1;
            previousPattern =
              draft!.patterns[patternId].intermediatePatterns[
                lastIntermediatePatternId
              ];
          }
          if (
            previousPattern.bar > newBar ||
            (previousPattern.bar === newBar && previousPattern.beat >= newBeat)
          ) {
            setShowAlert(true);
            return;
          }
        }

        if (patternId < draft!.patterns.length - 1) {
          let followingPattern: Pattern | IntermediatePattern =
            draft!.patterns[patternId + 1];
          if (draft!.patterns[patternId + 1].intermediatePatterns.length > 0) {
            followingPattern =
              draft!.patterns[patternId + 1].intermediatePatterns[0];
          }
          if (
            followingPattern.bar < newBar ||
            (followingPattern.bar === newBar &&
              followingPattern.beat <= newBeat)
          ) {
            setShowAlert(true);
            return;
          }
        }

        if (newBar >= highestBarNumber) {
          setShowAlert(true);
          return;
        }

        pattern.bar = newBar;
        pattern.beat = newBeat;
      });
    },
    [setChoreo]
  );

  const addPatternToDraft = useCallback(
    (patternNameInDraft: string, pattern: Pattern) => {
      setChoreo((draft) => {
        let nameAlreadyInDraft = false;
        draft!.draft.forEach((currentPattern) => {
          if (currentPattern.dance === patternNameInDraft) {
            nameAlreadyInDraft = true;
          }
        });
        if (!nameAlreadyInDraft) {
          draft!.draft.push(pattern);
        }
      });
    },
    [setChoreo]
  );

  function addNewBar() {
    const newHighestBarNumber = highestBarNumber + 1;
    const localTimelineMapValues: number[] = [];
    for (let i = 0; i <= newHighestBarNumber; i++) {
      localTimelineMapValues.push(i);
    }
    setTimelineMapValues(localTimelineMapValues);
    setHighestBarNumber(newHighestBarNumber);
  }

  const addPattern = useCallback(
    (newPattern: Pattern) => {
      setChoreo((draft) => {
        const lastPattern = draft?.patterns[draft?.patterns.length - 1];

        newPattern.bar = lastPattern!.bar + 1;

        newPattern.beat = 0;
        draft?.patterns.push(newPattern);
        setSelectedPattern(draft!.patterns.length - 1);
        updateDiscreteHeatmapAfterPatternInsertion(newPattern);
      });
    },
    [setChoreo]
  );

  useEffect(() => {
    if (choreo && choreo !== null) {
      if (
        choreo!.patterns[choreo!.patterns.length - 1].bar >= highestBarNumber
      ) {
        const newHighestBarNumber = highestBarNumber + 1;
        const localTimelineMapValues: number[] = [];
        for (let i = 0; i <= newHighestBarNumber; i++) {
          localTimelineMapValues.push(i);
        }
        setTimelineMapValues(localTimelineMapValues);
        setHighestBarNumber(newHighestBarNumber);
      }
    }
  }, [choreo]);

  const removePattern = useCallback(
    (patternIdToRemove: number) => {
      setChoreo((draft) => {
        if (patternIdToRemove < draft!.patterns.length - 1) {
          draft!.patterns[patternIdToRemove + 1].intermediatePatterns = [];
        }
        draft!.patterns.splice(patternIdToRemove, 1);

        for (let i = 0; i < draft!.patterns.length; i++) {
          draft!.patterns[i].id = i;
        }
      });
      setSelectedPattern(
        (draft) => (draft = Math.max(0, patternIdToRemove - 1))
      );
    },
    [setChoreo, setSelectedPattern]
  );

  const moveDancerInIntermediatePattern = useCallback(
    (
      patternId: number,
      intermediatePatternId: number,
      dancerId: number,
      newX: number,
      newY: number
    ) => {
      setChoreo((draft) => {
        const coupleNumber: number = Math.floor((dancerId - 1) / 2);
        const dancerNumberInDanceCouple: number = (dancerId - 1) % 2;
        const partnerNumberInDanceCouple: number =
          dancerNumberInDanceCouple === 1 ? 0 : 1;

        let danceCouple: IntermediateDanceCouple =
          draft!.patterns[patternId].intermediatePatterns[intermediatePatternId]
            .positions[coupleNumber];

        let positionToChange: IntermediatePosition =
          danceCouple.position[dancerNumberInDanceCouple];

        positionToChange.x = newX;
        positionToChange.y = newY;

        if (danceCouple.joint) {
          const partnerPositionToChange: IntermediatePosition =
            danceCouple.position[partnerNumberInDanceCouple];
          partnerPositionToChange.x = newX;
          partnerPositionToChange.y = newY;
        }
      });
    },
    [setChoreo]
  );

  const addIntermediatePattern = useCallback(
    (bar: number, beat: number) => {
      setChoreo((draft) => {
        //Check if the beat and bar are valid (with a possible transition)
        const firstPattern: Pattern = draft!.patterns[0];
        const lastPattern: Pattern =
          draft!.patterns[draft!.patterns.length - 1];

        if (
          bar < firstPattern.bar ||
          (bar === firstPattern.bar && beat <= firstPattern.beat)
        ) {
          return;
        }

        if (
          bar > lastPattern.bar ||
          (bar === lastPattern.bar && beat >= lastPattern.beat)
        ) {
          return;
        }

        let positionToInsert = 0;
        let endIteration = false;
        //Find out pattern or intermediate pattern directly before the insertion point
        let patternBefore: Pattern | IntermediatePattern = draft!.patterns[0];
        draft!.patterns.forEach((pattern) => {
          if (endIteration) return;
          positionToInsert = 0;

          for (let j = 0; j < pattern.intermediatePatterns.length; j++) {
            const intermediatePattern = pattern.intermediatePatterns[j];
            if (
              bar > intermediatePattern.bar ||
              (bar === intermediatePattern.bar &&
                beat > intermediatePattern.beat)
            ) {
              patternBefore = intermediatePattern;
              positionToInsert++;
            } else {
              endIteration = true;
              return;
            }
          }

          if (
            bar > pattern.bar ||
            (bar === pattern.bar && beat > pattern.beat)
          ) {
            patternBefore = pattern;
          } else {
            endIteration = true;
            return;
          }
        });

        //Find out pattern or intermediate pattern directly after the insertion point
        let patternAfter: Pattern | IntermediatePattern = draft!.patterns[0];
        for (let i = 0; i < draft!.patterns.length; i++) {
          const pattern = draft!.patterns[i];
          let found = false;
          for (let j = 0; j < pattern.intermediatePatterns.length; j++) {
            const intermediatePattern = pattern.intermediatePatterns[j];
            if (
              bar < intermediatePattern.bar ||
              (bar === intermediatePattern.bar &&
                beat < intermediatePattern.beat)
            ) {
              patternAfter = intermediatePattern;
              found = true;
              break;
            }
          }
          if (found) break;

          if (
            bar < pattern.bar ||
            (bar === pattern.bar && beat < pattern.beat)
          ) {
            patternAfter = pattern;
            break;
          }
        }

        let newIntermediatePattern: IntermediatePattern = {
          id: positionToInsert,
          bar: bar,
          beat: beat,
          positions: [],
        };

        const beatDistanceToPatternBefore = getBeatDistance(
          patternBefore,
          newIntermediatePattern
        );
        const beatDistanceToPatternAfter = getBeatDistance(
          newIntermediatePattern,
          patternAfter
        );

        const relativeDistance =
          beatDistanceToPatternBefore /
          (beatDistanceToPatternBefore + beatDistanceToPatternAfter);

        for (let coupleId = 1; coupleId <= draft!.numCouples; coupleId++) {
          const gentlemanPosBefore =
            patternBefore.positions[coupleId - 1].position[0];
          const ladyPosBefore =
            patternBefore.positions[coupleId - 1].position[1];

          const gentlemanPosAfter =
            patternAfter.positions[coupleId - 1].position[0];
          const ladyPosAfter = patternAfter.positions[coupleId - 1].position[1];

          const gentlemanIntermediatePos: IntermediatePosition = {
            x: clampToGridPosition(
              gentlemanPosBefore.x +
                relativeDistance * (gentlemanPosAfter.x - gentlemanPosBefore.x),
              -8,
              8
            ),
            y: clampToGridPosition(
              gentlemanPosBefore.y +
                relativeDistance * (gentlemanPosAfter.y - gentlemanPosBefore.y),
              -8,
              8
            ),
          };
          const ladyIntermediatePos: IntermediatePosition = {
            x: clampToGridPosition(
              ladyPosBefore.x +
                relativeDistance * (ladyPosAfter.x - ladyPosBefore.x),
              -8,
              8
            ),
            y: clampToGridPosition(
              ladyPosBefore.y +
                relativeDistance * (ladyPosAfter.y - ladyPosBefore.y),
              -8,
              8
            ),
          };

          const intermediateCouple: IntermediateDanceCouple = {
            id: coupleId,
            joint: patternBefore.positions[coupleId - 1].joint,
            position: [gentlemanIntermediatePos, ladyIntermediatePos],
          };

          newIntermediatePattern.positions.push(intermediateCouple);
        }
        //Find out pattern to insert the intermediate position
        let patternToInsert: Pattern = draft!.patterns[0];
        for (let i = 0; i < draft!.patterns.length; i++) {
          const pattern = draft!.patterns[i];
          if (
            bar < pattern.bar ||
            (bar === pattern.bar && beat < pattern.beat)
          ) {
            patternToInsert = pattern;
            break;
          }
        }

        patternToInsert.intermediatePatterns.forEach((intermediatePattern) => {
          if (intermediatePattern.id >= newIntermediatePattern.id) {
            intermediatePattern.id++;
          }
        });

        patternToInsert.intermediatePatterns.push(newIntermediatePattern);

        patternToInsert.intermediatePatterns.sort((a, b) => {
          if (a.id < b.id) {
            return -1;
          } else {
            return 1;
          }
        });
      });
    },
    [setChoreo]
  );

  const moveDancerTogetherWithPartner = useCallback(
    (patternId: number, dancerId: number, newX: number, newY: number) => {
      let calledHeatmapUpdate = false;
      setChoreo((draft) => {
        const pattern = draft?.patterns[patternId];
        const coupleNumber: number = Math.floor((dancerId - 1) / 2);
        const dancerNumberInDanceCouple: number = (dancerId - 1) % 2;
        const partnerNumberInCouple: number =
          dancerNumberInDanceCouple === 0 ? 1 : 0;
        const dancerPosition: Position =
          pattern!.positions[coupleNumber].position[dancerNumberInDanceCouple];
        const partnerPosition: Position =
          pattern!.positions[coupleNumber].position[partnerNumberInCouple];

        const discreteNewX = clampToGridPosition(newX, -8, 8);
        const discreteNewY = clampToGridPosition(newY, -8, 8);
        if (!calledHeatmapUpdate) {
          updateDiscreteHeatmap(
            dancerPosition.x,
            dancerPosition.y,
            discreteNewX,
            discreteNewY
          );
        }
        calledHeatmapUpdate = true;

        dancerPosition.x = discreteNewX;
        dancerPosition.y = discreteNewY;
        partnerPosition.x = discreteNewX;
        partnerPosition.y = discreteNewY;
      });
    },
    [setChoreo]
  );

  function moveDancer(
    patternId: number,
    dancerId: number,
    newX: number,
    newY: number
  ) {
    const coupleNumber: number = Math.floor((dancerId - 1) / 2);
    if (choreo!.patterns[patternId].positions[coupleNumber].joint) {
      moveDancerTogetherWithPartner(patternId, dancerId, newX, newY);
    } else {
      moveDancerAlone(patternId, dancerId, newX, newY);
    }
    updateShapes(patternId, dancerId);
  }

  const updateShapes = useCallback(
    (patternId: number, dancerId: number) => {
      setChoreo((draft) => {
        const pattern = draft!.patterns[patternId];
        let dancerSetsToUpdate: number[][] = [];
        pattern.shapes.forEach((shape) => {
          if (shape.brushSelectedDancers.includes(dancerId)) {
            dancerSetsToUpdate.push(shape.brushSelectedDancers);
          }
        });
        pattern.shapes.filter(
          (shape) => !shape.brushSelectedDancers.includes(dancerId)
        );
        dancerSetsToUpdate.forEach((set) => {
          const newConvexHull = findConvexHull(
            pattern.positions,
            set
          ) as ConvexHull;
          pattern.shapes.push(newConvexHull);
        });
      });
    },
    [setChoreo]
  );

  const separateDanceCouple = useCallback(
    (patternId: number, dancerId: number) => {
      setChoreo((draft) => {
        const coupleNumber: number = Math.floor((dancerId - 1) / 2);
        const danceCouple: DanceCouple =
          draft!.patterns[patternId].positions[coupleNumber];
        danceCouple.joint = false;
        updateHeatmapAfterSeparation(
          danceCouple.position[0].x,
          danceCouple.position[0].y
        );
      });
    },
    [setChoreo]
  );

  const joinDanceCouple = useCallback(
    (patternId: number, dancerId: number) => {
      setChoreo((draft) => {
        const coupleNumber: number = Math.floor((dancerId - 1) / 2);
        const dancerNumberInDanceCouple: number = (dancerId - 1) % 2;
        const partnerNumberInCouple: number =
          dancerNumberInDanceCouple === 0 ? 1 : 0;

        const danceCouple: DanceCouple =
          draft!.patterns[patternId].positions[coupleNumber];

        updateHeatmapAfterJoin(
          danceCouple.position[partnerNumberInCouple].x,
          danceCouple.position[partnerNumberInCouple].y
        );

        danceCouple.joint = true;
        danceCouple.position[partnerNumberInCouple].x =
          danceCouple.position[dancerNumberInDanceCouple].x;
        danceCouple.position[partnerNumberInCouple].y =
          danceCouple.position[dancerNumberInDanceCouple].y;
      });
    },
    [setChoreo]
  );

  const moveDancerAlone = useCallback(
    (patternId: number, dancerId: number, newX: number, newY: number) => {
      let calledHeatmapUpdate = false;
      setChoreo((draft) => {
        const pattern = draft?.patterns[patternId];
        const coupleNumber: number = Math.floor((dancerId - 1) / 2);
        const dancerNumberInDanceCouple: number = (dancerId - 1) % 2;
        const dancerPosition: Position =
          pattern!.positions[coupleNumber].position[dancerNumberInDanceCouple];

        const discreteNewX = clampToGridPosition(newX, -8, 8);
        const discreteNewY = clampToGridPosition(newY, -8, 8);
        if (!calledHeatmapUpdate) {
          updateDiscreteHeatmap(
            dancerPosition.x,
            dancerPosition.y,
            discreteNewX,
            discreteNewY
          );
        }

        calledHeatmapUpdate = true;

        dancerPosition.x = discreteNewX;
        dancerPosition.y = discreteNewY;
      });
    },
    [setChoreo]
  );

  const updateHeatmapAfterJoin = useCallback(
    (oldX: number, oldY: number) => {
      setDiscreteHeatmap((draft) => {
        const oldXIndex = oldX * 2 + 16;
        const oldYIndex = oldY * 2 + 16;

        draft!.values[oldXIndex][oldYIndex] -= 1;
      });
    },
    [setDiscreteHeatmap, setHighestFrequency]
  );

  useEffect(() => {
    if (discreteHeatmap) {
      setHighestFrequency(findMaxFrequencyInHeatmap(discreteHeatmap!));
    }
  }, [discreteHeatmap]);

  const updateHeatmapAfterSeparation = useCallback(
    (x: number, y: number) => {
      setDiscreteHeatmap((draft) => {
        const xIndex = x * 2 + 16;
        const yIndex = y * 2 + 16;

        draft!.values[xIndex][yIndex] += 1;
      });
    },
    [setDiscreteHeatmap]
  );

  const updateDiscreteHeatmap = useCallback(
    (oldX: number, oldY: number, newX: number, newY: number) => {
      setDiscreteHeatmap((draft) => {
        const oldXIndex = oldX * 2 + 16;
        const oldYIndex = oldY * 2 + 16;
        const newXIndex = newX * 2 + 16;
        const newYIndex = newY * 2 + 16;

        draft!.values[oldXIndex][oldYIndex] -= 1;
        draft!.values[newXIndex][newYIndex] += 1;
      });
    },
    [setDiscreteHeatmap]
  );

  const updateDiscreteHeatmapAfterPatternInsertion = useCallback(
    (newPattern: Pattern) => {
      setDiscreteHeatmap((draft) => {
        newPattern.positions.forEach((danceCouple) => {
          danceCouple.position.forEach((dancer) => {
            draft!.values[dancer.x * 2 + 16][dancer.y * 2 + 16] += 1;
          });
        });
      });
    },
    [setDiscreteHeatmap]
  );

  const rotateDancerBody = useCallback(
    (patternId: number, dancerId: number, newOrientation: number) => {
      setChoreo((draft) => {
        const pattern = draft?.patterns[patternId];
        const coupleNumber: number = Math.floor((dancerId - 1) / 2);
        const dancerNumberInDanceCouple: number = (dancerId - 1) % 2;
        pattern!.positions[coupleNumber].position[
          dancerNumberInDanceCouple
        ].bodyOrientation = newOrientation;
      });
    },
    [setChoreo]
  );

  const rotateDancerHead = useCallback(
    (patternId: number, dancerId: number, newOrientation: number) => {
      setChoreo((draft) => {
        const pattern = draft?.patterns[patternId];
        const coupleNumber: number = Math.floor((dancerId - 1) / 2);
        const dancerNumberInDanceCouple: number = (dancerId - 1) % 2;
        pattern!.positions[coupleNumber].position[
          dancerNumberInDanceCouple
        ].headOrientation = newOrientation;
      });
    },
    [setChoreo]
  );

  const addShape = useCallback(
    (patternId: number, newShape: ConvexHull) => {
      setChoreo((draft) => {
        draft!.patterns[patternId].shapes.push(newShape);
      });
    },
    [setChoreo]
  );

  const removeShape = useCallback(
    (patternId: number, shapeIdToRemove: number) => {
      setChoreo((draft) => {
        draft!.patterns[patternId].shapes.splice(shapeIdToRemove, 1);
        for (let i = 0; i < draft!.patterns[patternId].shapes.length; i++) {
          draft!.patterns[patternId].shapes[i].id = i;
        }
      });
    },
    [setChoreo]
  );

  const addStandardPose = useCallback(
    (newStandardPose: Pose) => {
      setChoreo((draft) => {
        let sameNameOccurences: number = 0;
        let distinctName: string = newStandardPose.name;
        let i = 1;
        do {
          sameNameOccurences = 0;
          draft!.savedPoses.forEach((pose) => {
            if (pose.name === distinctName) sameNameOccurences++;
          });
          if (sameNameOccurences > 0) {
            distinctName = newStandardPose.name + String(i);
            i++;
          }
        } while (sameNameOccurences > 0);

        draft!.savedPoses.push({
          name: distinctName,
          limbs: newStandardPose.limbs,
        });
      });
    },
    [setChoreo]
  );

  const changeDancerPose = useCallback(
    (patternId: number, dancerId: number, newPose: Pose) => {
      setChoreo((draft) => {
        draft!.patterns[patternId].positions[
          Math.floor((dancerId - 1) / 2)
        ].position[(dancerId - 1) % 2].pose = newPose;
      });
    },
    [setChoreo]
  );

  const [
    patternRotationBeforeHeatmapActivation,
    setPatternRotationBeforeHeatmapActivation,
  ] = useState(patternRotation);
  function activateHeatmap() {
    if (showTransitions) {
      setShowTransitions(false);
    }
    if (showOrientations) {
      setShowOrientations(false);
    }
    if (showShapes) {
      setShowShapes(false);
    }
    if (show3DView) {
      setShow3DView(false);
    }
    setPatternRotationBeforeHeatmapActivation(patternRotation);
    setPatternRotation("Front");
    setShowHeatmap(true);
  }

  function deactivateHeatmap() {
    setPatternRotation(patternRotationBeforeHeatmapActivation);
    setShowHeatmap(false);
  }

  function activateShapes() {
    if (showTransitions) {
      setShowTransitions(false);
    }
    if (showOrientations) {
      setShowOrientations(false);
    }
    if (showHeatmap) {
      setShowHeatmap(false);
    }
    if (show3DView) {
      setShow3DView(false);
    }
    setShowShapes(true);
  }

  function deactivateShapes() {
    setShowShapes(false);
  }

  function activate3DView() {
    if (showTransitions) {
      setShowTransitions(false);
    }
    if (showOrientations) {
      setShowOrientations(false);
    }
    if (showHeatmap) {
      setShowHeatmap(false);
    }
    if (showShapes) {
      setShowShapes(false);
    }
    setShow3DView(true);
  }

  function deactivate3DView() {
    setShow3DView(false);
  }

  function toggle3DView() {
    if (show3DView) {
      deactivate3DView();
    } else {
      activate3DView();
    }
  }

  function toggleTransitionDisplay() {
    if (showTransitions) {
      deactivateTransitionDisplay();
    } else {
      activateTransitionDisplay();
    }
  }

  function activateTransitionDisplay() {
    setShowHeatmap(false);
    setShow3DView(false);
    setShowShapes(false);
    setShowOrientations(false);
    setShowTransitions(true);
  }

  function deactivateTransitionDisplay() {
    setShowTransitions(false);
  }

  function toggleOrientationsDisplay() {
    if (showOrientations) {
      deactivateOrientationsDisplay();
    } else {
      activateOrientationsDisplay();
    }
  }

  function activateOrientationsDisplay() {
    setShowHeatmap(false);
    setShow3DView(false);
    setShowShapes(false);
    setShowTransitions(false);

    setShowOrientations(true);
  }

  function deactivateOrientationsDisplay() {
    setShowOrientations(false);
  }

  function loadChoreography(newChoreo: Choreography): void {
    setChoreo(newChoreo);
    initializeDiscreteHeatmap(newChoreo);
  }

  function createNewChoreography(
    newChoreoName: string,
    newChoreoDescription: string,
    newNumCouples: number,
    firstPattern: Pattern
  ) {
    setShowHeatmap(false);
    setShowShapes(false);
    setShowTransitions(false);
    setShowOrientations(false);

    setSelectedPattern(0);
    setEditingModeActive(true);
    setAnimationSpeed(1);

    setChoreoName(newChoreoName);
    setChoreoDescription(newChoreoDescription);

    setGentlemanColor("#0000ff");
    setLadyColor("#ff0000");
    setCoupleColor("#4b0082");

    const starterChoreo: Choreography = {
      id: 0,
      name: newChoreoName,
      description: newChoreoDescription,
      numCouples: newNumCouples,
      danceFloor: {
        width: 16,
        length: 16,
      },
      patterns: [],
      draft: [],
      savedPoses: [choreo!.savedPoses[0]],
    };

    starterChoreo.patterns.push(firstPattern);

    setChoreo(starterChoreo);
    initializeDiscreteHeatmap(starterChoreo);
  }

  useEffect(() => {
    // Load choreography
    async function fetchData() {
      const newChoreo = await fetchChoreography("./crazy_fire.json");

      newChoreo.patterns.forEach((pattern) => {
        pattern.intermediatePatterns = [];
      });

      initializeDiscreteHeatmap(newChoreo);
      setChoreo(newChoreo);
    }

    fetchData();
  }, []);

  function initializeDiscreteHeatmap(newChoreo: Choreography) {
    let newDiscreteHeatmap: DiscreteHeatmap = {
      values: new Array(newChoreo.danceFloor.length),
    };

    for (let i = 0; i < newChoreo.danceFloor.length * 2 + 1; i++) {
      const line = new Array(newChoreo.danceFloor.width);
      newDiscreteHeatmap.values[i] = line;
      for (let j = 0; j < newChoreo.danceFloor.width * 2 + 1; j++) {
        newDiscreteHeatmap.values[i][j] = 0;
      }
    }

    let newHighestFrequency = 0;

    newChoreo.patterns.forEach((pattern) => {
      pattern.positions.forEach((danceCouple) => {
        if (danceCouple.joint) {
          const xIndex =
            danceCouple.position[0].x * 2 + newChoreo.danceFloor.width;
          const yIndex =
            danceCouple.position[0].y * 2 + newChoreo.danceFloor.length;
          const newValue = newDiscreteHeatmap.values[xIndex][yIndex] + 1;
          newDiscreteHeatmap.values[xIndex][yIndex] = newValue;
        } else {
          danceCouple.position.forEach((position) => {
            const xIndex = position.x * 2 + newChoreo.danceFloor.width;
            const yIndex = position.y * 2 + newChoreo.danceFloor.length;
            const newValue = newDiscreteHeatmap.values[xIndex][yIndex] + 1;
            newDiscreteHeatmap.values[xIndex][yIndex] = newValue;
            if (newValue > newHighestFrequency) {
              newHighestFrequency = newValue;
            }
          });
        }
      });
    });

    setHighestFrequency(newHighestFrequency);

    setDiscreteHeatmap(newDiscreteHeatmap);
  }

  useEffect(() => {
    if (choreo) {
      const options = choreo.patterns.map(({ id, dance }: any, idx: any) => {
        return { value: idx, label: `${id} - ${dance}`, key: String(id) };
      });
      setSelectOptions(options);
      setChoreoName(choreo.name);
    }
  }, [choreo]);

  function previousPattern() {
    setSelectedPattern(selectedPattern - 1);
  }

  function nextPattern() {
    setSelectedPattern(selectedPattern + 1);
  }

  function onSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedPattern(+e.currentTarget.value);
  }

  if (!choreo) {
    return <p>Nothing to show here!</p>;
  }

  return (
    <>
      <div
        className="App"
        style={{
          minHeight: "80vh",
        }}
      >
        <NavbarComponent
          gentlemanColor={gentlemanColor}
          ladyColor={ladyColor}
          coupleColor={coupleColor}
          transitionColorScheme={transitionColorScheme}
          setGentlemanColor={setGentlemanColor}
          setLadyColor={setLadyColor}
          setCoupleColor={setCoupleColor}
          setTransitionColorScheme={setTransitionColorScheme}
          choreo={choreo}
          loadChoreo={loadChoreography}
          choreoName={choreo.name}
          choreoDescription={choreo.description}
          setChoreoName={setChoreoName}
          setChoreoDescription={setChoreoDescription}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          editingModeActive={editingModeActive}
          setEditingModeActive={setEditingModeActive}
          fineGridEnabled={fineGridEnabled}
          setFineGridEnabled={setFineGridEnabled}
          createNewChoreography={createNewChoreography}
          discreteHeatmapEnabled={discreteHeatmapEnabled}
          setDiscreteHeatmapEnabled={setDiscreteHeatmapEnabled}
          gridDragEnabled={gridDragEnabled}
          setGridDragEnabled={setGridDragEnabled}
          setPatternRotation={setPatternRotation}
          patternRotation={patternRotation}
          showHeatmap={showHeatmap}
        />
        <Container fluid>
          <Row className="mb-5">
            <VerticalToolbar
              selectValue={selectedPattern}
              onSelectChange={onSelectChange}
              selectOptions={selectOptions}
              prevDisabled={selectedPattern === 0 ? true : false}
              nextDisabled={
                selectedPattern < choreo.patterns.length - 1 ? false : true
              }
              prevClick={previousPattern}
              nextClick={nextPattern}
              selectedPattern={selectedPattern}
              setSelectedPattern={setSelectedPattern}
              toggleTransitionDisplay={toggleTransitionDisplay}
              showTransitions={showTransitions}
              choreo={choreo}
              showHeatmap={showHeatmap}
              showOrientations={showOrientations}
              toggleOrientationsDisplay={toggleOrientationsDisplay}
              showShapes={showShapes}
              activateShapes={activateShapes}
              deactivateShapes={deactivateShapes}
              activateHeatmap={activateHeatmap}
              deactivateHeatmap={deactivateHeatmap}
              editingModeActive={editingModeActive}
              addPattern={addPattern}
              setShowSliderForAnimatedChoreo={setShowSliderForAnimatedChoreo}
              speedForAnimatedChoreo={speedForAnimatedChoreo}
              setSpeedForAnimatedChoreo={setSpeedForAnimatedChoreo}
              show3DView={show3DView}
              toggle3DView={toggle3DView}
              setCurrentlyInAnimation={setCurrentlyInAnimation}
              animationSpeed={animationSpeed}
            />
            <Col xxl={5} xl={6} lg={7} className="mt-3">
              {!show3DView && (
                <DanceFloorVisualization
                  choreo={choreo}
                  selectedPattern={selectedPattern}
                  gentlemanColor={gentlemanColor}
                  ladyColor={ladyColor}
                  coupleColor={coupleColor}
                  transitionColorScheme={transitionColorScheme}
                  showHeatmap={showHeatmap}
                  discreteHeatmapEnabled={discreteHeatmapEnabled}
                  discreteHeatmap={discreteHeatmap!}
                  highestFrequency={highestFrequency}
                  showTransitions={showTransitions}
                  showOrientations={showOrientations}
                  moveDancer={moveDancer}
                  rotateDancerBody={rotateDancerBody}
                  rotateDancerHead={rotateDancerHead}
                  fineGridEnabled={fineGridEnabled}
                  gridDragEnabled={gridDragEnabled}
                  editingModeActive={editingModeActive}
                  hoveredDancer={hoveredDancer}
                  setHoveredDancer={setHoveredDancer}
                  animationSpeed={animationSpeed}
                  showShapes={showShapes}
                  addShape={addShape}
                  removeShape={removeShape}
                  separateDanceCouple={separateDanceCouple}
                  joinDanceCouple={joinDanceCouple}
                  patternRotation={patternRotation}
                  currentlyInAnimation={currentlyInAnimation}
                  moveDancerInIntermediatePattern={
                    moveDancerInIntermediatePattern
                  }
                  setSelectedHeatmapTile={setSelectedHeatmapTile}
                  selectedHeatmapTile={selectedHeatmapTile}
                  addPatternToDraft={addPatternToDraft}
                  setBrushCopy={setBrushCopy}
                  setCopyOfFirstDancer={setCopyOfFirstDancer}
                />
              )}
              {show3DView && (
                <View3D
                  choreo={choreo}
                  selectedPattern={selectedPattern}
                  selectedDancerOption={selectedDancerFor3D}
                  setSelectedDancerOption={setSelectedDancerFor3D}
                  patternRotation={patternRotation}
                  show3DView={show3DView}
                />
              )}
            </Col>
            <Col xxl={6} xl={5} lg={4} className="mt-3">
              <p className="only-for-mobile">{`Bar: ${choreo.patterns[selectedPattern].bar}, Beat: ${choreo.patterns[selectedPattern].beat}`}</p>

              {showAlert && !show3DView && (
                <DismissibleAlert
                  show={showAlert}
                  setShow={setShowAlert}
                  content={"This action is not allowed"}
                />
              )}

              {showRotationAlert && !show3DView && (
                <DismissibleAlert
                  show={showRotationAlert}
                  setShow={setShowRotationAlert}
                  content={
                    "Please select a single line of dancers, where the leftmost dancer is the rotation center."
                  }
                />
              )}

              {brushCopy.length > 0 && editingModeActive && (
                <Form.Group className="mb-3" as={Row}>
                  <Form.Label>Rotate diagonal</Form.Label>
                  <Col xs="9">
                    <Form.Range
                      value={brushRotationAngle}
                      onChange={(e) => {
                        setBrushRotationAngle(+e.target.value);
                      }}
                      min={-90}
                      max={90}
                      step={5}
                    />
                  </Col>
                  <Col xs="1">
                    <Form.Label>{brushRotationAngle + "°"}</Form.Label>
                  </Col>
                  <Col xs="2">
                    <Button
                      variant="primary"
                      onClick={(e) =>
                        rotateBrush(
                          selectedPattern,
                          brushCopy,
                          copyOfFirstDancer,
                          brushRotationAngle
                        )
                      }
                    >
                      Rotate
                    </Button>
                  </Col>
                </Form.Group>
              )}

              {showSliderForAnimatedChoreo &&
                !(show3DView && editingModeActive) && (
                  <Form.Group className="mb-3" as={Row}>
                    <Form.Label>Time between animations in seconds</Form.Label>
                    <Col xs="11">
                      <Form.Range
                        value={speedForAnimatedChoreo}
                        onChange={(e) => {
                          setSpeedForAnimatedChoreo(+e.target.value);
                        }}
                        min={0.5}
                        max={2}
                        step={0.1}
                      />
                    </Col>
                    <Col xs="1">
                      <Form.Label>{speedForAnimatedChoreo}</Form.Label>
                    </Col>
                  </Form.Group>
                )}

              {showHeatmap && discreteHeatmapEnabled && !show3DView && (
                <Form.Group className="mb-3" as={Row}>
                  <Form.Label>Highest frequency</Form.Label>
                  <Col xs="11">
                    <Form.Range
                      value={highestFrequency}
                      onChange={(e) => setHighestFrequency(+e.target.value)}
                      min={5}
                      max={40}
                      step={1}
                    />
                  </Col>
                  <Col xs="1">
                    <Form.Label>{highestFrequency}</Form.Label>
                  </Col>
                </Form.Group>
              )}

              {!showHeatmap && !(show3DView && editingModeActive) && (
                <RemarksAccordionComponent
                  pattern={choreo.patterns[selectedPattern]}
                  remarks={choreo.patterns[selectedPattern].remarks}
                  selectedPattern={selectedPattern}
                  defaultKey="1"
                  setRemarks={setRemarks}
                  editingModeActive={editingModeActive}
                />
              )}

              {!(show3DView && editingModeActive) && (
                <AccordionComponent
                  title="Analysis"
                  child={
                    <DistancesBarChart
                      numCouples={choreo.numCouples}
                      pattern={choreo.patterns[selectedPattern]}
                      previousPattern={choreo.patterns[selectedPattern - 1]}
                      hasPreviousPattern={selectedPattern === 0 ? false : true}
                      gentlemanColor={gentlemanColor}
                      ladyColor={ladyColor}
                      hoveredDancer={hoveredDancer}
                      choreo={choreo}
                      showHeatmap={showHeatmap}
                    />
                  }
                  defaultKey="1"
                />
              )}

              {!showHeatmap && !(show3DView && editingModeActive) && (
                <AccordionComponent
                  title="Positions"
                  defaultKey="1"
                  child={
                    <TableView pattern={choreo.patterns[selectedPattern]} />
                  }
                />
              )}

              {show3DView && editingModeActive && (
                <PoseView
                  savedPoses={choreo.savedPoses}
                  selectedPattern={selectedPattern}
                  addStandardPose={addStandardPose}
                  changeDancerPose={changeDancerPose}
                  selectedDancerOption={selectedDancerFor3D}
                  choreo={choreo}
                  show3DView={show3DView}
                />
              )}
            </Col>
          </Row>

          <Row className="mt-5">
            <Timeline
              choreo={choreo}
              selectedPattern={selectedPattern}
              setSelectedPattern={setSelectedPattern}
              setBarAndBeat={setBarAndBeat}
              gentlemanColor={gentlemanColor}
              ladyColor={ladyColor}
              coupleColor={coupleColor}
              removePattern={removePattern}
              addIntermediatePattern={addIntermediatePattern}
              editingModeActive={editingModeActive}
              timelineMapValues={timelineMapValues}
              setTimelineMapValues={setTimelineMapValues}
              highestBarNumber={highestBarNumber}
              setHighestBarNumber={setHighestBarNumber}
              addNewBar={addNewBar}
            />
          </Row>

          <Row>
            <BottomNavbar
              selectValue={selectedPattern}
              onSelectChange={onSelectChange}
              selectOptions={selectOptions}
              prevDisabled={selectedPattern === 0 ? true : false}
              nextDisabled={
                selectedPattern < choreo.patterns.length - 1 ? false : true
              }
              prevClick={previousPattern}
              nextClick={nextPattern}
              selectedPattern={selectedPattern}
              setSelectedPattern={setSelectedPattern}
              toggleTransitionDisplay={toggleTransitionDisplay}
              showTransitions={showTransitions}
              choreo={choreo}
              showHeatmap={showHeatmap}
              showOrientations={showOrientations}
              toggleOrientationsDisplay={toggleOrientationsDisplay}
              showShapes={showShapes}
              activateShapes={activateShapes}
              deactivateShapes={deactivateShapes}
              activateHeatmap={activateHeatmap}
              deactivateHeatmap={deactivateHeatmap}
              editingModeActive={editingModeActive}
              addPattern={addPattern}
              setShowSliderForAnimatedChoreo={setShowSliderForAnimatedChoreo}
              speedForAnimatedChoreo={speedForAnimatedChoreo}
              setSpeedForAnimatedChoreo={setSpeedForAnimatedChoreo}
              show3DView={show3DView}
              toggle3DView={toggle3DView}
              setCurrentlyInAnimation={setCurrentlyInAnimation}
              animationSpeed={animationSpeed}
            />
          </Row>
        </Container>

        <Modal
          show={show}
          onHide={() => setShow(false)}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Mode change</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="center-me">
              <p>
                {`You are now entering ${
                  editingModeActive ? "editing" : "view"
                } mode`}
              </p>
              {editingModeActive && <Pencil fontSize="40" className="mb-2" />}
              {!editingModeActive && <Eye fontSize="40" className="mb-2" />}
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}

export default App;
