import { ChangeEvent, useEffect, useState } from "react";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import SceneInit from "../services/PoseSceneInitialization";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import Select from "./Select";
import { SelectOption } from "../interfaces/Toolbar";
import { PoseViewProps } from "../interfaces/View3D";
import { Limb, Pose, Rotation } from "../interfaces/Choreography";

function PoseView(props: PoseViewProps) {
  const [selectedModel, setSelectedModel] = useState<null | THREE.Group>(null);

  const [maleModel, setMaleModel] = useState<null | THREE.Group>(null);
  const [femaleModel, setFemaleModel] = useState<null | THREE.Group>(null);

  const [sceneInit, setSceneInit] = useState<null | SceneInit>(null);

  var Loaders = {
    FBX: new FBXLoader(),
  };

  useEffect(() => {
    let localSceneInit = new SceneInit("pose-view-canvas");

    localSceneInit.initialize();
    localSceneInit.transformControls!.addEventListener("objectChange", () => {
      setSelectedPoseOption(selectPoseOptions.length - 1);
    });
    //localSceneInit.animate();

    Loaders.FBX.load("../ybot.fbx", (model) => {
      setMaleModel(model);
      model.position.y = -100;

      let limb = model.getObjectByName("mixamorigHips");
      localSceneInit.transformControls!.attach(limb!);

      setSelectedModel(model);
      const poseToLoad = props.savedPoses[0];
      poseToLoad.limbs.forEach((limb) => {
        const modelLimb = model!.getObjectByName(limb.name);
        modelLimb!.rotation.x = limb.rotation.x;
        modelLimb!.rotation.y = limb.rotation.y;
        modelLimb!.rotation.z = limb.rotation.z;
      });
      localSceneInit.scene!.add(model);
    });

    Loaders.FBX.load("../xbot.fbx", (model) => {
      setFemaleModel(model);
      model.position.y = -100;
      model.visible = false;

      let limb = model.getObjectByName("mixamorigHips");
      localSceneInit.transformControls!.attach(limb!);

      localSceneInit.scene!.add(model);
    });

    setSceneInit(localSceneInit);
  }, []);

  useEffect(() => {
    if (selectedModel && maleModel && femaleModel && sceneInit) {
      if (selectedModel === maleModel) {
        maleModel!.visible = true;
        femaleModel!.visible = false;
        sceneInit.transformControls!.detach();
        let limb = maleModel!.getObjectByName(
          "mixamorig" + selectLimbOptions[selectedLimbOption].label
        );
        sceneInit.transformControls!.attach(limb!);
      } else {
        maleModel!.visible = false;
        femaleModel!.visible = true;
        sceneInit.transformControls!.detach();
        let limb = femaleModel!.getObjectByName(
          "mixamorig" + selectLimbOptions[selectedLimbOption].label
        );
        sceneInit.transformControls!.attach(limb!);
      }
    }
  }, [selectedModel]);

  const [selectedLimbOption, setSelectedLimbOption] = useState(0);
  const [selectLimbOptions, setSelectLimbOptions] = useState<SelectOption[]>([
    { value: 0, label: "Hips", key: "0" },
    { value: 1, label: "Spine", key: "1" },

    { value: 2, label: "Neck", key: "2" },

    { value: 3, label: "RightShoulder", key: "3" },
    { value: 4, label: "RightArm", key: "4" },
    { value: 5, label: "RightForeArm", key: "5" },
    { value: 6, label: "RightHand", key: "6" },

    { value: 7, label: "LeftShoulder", key: "7" },
    { value: 8, label: "LeftArm", key: "8" },
    { value: 9, label: "LeftForeArm", key: "9" },
    { value: 10, label: "LeftHand", key: "10" },

    { value: 11, label: "RightUpLeg", key: "11" },
    { value: 12, label: "RightLeg", key: "12" },
    { value: 13, label: "RightFoot", key: "13" },

    { value: 14, label: "LeftUpLeg", key: "14" },
    { value: 15, label: "LeftLeg", key: "15" },
    { value: 16, label: "LeftFoot", key: "16" },
  ]);
  function onSelectLimbChange(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedLimbOption(+e.currentTarget.value);
  }

  const [selectedPoseOption, setSelectedPoseOption] = useState(0);
  const [selectPoseOptions, setSelectPoseOptions] = useState<SelectOption[]>([
    { value: -1, label: "", key: "-1" },
  ]);
  function onSelectPoseChange(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedPoseOption(+e.currentTarget.value);

    const poseName: string = selectPoseOptions[+e.currentTarget.value].label;

    props.savedPoses.forEach((pose) => {
      if (pose.name === poseName) {
        pose.limbs.forEach((limb) => {
          let modelPart = selectedModel!.getObjectByName(limb.name);
          modelPart!.rotation.x = limb.rotation.x;
          modelPart!.rotation.y = limb.rotation.y;
          modelPart!.rotation.z = limb.rotation.z;
        });
        return;
      }
    });
  }

  useEffect(() => {
    let options: SelectOption[] = [];
    let id = 0;
    let noOption = { value: id, label: `None`, key: String(id) };
    options.push(noOption);
    id++;
    props.savedPoses.forEach((pose) => {
      let option = { value: id, label: `${pose.name}`, key: String(id) };
      id++;
      options.push(option);
    });

    setSelectPoseOptions(options);
  }, [props.savedPoses]);

  useEffect(() => {
    if (maleModel && sceneInit) {
      sceneInit.transformControls!.detach();
      let limb = selectedModel!.getObjectByName(
        "mixamorig" + selectLimbOptions[selectedLimbOption].label
      );
      sceneInit.transformControls!.attach(limb!);
    }
  }, [selectedLimbOption]);

  function applyPoseToAllDancers() {
    for (
      let dancerId = 1;
      dancerId <= 2 * props.choreo.numCouples;
      dancerId++
    ) {
      props.changeDancerPose(props.selectedPattern, dancerId, getCurrentPose());
    }
  }

  function applyPoseToAllGentlemen() {
    for (
      let dancerId = 1;
      dancerId <= 2 * props.choreo.numCouples;
      dancerId++
    ) {
      if (dancerId % 2 === 1) {
        props.changeDancerPose(
          props.selectedPattern,
          dancerId,
          getCurrentPose()
        );
      }
    }
  }

  function applyPoseToAllLadies() {
    for (
      let dancerId = 1;
      dancerId <= 2 * props.choreo.numCouples;
      dancerId++
    ) {
      if (dancerId % 2 === 0) {
        props.changeDancerPose(
          props.selectedPattern,
          dancerId,
          getCurrentPose()
        );
      }
    }
  }

  function applyPoseToSelectedDancer() {
    props.changeDancerPose(
      props.selectedPattern,
      props.selectedDancerOption,
      getCurrentPose()
    );
  }

  function getCurrentPose(): Pose {
    let limbs: Limb[] = [];
    selectLimbOptions.forEach((option) => {
      let modelPart = selectedModel!.getObjectByName(
        "mixamorig" + option.label
      );
      let rotation: Rotation = {
        x: modelPart!.rotation.x,
        y: modelPart!.rotation.y,
        z: modelPart!.rotation.z,
      };
      let limb: Limb = { name: "mixamorig" + option.label, rotation: rotation };
      limbs.push(limb);
    });

    let pose: Pose = { name: newStandardPoseName, limbs: limbs };
    return pose;
  }

  useEffect(() => {
    if (props.selectedDancerOption > 0) {
      if (maleModel && sceneInit && femaleModel) {
        let localSelectedModel: THREE.Group;
        if (props.selectedDancerOption % 2 === 1) {
          localSelectedModel = maleModel;
          setSelectedModel(maleModel);
        } else {
          localSelectedModel = femaleModel;
          setSelectedModel(femaleModel);
        }

        const coupleNumber: number = Math.floor(
          (props.selectedDancerOption - 1) / 2
        );
        const dancerNumberInDanceCouple: number =
          (props.selectedDancerOption - 1) % 2;
        let poseToLoad =
          props.choreo.patterns[props.selectedPattern].positions[coupleNumber]
            .position[dancerNumberInDanceCouple].pose;
        if (poseToLoad.limbs.length === 0) {
          //Load standard pose
          poseToLoad = props.savedPoses[0];
        }
        poseToLoad.limbs.forEach((limb) => {
          const modelLimb = localSelectedModel!.getObjectByName(limb.name);
          modelLimb!.rotation.x = limb.rotation.x;
          modelLimb!.rotation.y = limb.rotation.y;
          modelLimb!.rotation.z = limb.rotation.z;
        });
      }
    } else {
      if (maleModel) {
        const poseToLoad = props.savedPoses[0];
        setSelectedModel(maleModel);
        poseToLoad.limbs.forEach((limb) => {
          const modelLimb = maleModel!.getObjectByName(limb.name);
          modelLimb!.rotation.x = limb.rotation.x;
          modelLimb!.rotation.y = limb.rotation.y;
          modelLimb!.rotation.z = limb.rotation.z;
        });
      }
    }
  }, [props.selectedDancerOption, props.selectedPattern]);

  const [newStandardPoseName, setNewStandardPoseName] = useState("");
  function saveCurrentPoseToStandardPoses() {
    if (newStandardPoseName.length > 0) {
      props.addStandardPose(getCurrentPose());
      setShowSuccessMessage(true);
      setTimeout(function () {
        setShowSuccessMessage(false);
      }, 3000);
    } else {
      setShowFailureMessage(true);
      setTimeout(function () {
        setShowFailureMessage(false);
      }, 3000);
    }
  }

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFailureMessage, setShowFailureMessage] = useState(false);

  useEffect(() => {
    if (sceneInit) {
      window.requestAnimationFrame(animate.bind(animate));
      render();
    }
  }, [sceneInit]);

  let [animFrame, setAnimFrame] = useState<null | number>(null);
  function animate() {
    if (props.show3DView) {
      setAnimFrame(window.requestAnimationFrame(animate.bind(animate)));
      sceneInit!.controls!.update();
    }
  }

  useEffect(() => {
    render();
  }, [animFrame]);

  useEffect(() => {
    if (sceneInit) {
      if (props.show3DView) {
        animate();
      }
    }
  }, [props.show3DView]);

  function render() {
    if (sceneInit && props.show3DView) {
      sceneInit.renderer!.render(
        sceneInit.scene as THREE.Scene,
        sceneInit.camera as THREE.Camera
      );
    }
  }

  return (
    <>
      {showSuccessMessage && (
        <Alert variant={"success"}>Pose saved successfully!</Alert>
      )}
      {showFailureMessage && (
        <Alert variant={"danger"}>Pose must have a name!</Alert>
      )}
      <Container
        style={{ visibility: props.show3DView ? "visible" : "hidden" }}
      >
        <Row className="mb-2">
          <Col sm={2}>
            <Badge bg="secondary" className="me-2">
              Apply for
            </Badge>{" "}
          </Col>
          <Col sm={10}>
            <ButtonGroup className="me-2">
              <Button
                onClick={applyPoseToSelectedDancer}
                disabled={props.selectedDancerOption === 0}
              >
                Selected Dancer
              </Button>
              <Button onClick={applyPoseToAllDancers}>All Dancers</Button>
              <Button onClick={applyPoseToAllGentlemen}>Gentlemen</Button>
              <Button onClick={applyPoseToAllLadies}>Ladies</Button>
            </ButtonGroup>
          </Col>
        </Row>

        <Row>
          <Col sm={2}>
            <Badge bg="secondary" className="me-2">
              Select limb
            </Badge>{" "}
          </Col>
          <Col sm={9}>
            <Select
              value={selectedLimbOption}
              onChange={onSelectLimbChange}
              options={selectLimbOptions}
              renderOnAllDevices={true}
            />
          </Col>
        </Row>

        <Row className="mb-2">
          <Col sm={2}>
            <Badge bg="secondary" className="me-2">
              Load pose
            </Badge>{" "}
          </Col>
          <Col sm={9}>
            <Select
              value={selectedPoseOption}
              onChange={onSelectPoseChange}
              options={selectPoseOptions}
              renderOnAllDevices={true}
            />
          </Col>
        </Row>

        <Row className="mb-2">
          <Col sm={2}>
            <Badge bg="secondary" className="me-2">
              Save pose
            </Badge>{" "}
          </Col>
          <Col sm={8}>
            <Form.Group className="mb-3">
              <Form.Control
                value={newStandardPoseName}
                onChange={(e) => setNewStandardPoseName(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col sm={2}>
            <Button onClick={() => saveCurrentPoseToStandardPoses()}>
              Save
            </Button>
          </Col>
        </Row>
      </Container>
      <div id="pose-view-wrapper" style={{ width: "100%", height: "100%" }}>
        <canvas
          id="pose-view-canvas"
          style={{
            width: "100%",
            height: "60%",
            visibility: props.show3DView ? "visible" : "hidden",
          }}
        />
      </div>
    </>
  );
}

export default PoseView;
