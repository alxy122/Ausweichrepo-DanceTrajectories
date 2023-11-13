import { ChangeEvent, useEffect, useState } from "react";
import { Button, Modal, Form, Col, Row } from "react-bootstrap";
import { Gear } from "react-bootstrap-icons";
import { SettingsButtonProps } from "../interfaces/Navbar";
import { SelectOption } from "../interfaces/Toolbar";
import Select from "./Select";

function SettingsButton(props: SettingsButtonProps) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [newChoreoName, setNewChoreoName] = useState<string>("");
  const [newChoreoDescription, setNewChoreoDescription] = useState<string>("");
  const [newFineGridEnabled, setNewFineGridEnabled] = useState<boolean>(true);
  const [newGridDragEnabled, setNewGridDragEnabled] = useState<boolean>(true);
  const [newDiscreteHeatmapEnabled, setNewDiscreteHeatmapEnabled] =
    useState<boolean>(true);
  const [newGentlemanColor, setNewGentlemanColor] = useState<
    string | number | readonly string[] | undefined
  >("#0000ff");
  const [newLadyColor, setNewLadyColor] = useState<
    string | number | readonly string[] | undefined
  >("#ff0000");
  const [newCoupleColor, setNewCoupleColor] = useState<
    string | number | readonly string[] | undefined
  >("#4b0082");
  const [newAnimationSpeed, setNewAnimationSpeed] = useState<number>(1);

  function switchFineGridEnabled(e: any) {
    if (newFineGridEnabled) {
      setNewFineGridEnabled(false);
    } else {
      setNewFineGridEnabled(true);
    }
  }

  function switchDiscreteHeatmapEnabled(e: any) {
    if (newDiscreteHeatmapEnabled) {
      setNewDiscreteHeatmapEnabled(false);
    } else {
      setNewDiscreteHeatmapEnabled(true);
    }
  }

  function switchGridDragEnabled(e: any) {
    if (newGridDragEnabled) {
      setNewGridDragEnabled(false);
    } else {
      setNewGridDragEnabled(true);
    }
  }

  function openModalWithNewValues() {
    setNewChoreoName(props.choreoName);
    setNewChoreoDescription(props.choreoDescription);
    setNewDiscreteHeatmapEnabled(props.discreteHeatmapEnabled);
    setNewGridDragEnabled(props.gridDragEnabled);
    setNewFineGridEnabled(props.fineGridEnabled);
    setNewGentlemanColor(props.gentlemanColor);
    setNewLadyColor(props.ladyColor);
    setNewCoupleColor(props.coupleColor);
    setNewAnimationSpeed(props.animationSpeed);
    handleShow();
  }

  function handleCloseWithChange(e: any) {
    if (newChoreoName !== "") {
      props.setChoreoName(newChoreoName);
    }
    if (newChoreoDescription) {
      props.setChoreoDescription(newChoreoDescription);
    }
    props.setGridDragEnabled(newGridDragEnabled);
    props.setFineGridEnabled(newFineGridEnabled);
    props.setDiscreteHeatmapEnabled(newDiscreteHeatmapEnabled);
    props.setGentlemanColor(newGentlemanColor);
    props.setLadyColor(newLadyColor);
    props.setCoupleColor(newCoupleColor);
    props.setAnimationSpeed(newAnimationSpeed);
    props.setTransitionColorScheme(colorSchemes[selectedOption].label);
    handleClose();
  }

  function changeTransitionColorScheme(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedOption(+e.currentTarget.value);
  }
  const [selectedOption, setSelectedOption] = useState(0);

  const colorSchemes: { value: number; label: string; key: string }[] = [
    { value: 0, label: "RdYlBu", key: "0" },
    { value: 1, label: "RdYlGn", key: "1" },
  ];

  return (
    <>
      <Button
        variant="light"
        className="me-2"
        onClick={openModalWithNewValues}
        title="Settings"
      >
        <Gear /> <br />{" "}
        <p className="not-for-mobile no-margin-bottom">Settings</p>
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={newChoreoName}
                onChange={(e) => setNewChoreoName(e.target.value)}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                value={newChoreoDescription}
                onChange={(e) => setNewChoreoDescription(e.target.value)}
                as="textarea"
                rows={3}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="fineGridSwitch"
                label="Show fine grid"
                checked={newFineGridEnabled}
                onChange={switchFineGridEnabled}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="gridDragSwitch"
                label="Enable drag and drop on grid"
                checked={newGridDragEnabled}
                onChange={switchGridDragEnabled}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="heatmapSwitch"
                label={
                  props.discreteHeatmapEnabled
                    ? "Discrete Heatmap"
                    : "Continuous Heatmap"
                }
                checked={newDiscreteHeatmapEnabled}
                onChange={switchDiscreteHeatmapEnabled}
              />
            </Form.Group>

            <Form.Label>Color scheme for transitions:</Form.Label>
            <Select
              value={selectedOption}
              onChange={changeTransitionColorScheme}
              options={colorSchemes}
              renderOnAllDevices={true}
            />

            <Form.Group className="mb-3">
              <Form.Label>Color Gentleman</Form.Label>
              <Form.Control
                type="color"
                id="exampleColorInput"
                defaultValue={newGentlemanColor}
                onChange={(e) => setNewGentlemanColor(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color Lady</Form.Label>
              <Form.Control
                type="color"
                id="exampleColorInput"
                defaultValue={newLadyColor}
                onChange={(e) => setNewLadyColor(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color Couple</Form.Label>
              <Form.Control
                type="color"
                id="exampleColorInput"
                defaultValue={newCoupleColor}
                onChange={(e) => setNewCoupleColor(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" as={Row}>
              <Form.Label>Animation Speed</Form.Label>
              <Col xs="11">
                <Form.Range
                  value={newAnimationSpeed}
                  onChange={(e) => setNewAnimationSpeed(+e.target.value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </Col>
              <Col xs="1">
                <Form.Label>{newAnimationSpeed}</Form.Label>
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseWithChange}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SettingsButton;
