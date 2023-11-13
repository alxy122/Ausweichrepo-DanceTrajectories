import { useState, useEffect, ChangeEvent } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import {
  DanceCouple,
  Pattern,
  Position,
  StandardPattern,
} from "../interfaces/Choreography";
import { NewPatternButtonProps, SelectOption } from "../interfaces/Toolbar";
import { getStandardPattern } from "../services/FileServices";
import Select from "./Select";

function NewPatternButton(props: NewPatternButtonProps) {
  const [show, setShow] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [newPatternName, setNewPatternName] = useState("");
  const [firstRemarks, setFirstRemarks] = useState("");

  const [patternSelection, setPatternSelection] = useState("existingPattern");
  const showExistingPatternInSelection = true;

  const [selectedOption, setSelectedOption] = useState(
    props.choreo.patterns.length - 1
  );
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([
    { value: -1, label: "", key: "-1" },
  ]);

  const standardPatternsFor8Dancers: {
    value: number;
    label: string;
    key: string;
  }[] = [
    { value: 0, label: "Rectangle", key: "0" },
    { value: 1, label: "2 Diamonds", key: "1" },
    { value: 2, label: "Horizontal Lines", key: "2" },
    { value: 3, label: "Vertical Lines", key: "3" },
    { value: 4, label: "Arrow", key: "4" },
    { value: 5, label: "Double Diagonal", key: "5" },
  ];

  const standardPatternsForLessDancers: {
    value: number;
    label: string;
    key: string;
  }[] = [{ value: 0, label: "Rectangle", key: "0" }];

  const [standardPatterns, setStandardPatterns] = useState(
    standardPatternsFor8Dancers
  );

  useEffect(() => {
    if (props.choreo.numCouples === 8) {
      setStandardPatterns(standardPatternsFor8Dancers);
      setSelectOptions(standardPatternsFor8Dancers);
    } else {
      setStandardPatterns(standardPatternsForLessDancers);
      setSelectOptions(standardPatternsForLessDancers);
    }
  }, [props.choreo.numCouples]);

  function openModal() {
    setValidated(false);
    setNewPatternName("");
    setFirstRemarks("");
    setPatternSelection("standardPattern");
    setSelectedOption(0);
    setSelectOptions(standardPatterns);
    handleShow();
  }

  useEffect(() => {
    if (props.choreo) {
      const options = props.choreo.patterns.map(
        ({ id, dance }: any, idx: any) => {
          return { value: idx, label: `${id} - ${dance}`, key: String(id) };
        }
      );
      setSelectOptions(options);
    }
  }, [props.choreo]);

  function handlePatternSelectionChange(e: any) {
    e.persist();
    setPatternSelection(e.target.value);
    if (e.target.value === "existingPattern") {
      if (props.choreo) {
        const options = props.choreo.patterns.map(
          ({ id, dance }: any, idx: any) => {
            return { value: idx, label: `${id} - ${dance}`, key: String(id) };
          }
        );
        setSelectOptions(options);
        setSelectedOption(props.choreo.patterns.length - 1);
      }
    } else if (e.target.value === "standardPattern") {
      setSelectOptions(standardPatterns);
      setSelectedOption(0);
    } else {
      if (props.choreo) {
        const options = props.choreo.draft.map(
          ({ id, dance }: any, idx: any) => {
            return { value: idx, label: `${dance}`, key: String(id) };
          }
        );
        setSelectOptions(options);
        setSelectedOption(0);
      }
    }
  }

  function onSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedOption(+e.currentTarget.value);
  }

  async function createNewPattern(e: any) {
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    setValidated(true);

    if (newPatternName.length > 0) {
      let newPattern: Pattern = {
        id: -1,
        dance: "",
        remarks: "",
        pointDescription: "",
        bar: -1,
        beat: -1,
        positions: [],
        intermediatePatterns: [],
        shapes: [],
      };
      if (patternSelection === "standardPattern") {
        const filePath: string = `./standardPatterns/${selectOptions[
          selectedOption
        ].label
          .replaceAll(" ", "")
          .trim()}${props.choreo.numCouples}.json`;
        console.log(filePath);
        newPattern = await getStandardPattern(filePath);
      } else if (patternSelection === "existingPattern") {
        let newDanceCouples: DanceCouple[] = [];
        let patternToCopy: Pattern = props.choreo.patterns[selectedOption];

        for (
          let coupleId = 1;
          coupleId <= props.choreo.numCouples;
          coupleId++
        ) {
          const gentleman = patternToCopy.positions[coupleId - 1].position[0];
          const lady = patternToCopy.positions[coupleId - 1].position[1];

          let newPositions: Position[] = [];
          newPositions.push({
            x: gentleman.x,
            y: gentleman.y,
            bodyOrientation: gentleman.bodyOrientation,
            headOrientation: gentleman.headOrientation,
            pose: gentleman.pose,
          });
          newPositions.push({
            x: lady.x,
            y: lady.y,
            bodyOrientation: lady.bodyOrientation,
            headOrientation: lady.headOrientation,
            pose: lady.pose,
          });

          newDanceCouples.push({
            id: coupleId,
            joint: patternToCopy.positions[coupleId - 1].joint,
            position: newPositions,
          });
        }

        newPattern.positions = newDanceCouples;
      } else {
        let newDanceCouples: DanceCouple[] = [];
        let patternToCopy: Pattern = props.choreo.draft[selectedOption];

        for (
          let coupleId = 1;
          coupleId <= props.choreo.numCouples;
          coupleId++
        ) {
          const gentleman = patternToCopy.positions[coupleId - 1].position[0];
          const lady = patternToCopy.positions[coupleId - 1].position[1];

          let newPositions: Position[] = [];
          newPositions.push({
            x: gentleman.x,
            y: gentleman.y,
            bodyOrientation: gentleman.bodyOrientation,
            headOrientation: gentleman.headOrientation,
            pose: gentleman.pose,
          });
          newPositions.push({
            x: lady.x,
            y: lady.y,
            bodyOrientation: lady.bodyOrientation,
            headOrientation: lady.headOrientation,
            pose: lady.pose,
          });

          newDanceCouples.push({
            id: coupleId,
            joint: patternToCopy.positions[coupleId - 1].joint,
            position: newPositions,
          });
        }

        newPattern.positions = newDanceCouples;
      }

      newPattern.id =
        props.choreo.patterns[props.choreo.patterns.length - 1].id + 1;
      newPattern.dance = newPatternName;
      newPattern.remarks = firstRemarks;

      props.addPattern(newPattern);
      handleClose();
    }
  }

  return (
    <>
      <Button
        className="mb-3 btn-light ms-3 me-3"
        onClick={openModal}
        title="Create new pattern"
      >
        <PlusCircle /> <br />{" "}
        <p className="not-for-smaller-desktop no-margin-bottom">New Pattern</p>
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create new pattern</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={createNewPattern}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="New patterns name"
                onChange={(e) => {
                  setNewPatternName(e.target.value);
                }}
                autoFocus
              />
              <Form.Control.Feedback type="invalid">
                Please choose a name for the new pattern.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>First remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                onChange={(e) => {
                  setFirstRemarks(e.target.value);
                }}
              />
            </Form.Group>

            <Form.Group controlId="patternCreationMethod" className="mb-3">
              <Form.Check
                value="existingPattern"
                type="radio"
                label="Duplicate existing pattern"
                onChange={handlePatternSelectionChange}
                checked={patternSelection === "existingPattern"}
              />
              <Form.Check
                value="standardPattern"
                type="radio"
                label="Use standard pattern"
                onChange={handlePatternSelectionChange}
                checked={patternSelection === "standardPattern"}
              />
              <Form.Check
                value="draftPattern"
                type="radio"
                label="Use draft pattern"
                onChange={handlePatternSelectionChange}
                checked={patternSelection === "draftPattern"}
              />
            </Form.Group>
            <Select
              value={selectedOption}
              onChange={onSelectChange}
              options={selectOptions}
              renderOnAllDevices={true}
            ></Select>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={createNewPattern}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NewPatternButton;
