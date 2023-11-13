import { ChangeEvent, useEffect, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";
import SceneInit from "../services/SceneInitialization";
import { View3DProps } from "../interfaces/View3D";
import { Alert, Spinner } from "react-bootstrap";
import { SelectOption } from "../interfaces/Toolbar";
import Select from "./Select";
import { DanceCouple, Limb, Position } from "../interfaces/Choreography";

function View3D(props: View3DProps) {
  const [models, setModels] = useState<null | THREE.Object3D[]>(null);

  const [loadingFinished, setLoadingFinished] = useState(false);
  const [sceneInit, setSceneInit] = useState<SceneInit | null>(null);

  var Loaders = {
    FBX: new FBXLoader(),
  };

  useEffect(() => {
    const test = new SceneInit("3d-view-canvas");
    test.initialize();
    //test.animate();
    setSceneInit(test);

    test.camera!.position.z = 1600;
    test.camera!.position.y = 600;
    test.camera!.position.x = 0;
    test.camera!.lookAt(new THREE.Vector3(0, 0, 0));

    let loadedModels: THREE.Object3D[] = [];

    for (let i = 1; i <= 2; i++) {
      let path = "../ybot.fbx";
      if (i === 2) {
        path = "../xbot.fbx";
      }
      Loaders.FBX.load(
        path,
        (model) => {
          //console.log(model);
          copyModels(model, i, loadedModels, test.scene!);
        },
        (e) => {
          setLoadingFinished(true);
        }
      );
    }

    setModels(loadedModels);
  }, []);

  useEffect(() => {
    if (sceneInit && models) {
      for (let i = 1; i <= 8; i++) {
        if (i <= props.choreo.numCouples) {
          models[2 * i - 1].visible = true;
          models[2 * i].visible = true;
        } else {
          models[2 * i - 1].visible = false;
          models[2 * i].visible = false;
        }
      }
    }
  }, [props.choreo.numCouples]);

  function copyModels(
    original: THREE.Group,
    maleOrFemale: number,
    loadedModels: THREE.Object3D[],
    scene: THREE.Scene
  ) {
    const startValue = maleOrFemale % 2 === 0 ? 2 : 1;
    console.log(props.choreo.numCouples);
    for (let i = startValue; i <= props.choreo.numCouples * 2; i += 2) {
      const coupleNumber: number = Math.floor((i - 1) / 2);
      const danceCouple: DanceCouple =
        props.choreo.patterns[props.selectedPattern].positions[coupleNumber];
      const dancerNumberInDanceCouple: number = (i - 1) % 2;
      const dancer = danceCouple.position[dancerNumberInDanceCouple];

      let model = clone(original) as THREE.Object3D;

      model.rotation.y = -((dancer.bodyOrientation - 180) * Math.PI) / 180;
      const head = model.getObjectByName("mixamorigHead");
      head!.rotation.y =
        ((dancer.bodyOrientation - dancer.headOrientation) * Math.PI) / 180;

      model.position.x =
        props.choreo.patterns[props.selectedPattern].positions[
          Math.floor((i - 1) / 2)
        ].position[(i - 1) % 2].x * 100;
      model.position.z =
        -props.choreo.patterns[props.selectedPattern].positions[
          Math.floor((i - 1) / 2)
        ].position[(i - 1) % 2].y * 100;
      model.position.y = -100;
      model.scale.set(1, 1, 1);
      scene.add(model);
      loadedModels[i] = model;

      if (dancer.pose.limbs.length > 0) {
        dancer.pose.limbs.forEach((limb) => {
          initLimb(limb, model);
        });
      } else {
        props.choreo.savedPoses[0].limbs.forEach((limb) =>
          initLimb(limb, model)
        );
      }

      if (danceCouple.joint && i % 2 === 0) {
        model.visible = false;
      }
    }
  }

  useEffect(() => {
    if (models && props.show3DView) {
      let i = 1;
      props.choreo.patterns[props.selectedPattern].positions.forEach(
        (danceCouple) => {
          if (danceCouple.joint) {
            const maleModel = models![2 * i - 1] as THREE.Group;
            if (maleModel) {
              updateMaleModel(maleModel, i, danceCouple.position[0]);
            }

            const femaleModel = models![2 * i] as THREE.Group;
            if (femaleModel) {
              femaleModel.visible = false;
            }
          } else {
            const maleModel = models![2 * i - 1] as THREE.Group;
            if (maleModel) {
              updateMaleModel(maleModel, i, danceCouple.position[0]);
            }
            const femaleModel = models![2 * i] as THREE.Group;
            if (femaleModel) {
              updateFemaleModel(femaleModel, i, danceCouple.position[1]);
            }
          }
          i++;
        }
      );
    }
  }, [props.selectedPattern, props.show3DView]);

  function updateMaleModel(
    maleModel: THREE.Group,
    i: number,
    dancer: Position
  ) {
    maleModel.rotation.y = -((dancer.bodyOrientation - 180) * Math.PI) / 180;
    const head = maleModel.getObjectByName("mixamorigHead");
    head!.rotation.y =
      ((dancer.bodyOrientation - dancer.headOrientation) * Math.PI) / 180;

    maleModel.position.x =
      props.choreo.patterns[props.selectedPattern].positions[i - 1].position[0]
        .x * 100;
    maleModel.position.z =
      -props.choreo.patterns[props.selectedPattern].positions[i - 1].position[0]
        .y * 100;
    maleModel.position.y = -100;
    maleModel.scale.set(1, 1, 1);
  }

  function updateFemaleModel(
    femaleModel: THREE.Group,
    i: number,
    dancer: Position
  ) {
    femaleModel.visible = true;

    femaleModel.rotation.y = -((dancer.bodyOrientation - 180) * Math.PI) / 180;
    const head = femaleModel.getObjectByName("mixamorigHead");
    head!.rotation.y =
      ((dancer.bodyOrientation - dancer.headOrientation) * Math.PI) / 180;

    femaleModel.position.x =
      props.choreo.patterns[props.selectedPattern].positions[i - 1].position[1]
        .x * 100;
    femaleModel.position.z =
      -props.choreo.patterns[props.selectedPattern].positions[i - 1].position[1]
        .y * 100;
    femaleModel.position.y = -100;
    femaleModel.scale.set(1, 1, 1);
  }

  useEffect(() => {
    if (models && props.show3DView) {
      for (
        let dancerId = 1;
        dancerId <= props.choreo.numCouples * 2;
        dancerId++
      ) {
        const position =
          props.choreo.patterns[props.selectedPattern].positions[
            Math.floor((dancerId - 1) / 2)
          ].position[(dancerId - 1) % 2];
        if (position.pose.limbs.length > 0) {
          position.pose.limbs.forEach((limb) => {
            updateLimb(limb, dancerId);
          });
        } else {
          props.choreo.savedPoses[0].limbs.forEach((limb) =>
            updateLimb(limb, dancerId)
          );
        }
      }
      updateMarker();
    }
  }, [props.choreo, props.selectedPattern, props.show3DView]);

  function updateMarker() {
    if (props.selectedDancerOption <= 0) return;

    const coupleNumber: number = Math.floor(
      (props.selectedDancerOption - 1) / 2
    );
    let dancerNumberInDanceCouple: number =
      (props.selectedDancerOption - 1) % 2;
    if (
      props.choreo.patterns[props.selectedPattern].positions[coupleNumber].joint
    ) {
      dancerNumberInDanceCouple = 0;
    }

    sceneInit!.torus!.visible = true;
    const selectedDancerData =
      props.choreo.patterns[props.selectedPattern].positions[coupleNumber]
        .position[dancerNumberInDanceCouple];
    const markerX = selectedDancerData.x;
    const markerY = selectedDancerData.y;
    sceneInit!.torus!.position.set(markerX * 100, -70, -markerY * 100);
  }

  function initLimb(limb: Limb, model: THREE.Object3D) {
    let modelLimb = model.getObjectByName(limb.name);
    modelLimb!.rotation.x = limb.rotation.x;
    modelLimb!.rotation.y = limb.rotation.y;
    modelLimb!.rotation.z = limb.rotation.z;
  }

  function updateLimb(limb: Limb, dancerId: number) {
    if (models && models[dancerId]) {
      let modelLimb = models![dancerId]!.getObjectByName(limb.name);
      modelLimb!.rotation.x = limb.rotation.x;
      modelLimb!.rotation.y = limb.rotation.y;
      modelLimb!.rotation.z = limb.rotation.z;
    }
  }

  useEffect(() => {
    let newSelectOptions = [];
    newSelectOptions.push({ value: 0, label: "None", key: "0" });
    for (let i = 0; i < props.choreo.numCouples; i++) {
      newSelectOptions.push({
        value: 2 * i + 1,
        label: `Gentleman ${i}`,
        key: String(2 * i + 1),
      });
      newSelectOptions.push({
        value: 2 * i + 2,
        label: `Lady ${i}`,
        key: String(2 * i + 2),
      });
    }
    setSelectDancerOptions(newSelectOptions);
  }, [props.choreo.numCouples]);

  const [selectDancerOptions, setSelectDancerOptions] = useState<
    SelectOption[]
  >([
    { value: 0, label: "None", key: "0" },
    { value: 1, label: "Gentleman 1", key: "1" },
    { value: 2, label: "Lady 1", key: "2" },
    { value: 3, label: "Gentleman 2", key: "3" },
    { value: 4, label: "Lady 2", key: "4" },
    { value: 5, label: "Gentleman 3", key: "5" },
    { value: 6, label: "Lady 3", key: "6" },
    { value: 7, label: "Gentleman 4", key: "7" },
    { value: 8, label: "Lady 4", key: "8" },
    { value: 9, label: "Gentleman 5", key: "9" },
    { value: 10, label: "Lady 5", key: "10" },
    { value: 11, label: "Gentleman 6", key: "11" },
    { value: 12, label: "Lady 6", key: "12" },
    { value: 13, label: "Gentleman 7", key: "13" },
    { value: 14, label: "Lady 7", key: "14" },
    { value: 15, label: "Gentleman 8", key: "15" },
    { value: 16, label: "Lady 8", key: "16" },
  ]);

  function onSelectDancerChange(e: ChangeEvent<HTMLSelectElement>) {
    const newlySelectedDancerId = +e.currentTarget.value;

    props.setSelectedDancerOption(newlySelectedDancerId);
    if (models && sceneInit) {
      if (newlySelectedDancerId === 0) {
        sceneInit.torus!.visible = false;
      } else {
        const coupleNumber: number = Math.floor(
          (newlySelectedDancerId - 1) / 2
        );
        const dancerNumberInDanceCouple: number =
          (newlySelectedDancerId - 1) % 2;
        sceneInit.torus!.visible = true;
        const selectedDancerData =
          props.choreo.patterns[props.selectedPattern].positions[coupleNumber]
            .position[dancerNumberInDanceCouple];
        const markerX = selectedDancerData.x;
        const markerY = selectedDancerData.y;
        sceneInit.torus!.position.set(markerX * 100, -70, -markerY * 100);
      }
    }
  }

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
      sceneInit.torus!.rotation.z += 0.05;
      sceneInit.renderer!.render(
        sceneInit.scene as THREE.Scene,
        sceneInit.camera as THREE.Camera
      );
    }
  }

  useEffect(() => {
    if (sceneInit && models) {
      switch (props.patternRotation) {
        case "Front":
          sceneInit.camera!.position.set(0, 600, 1600);
          break;
        case "Right":
          sceneInit.camera!.position.set(1600, 600, 0);
          break;
        case "Back":
          sceneInit.camera!.position.set(0, 600, -1600);
          break;
        case "Left":
          sceneInit.camera!.position.set(-1600, 600, 0);
          break;
      }
      sceneInit.controls!.update();
    }
  }, [props.patternRotation]);

  return (
    <div
      id="3d-view-wrapper"
      style={{
        width: "100%",
        height: "100%",
        visibility: props.show3DView ? "visible" : "hidden",
      }}
    >
      {!loadingFinished && (
        <Alert key={"info"} variant={"info"}>
          <Spinner animation="border" className="me-2" size="sm" /> Loading
          models ...
        </Alert>
      )}
      <Select
        value={props.selectedDancerOption}
        onChange={onSelectDancerChange}
        options={selectDancerOptions}
        renderOnAllDevices={true}
      />
      <canvas id="3d-view-canvas" style={{ width: "100%", height: "90%" }} />
    </div>
  );
}

export default View3D;
