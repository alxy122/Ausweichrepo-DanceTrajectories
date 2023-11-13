import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { AnimateChoreoButtonProps } from "../interfaces/Toolbar";
import { Calendar2Range } from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import DismissibleAlert from "./DismissibleAlert";
import { Pattern } from "../interfaces/Choreography";
import { getBeatDistance } from "../services/VisServices";

function AnimateChoreoButton(props: AnimateChoreoButtonProps) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [showReset, setShowReset] = useState(false);
  const handleResetClose = () => {
    props.setShowSliderForAnimatedChoreo(false);
    setShowReset(false);
  };
  const handleResetShow = () => setShowReset(true);

  const [showAlert, setShowAlert] = useState(false);

  const [originalPattern, setOriginalPattern] = useState(0);
  const [patternNumberToPlay, setPatternNumberToPlay] = useState(1);

  const [ticking, setTicking] = useState(false);
  const [count, setCount] = useState(-2);

  function playAnimation(e: any) {
    if (props.selectedPattern + patternNumberToPlay >= props.choreoLength) {
      setShowAlert(true);
      return;
    }
    props.setShowSliderForAnimatedChoreo(true);
    setOriginalPattern(props.selectedPattern);
    setCount(patternNumberToPlay - 1);
    handleClose();
    setTicking(true);
    props.setCurrentlyInAnimation(true);
  }

  function replayAnimation(e: any) {
    setShowReset(false);
    props.setSelectedPattern(originalPattern);
    setCount(patternNumberToPlay - 1);
    setTicking(true);
  }

  function getAnimationDuration() {
    let duration = 1000 * props.speedForAnimatedChoreo;
    const currentPattern: Pattern =
      props.choreo.patterns[props.selectedPattern];
    if (currentPattern.id === 0) {
      duration += 1000;
    } else {
      const previousPattern: Pattern =
        props.choreo.patterns[props.selectedPattern - 1];
      const beatDistance = getBeatDistance(previousPattern, currentPattern);
      duration += beatDistance * 125 * (1 / props.animationSpeed);
    }
    return duration;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ticking) {
        if (count >= 0) {
          props.nextClick();
        }

        setCount(count - 1);
        if (count === 0) {
          setTicking(false);
        }
      }
      if (count === -1) {
        handleResetShow();
      }
    }, getAnimationDuration());
    return () => clearTimeout(timer);
  }, [count, ticking]);
  return (
    <>
      <Button
        className={
          !props.forBottomToolbar
            ? "mb-3 btn-light ms-3 me-3"
            : "ms-1 me-1 btn-light"
        }
        onClick={handleShow}
        title="Animate choreo"
      >
        <Calendar2Range />
        {!props.forBottomToolbar && <br />}
        {!props.forBottomToolbar && (
          <p className="not-for-smaller-desktop no-margin-bottom">Animate</p>
        )}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New Animation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={playAnimation}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>{`Amount of next patterns to play (currently ${patternNumberToPlay})`}</Form.Label>
              <Form.Control
                type="number"
                onChange={(e) => {
                  if (+e.target.value > 0) {
                    setPatternNumberToPlay(+e.target.value);
                  }
                }}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3" as={Row}>
              <Form.Label>Time between animations in seconds</Form.Label>
              <Col xs="11">
                <Form.Range
                  value={props.speedForAnimatedChoreo}
                  onChange={(e) =>
                    props.setSpeedForAnimatedChoreo(+e.target.value)
                  }
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </Col>
              <Col xs="1">
                <Form.Label>{props.speedForAnimatedChoreo}</Form.Label>
              </Col>
            </Form.Group>
            {showAlert && (
              <DismissibleAlert
                show={showAlert}
                setShow={setShowAlert}
                content={
                  "The amount of patterns you want to animate is not in contained in your choreo."
                }
              />
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={playAnimation}>
            Play
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showReset}
        onHide={() => {
          handleResetClose();
          props.setCurrentlyInAnimation(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Replay animation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p> Do you want to play this animation again?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              handleResetClose();
              props.setCurrentlyInAnimation(false);
            }}
          >
            No
          </Button>
          <Button variant="secondary" onClick={replayAnimation}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AnimateChoreoButton;
