import {
  Navbar,
  Nav,
  ButtonGroup,
  Button,
  ToggleButton,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  ArrowsAngleExpand,
  Badge3d,
  Bezier2,
  BoundingBoxCircles,
  Calendar3,
} from "react-bootstrap-icons";
import { ToolbarProps } from "../interfaces/Toolbar";
import AnimateChoreoButton from "./AnimateChoreoButton";

function BottomNavbar(props: ToolbarProps) {
  function changeHeatmapActivation() {
    props.showHeatmap ? props.deactivateHeatmap() : props.activateHeatmap();
  }

  return (
    <Navbar fixed="bottom" bg="dark" variant="dark" className="only-for-mobile">
      <ToggleButton
        type="checkbox"
        id="toggleCheckHeatmap"
        variant="outline-light"
        className="ms-1"
        checked={!props.showHeatmap}
        value="1"
        onChange={changeHeatmapActivation}
        title={
          props.showHeatmap ? "Leave analysis mode" : "Enter analysis mode"
        }
      >
        <Calendar3 fontSize={14} />
      </ToggleButton>

      <ToggleButton
        type="checkbox"
        id="toggleCheckShapes"
        variant="outline-light"
        className="ms-1"
        checked={!props.showShapes}
        value="1"
        onChange={
          props.showShapes ? props.deactivateShapes : props.activateShapes
        }
        title={props.showShapes ? "Leave shape mode" : "Enter shape mode"}
      >
        <BoundingBoxCircles fontSize={14} />
      </ToggleButton>

      <ToggleButton
        type="checkbox"
        id="toggleCheckTransitions"
        variant="outline-light"
        checked={!props.showTransitions}
        value="1"
        className="ms-1"
        onChange={props.toggleTransitionDisplay}
        title={
          props.showTransitions
            ? "Leave transition mode"
            : "Enter transition mode"
        }
      >
        <Bezier2 fontSize={14} />
      </ToggleButton>

      <ToggleButton
        type="checkbox"
        id="toggleCheckOrientations"
        variant="outline-light"
        checked={!props.showOrientations}
        value="1"
        className="ms-1"
        onChange={props.toggleOrientationsDisplay}
        title={
          props.showTransitions
            ? "Leave orientation mode"
            : "Enter orientation mode"
        }
      >
        <ArrowsAngleExpand fontSize={14} />
      </ToggleButton>

      <ToggleButton
        type="checkbox"
        id="toggleCheck3DView"
        variant="outline-light"
        checked={!props.show3DView}
        value="1"
        className="ms-1"
        onChange={props.toggle3DView}
        title={props.show3DView ? "Leave 3D mode" : "Enter 3D mode"}
      >
        <Badge3d fontSize={14} />
      </ToggleButton>

      <AnimateChoreoButton
        nextClick={props.nextClick}
        setSelectedPattern={props.setSelectedPattern}
        selectedPattern={props.selectedPattern}
        choreoLength={props.choreo.patterns.length}
        setShowSliderForAnimatedChoreo={props.setShowSliderForAnimatedChoreo}
        speedForAnimatedChoreo={props.speedForAnimatedChoreo}
        setSpeedForAnimatedChoreo={props.setSpeedForAnimatedChoreo}
        forBottomToolbar={true}
        setCurrentlyInAnimation={props.setCurrentlyInAnimation}
        choreo={props.choreo}
        animationSpeed={props.animationSpeed}
      />

      <Nav className="justify-content-end" style={{ width: "100%" }}>
        <ButtonGroup className=" me-1">
          <Button
            variant="light"
            onClick={props.prevClick}
            disabled={props.prevDisabled}
            title="Previous pattern"
          >
            <ArrowLeftCircle fontSize={14} />
          </Button>
          <Button
            variant="light"
            onClick={props.nextClick}
            disabled={props.nextDisabled}
            title="Next pattern"
          >
            <ArrowRightCircle fontSize={14} />
          </Button>
        </ButtonGroup>
      </Nav>
    </Navbar>
  );
}

export default BottomNavbar;
