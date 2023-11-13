import { Button, ButtonGroup, Col, Stack, ToggleButton } from "react-bootstrap";
import {
  ArrowLeftCircle,
  Bezier2,
  BoundingBoxCircles,
  ArrowRightCircle,
  Calendar3,
  ArrowsAngleExpand,
  Badge3d,
  Pencil,
  Eye,
} from "react-bootstrap-icons";
import { ToolbarProps } from "../interfaces/Toolbar";
import NewPatternButton from "./NewPatternButton";
import Select from "./Select";
import AnimateChoreoButton from "./AnimateChoreoButton";

function VerticalToolbar(props: ToolbarProps) {
  function changeHeatmapActivation() {
    props.showHeatmap ? props.deactivateHeatmap() : props.activateHeatmap();
  }

  return (
    <>
      <Col lg={1} className="no-padding-left">
        <Stack
          direction="vertical"
          gap={2}
          className="vertical-toolbar not-for-mobile"
        >
          <ToggleButton
            type="checkbox"
            id="toggleCheckHeatmap"
            variant="outline-light"
            className="ms-3 me-3 mt-5"
            checked={!props.showHeatmap}
            value="1"
            onChange={changeHeatmapActivation}
            title={
              props.showHeatmap ? "Leave analysis mode" : "Enter analysis mode"
            }
          >
            <Calendar3 />{" "}
            <p className="not-for-smaller-desktop no-margin-bottom">Analysis</p>
          </ToggleButton>

          <ToggleButton
            type="checkbox"
            id="toggleCheckShapes"
            variant="outline-light"
            className="ms-3 me-3"
            checked={!props.showShapes}
            value="1"
            onChange={
              props.showShapes ? props.deactivateShapes : props.activateShapes
            }
            title={props.showShapes ? "Leave shape mode" : "Enter shape mode"}
          >
            <BoundingBoxCircles /> <br />{" "}
            <p className="not-for-smaller-desktop no-margin-bottom">Shapes</p>
          </ToggleButton>

          <ToggleButton
            type="checkbox"
            id="toggleCheckTransitions"
            variant="outline-light"
            className=" ms-3 me-3"
            checked={!props.showTransitions}
            value="1"
            onChange={props.toggleTransitionDisplay}
            title={
              props.showTransitions
                ? "Leave transition mode"
                : "Enter transition mode"
            }
          >
            <Bezier2 /> <br />{" "}
            <p className="not-for-smaller-desktop no-margin-bottom">
              Transitions
            </p>
          </ToggleButton>

          <ToggleButton
            type="checkbox"
            id="toggleCheckOrientations"
            variant="outline-light"
            className="ms-3 me-3"
            checked={!props.showOrientations}
            value="1"
            onChange={props.toggleOrientationsDisplay}
            title={
              props.showOrientations
                ? "Leave orientation mode"
                : "Enter orientation mode"
            }
          >
            <ArrowsAngleExpand />{" "}
            <p className="not-for-smaller-desktop no-margin-bottom">
              Orientations
            </p>
          </ToggleButton>

          <ToggleButton
            type="checkbox"
            id="toggle3DView"
            variant="outline-light"
            className="ms-3 me-3"
            checked={!props.show3DView}
            value="1"
            onChange={props.toggle3DView}
            title={props.show3DView ? "Leave 3D mode" : "Enter 3D mode"}
          >
            <Badge3d />{" "}
            <p className="not-for-smaller-desktop no-margin-bottom">3D View</p>
          </ToggleButton>

          {props.editingModeActive && (
            <NewPatternButton
              choreo={props.choreo}
              addPattern={props.addPattern}
            />
          )}

          {!props.editingModeActive && (
            <AnimateChoreoButton
              nextClick={props.nextClick}
              setSelectedPattern={props.setSelectedPattern}
              selectedPattern={props.selectedPattern}
              choreoLength={props.choreo.patterns.length}
              setShowSliderForAnimatedChoreo={
                props.setShowSliderForAnimatedChoreo
              }
              speedForAnimatedChoreo={props.speedForAnimatedChoreo}
              setSpeedForAnimatedChoreo={props.setSpeedForAnimatedChoreo}
              forBottomToolbar={false}
              setCurrentlyInAnimation={props.setCurrentlyInAnimation}
              choreo={props.choreo}
              animationSpeed={props.animationSpeed}
            />
          )}

          <ButtonGroup className="mb-3 ms-3 me-3 horizontal-button-group">
            <Button
              variant="light"
              onClick={props.prevClick}
              disabled={props.prevDisabled}
              title="Previous pattern"
            >
              <ArrowLeftCircle /> <br />{" "}
              <p className="not-for-smaller-desktop no-margin-bottom">Prev</p>
            </Button>
            <Button
              variant="light"
              onClick={props.nextClick}
              disabled={props.nextDisabled}
              title="Next pattern"
            >
              <ArrowRightCircle /> <br />{" "}
              <p className="not-for-smaller-desktop no-margin-bottom">Next</p>
            </Button>
          </ButtonGroup>

          <ButtonGroup
            vertical
            className="mb-3 ms-3 me-3 vertical-button-group"
          >
            <Button
              variant="light"
              onClick={props.prevClick}
              disabled={props.prevDisabled}
              title="Previous pattern"
            >
              <ArrowLeftCircle /> <br />
            </Button>
            <Button
              variant="light"
              onClick={props.nextClick}
              disabled={props.nextDisabled}
              title="Next pattern"
            >
              <ArrowRightCircle /> <br />
            </Button>
          </ButtonGroup>

          <Select
            value={props.selectValue}
            onChange={props.onSelectChange}
            options={props.selectOptions}
            renderOnAllDevices={false}
          />
          <center>
            {props.editingModeActive && (
              <Pencil
                fontSize="40"
                className="mb-3 ms-3 me-3 not-for-mobile"
                fill="white"
              />
            )}
            {!props.editingModeActive && (
              <Eye
                fontSize="40"
                className="mb-3 ms-3 me-3 not-for-mobile"
                fill="white"
              />
            )}
          </center>
        </Stack>
      </Col>
    </>
  );
}

export default VerticalToolbar;
