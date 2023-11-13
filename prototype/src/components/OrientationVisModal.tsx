import { useEffect, useState } from "react";
import { Button, Modal, Form, Col, Row } from "react-bootstrap";
import { OrientationVisModalProps } from "../interfaces/PatternView";

function OrientationVisModal(props: OrientationVisModalProps) {
  const [newBodyOrientation, setNewBodyOrientation] = useState<number>(0);
  const [newHeadOrientation, setNewHeadOrientation] = useState<number>(0);

  const [width, setWidth] = useState<number>(500);
  const [height, setHeight] = useState<number>(500);

  const dancerScalingFactor = 0.2;
  function getOrientationVisCircleRadius() {
    const smallerDimension = Math.min(width, height);
    //console.log(smallerDimension);
    return dancerScalingFactor * smallerDimension;
  }

  const fieldOfView = 180;
  function clampHeadOrientation(currentBodyOrientation: number): number[] {
    const maxLeftHeadOrientation =
      (currentBodyOrientation - fieldOfView / 2) % 360;
    const maxRightHeadOrientation =
      (currentBodyOrientation + fieldOfView / 2) % 360;

    if (maxLeftHeadOrientation > maxRightHeadOrientation) {
      if (currentBodyOrientation === 315) {
        return [-maxLeftHeadOrientation + 90, maxRightHeadOrientation];
      } else {
        return [-maxLeftHeadOrientation, maxRightHeadOrientation];
      }
    }

    return [maxLeftHeadOrientation, maxRightHeadOrientation];
  }

  useEffect(() => {
    const minOrientation = clampHeadOrientation(newBodyOrientation)[0];
    const maxOrientation = clampHeadOrientation(newBodyOrientation)[1];

    if (newHeadOrientation < minOrientation) {
      setNewHeadOrientation(minOrientation);
    }
    if (newHeadOrientation > maxOrientation) {
      setNewHeadOrientation(maxOrientation);
    }
  }, [newBodyOrientation]);

  function applyOrientations(e: any, id: number) {
    props.rotateDancerBody(props.selectedPattern, id, newBodyOrientation);
    props.rotateDancerHead(props.selectedPattern, id, newHeadOrientation);
    props.setShowModal(false);
    props.setShowModalForPatternView(false);
  }

  function applyOrientationsForAllDancers(e: any) {
    if (props.brushSelectedDancers.length === 0) {
      for (let i = 1; i <= 2 * props.numCouples; i++) {
        applyOrientations(e, i);
      }
    } else {
      props.brushSelectedDancers.forEach((dancerId) => {
        applyOrientations(e, dancerId);
      });
    }
  }

  function applyOrientationsForAllGentlemen(e: any) {
    if (props.brushSelectedDancers.length === 0) {
      for (let i = 1; i <= props.numCouples; i++) {
        applyOrientations(e, 2 * i - 1);
      }
    } else {
      props.brushSelectedDancers.forEach((dancerId) => {
        if (dancerId % 2 === 1) {
          applyOrientations(e, dancerId);
        }
      });
    }
  }

  function applyOrientationsForAllLadies(e: any) {
    if (props.brushSelectedDancers.length === 0) {
      for (let i = 1; i <= props.numCouples; i++) {
        applyOrientations(e, 2 * i);
      }
    } else {
      props.brushSelectedDancers.forEach((dancerId) => {
        if (dancerId % 2 === 0) {
          applyOrientations(e, dancerId);
        }
      });
    }
  }

  function getAllRotationCandidateAmount() {
    if (props.brushSelectedDancers.length === 0) {
      return 2 * props.numCouples;
    } else {
      return props.brushSelectedDancers.length;
    }
  }

  function getGentlemenRotationCandidateAmount() {
    if (props.brushSelectedDancers.length === 0) {
      return props.numCouples;
    } else {
      let candidates = 0;
      props.brushSelectedDancers.forEach((candidate) => {
        if (candidate % 2 === 1) {
          candidates++;
        }
      });
      return candidates;
    }
  }

  function getLadiesRotationCandidateAmount() {
    if (props.brushSelectedDancers.length === 0) {
      return props.numCouples;
    } else {
      let candidates = 0;
      props.brushSelectedDancers.forEach((candidate) => {
        if (candidate % 2 === 0) {
          candidates++;
        }
      });
      return candidates;
    }
  }

  useEffect(() => {
    if (props.showModal) {
      setNewBodyOrientation(props.pos.bodyOrientation);
      setNewHeadOrientation(props.pos.headOrientation);
    }
  }, [props.showModal]);

  return (
    <Modal
      show={props.showModal}
      onHide={() => {
        props.setShowModal(false);
        props.setShowModalForPatternView(false);
      }}
      onClick={(e: any) => {
        e.stopPropagation();
      }}
      onMouseDown={(e: any) => {
        e.stopPropagation();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Set Dancer orientation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          id="modal-wrapper"
          style={{ width: width + "px", height: height + "px" }}
        >
          <svg id="orientation-vis" width="100%" height="100%">
            <g transform={`translate(${width / 2}, ${height / 2})`}>
              <line
                x1={0}
                y1={0}
                x2={
                  1.5 *
                  getOrientationVisCircleRadius() *
                  Math.sin(newHeadOrientation * (Math.PI / 180))
                }
                y2={
                  -1.5 *
                  getOrientationVisCircleRadius() *
                  Math.cos(newHeadOrientation * (Math.PI / 180))
                }
                stroke={"gray"}
                strokeWidth={5}
              />

              <path
                fill={props.frontsideColor}
                d={
                  "M " +
                  -getOrientationVisCircleRadius() +
                  " 0 A " +
                  getOrientationVisCircleRadius() +
                  " " +
                  getOrientationVisCircleRadius() +
                  " 0 0 1 " +
                  getOrientationVisCircleRadius() +
                  " 0"
                }
                transform={`rotate(${newBodyOrientation})`}
              />
              <path
                fill={props.backsideColor}
                d={
                  "M " +
                  -getOrientationVisCircleRadius() +
                  " 0 A " +
                  getOrientationVisCircleRadius() +
                  " " +
                  getOrientationVisCircleRadius() +
                  " 0 0 0 " +
                  getOrientationVisCircleRadius() +
                  " 0"
                }
                transform={`rotate(${newBodyOrientation})`}
              />

              <text fill="white" fontSize={"5em"} x={"-0.32em"} y={"0.3em"}>
                {Math.ceil(props.dancerId / 2)}
              </text>
            </g>
          </svg>
        </div>
        <Form>
          {props.editingModeActive && (
            <Form.Group
              className="mb-3"
              as={Row}
              //controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Body orientation</Form.Label>
              <Col xs="10">
                <Form.Range
                  value={newBodyOrientation}
                  onChange={(e) => setNewBodyOrientation(+e.target.value)}
                  min={0}
                  max={315}
                  step={45}
                />
              </Col>
              <Col xs="2">
                <Form.Label>{newBodyOrientation + "°"}</Form.Label>
              </Col>
            </Form.Group>
          )}

          {props.editingModeActive && (
            <Form.Group
              className="mb-3"
              as={Row}
              //controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Head orientation</Form.Label>
              <Col xs="10">
                <Form.Range
                  value={newHeadOrientation}
                  onChange={(e) => setNewHeadOrientation(+e.target.value)}
                  min={clampHeadOrientation(newBodyOrientation)[0]}
                  max={clampHeadOrientation(newBodyOrientation)[1]}
                  step={45}
                />
              </Col>
              <Col xs="2">
                <Form.Label>{newHeadOrientation + "°"}</Form.Label>
              </Col>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {props.editingModeActive &&
          props.dancerId % 2 === 1 &&
          !props.joint && (
            <Button
              variant="secondary"
              onClick={applyOrientationsForAllGentlemen}
            >
              {`Apply for men (${getGentlemenRotationCandidateAmount()})`}
            </Button>
          )}
        {props.editingModeActive &&
          props.dancerId % 2 === 0 &&
          !props.joint && (
            <Button variant="secondary" onClick={applyOrientationsForAllLadies}>
              {`Apply for ladies (${getLadiesRotationCandidateAmount()})`}
            </Button>
          )}
        {props.editingModeActive && (
          <Button variant="secondary" onClick={applyOrientationsForAllDancers}>
            {`Apply for all (${getAllRotationCandidateAmount()})`}
          </Button>
        )}
        {props.editingModeActive && (
          <Button
            variant="primary"
            onClick={(e) => applyOrientations(e, props.dancerId)}
          >
            Apply
          </Button>
        )}

        {!props.editingModeActive && (
          <Button
            variant="secondary"
            onClick={() => {
              props.setShowModal(false);
              props.setShowModalForPatternView(false);
            }}
          >
            Close
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default OrientationVisModal;
