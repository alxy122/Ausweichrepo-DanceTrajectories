import { Navbar, Nav, Form, Badge, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import LoadChoreoButton from "./LoadChoreoButton";
import NewChoreoButton from "./NewChoreoButton";
import SaveChoreoButton from "./SaveChoreoButton";
import SettingsButton from "./SettingsButton";
import { TopNavbarProps } from "../interfaces/Navbar";
import { Arrow90degUp, Pencil } from "react-bootstrap-icons";

function TopNavbar(props: TopNavbarProps) {
  function switchEditingMode(e: any) {
    if (props.editingModeActive) {
      props.setEditingModeActive(false);
    } else {
      props.setEditingModeActive(true);
    }
  }

  function rotate() {
    switch (props.patternRotation) {
      case "Front":
        props.setPatternRotation("Left");
        break;
      case "Left":
        props.setPatternRotation("Back");
        break;
      case "Back":
        props.setPatternRotation("Right");
        break;
      case "Right":
        props.setPatternRotation("Front");
        break;
    }
  }

  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand className="not-for-mobile ms-3 me-3">
        {props.choreoName}
      </Navbar.Brand>
      <div className="not-for-mobile vr ms-1 bg-light"></div>
      <NewChoreoButton createNewChoreography={props.createNewChoreography} />
      <LoadChoreoButton loadChoreo={props.loadChoreo} />
      {props.editingModeActive && <SaveChoreoButton choreo={props.choreo} />}
      <Nav className="justify-content-end" style={{ width: "100%" }}>
        {!props.editingModeActive && (
          <Button
            disabled={props.showHeatmap}
            onClick={() => rotate()}
            variant="light"
            className="me-2"
            title="Rotate"
          >
            <Arrow90degUp />{" "}
            <p className="not-for-mobile no-margin-bottom">Rotate</p>
          </Button>
        )}

        <Button
          onClick={switchEditingMode}
          variant="light"
          className="me-2 not-for-mobile"
          title={
            props.editingModeActive
              ? "Switch to view mode"
              : "Switch to editing mode"
          }
        >
          <Pencil />
          <Form>
            <Form.Group className="">
              <Form.Check
                type="switch"
                id="editingModeSwitch"
                checked={props.editingModeActive}
                onChange={switchEditingMode}
              />
            </Form.Group>
          </Form>
        </Button>
        <SettingsButton
          gentlemanColor={props.gentlemanColor}
          ladyColor={props.ladyColor}
          coupleColor={props.coupleColor}
          setGentlemanColor={props.setGentlemanColor}
          setLadyColor={props.setLadyColor}
          setCoupleColor={props.setCoupleColor}
          transitionColorScheme={props.transitionColorScheme}
          setTransitionColorScheme={props.setTransitionColorScheme}
          choreoName={props.choreoName}
          choreoDescription={props.choreoDescription}
          setChoreoName={props.setChoreoName}
          setChoreoDescription={props.setChoreoDescription}
          animationSpeed={props.animationSpeed}
          setAnimationSpeed={props.setAnimationSpeed}
          fineGridEnabled={props.fineGridEnabled}
          setFineGridEnabled={props.setFineGridEnabled}
          discreteHeatmapEnabled={props.discreteHeatmapEnabled}
          setDiscreteHeatmapEnabled={props.setDiscreteHeatmapEnabled}
          gridDragEnabled={props.gridDragEnabled}
          setGridDragEnabled={props.setGridDragEnabled}
        />
      </Nav>
    </Navbar>
  );
}

export default TopNavbar;
