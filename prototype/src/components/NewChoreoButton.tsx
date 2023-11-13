import React, { ChangeEvent, useEffect } from "react";
import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { FileEarmarkText } from "react-bootstrap-icons";
import { useIsomorphicLayoutEffect } from "react-spring";
import { Pattern } from "../interfaces/Choreography";
import { NewChoreoButtonProps } from "../interfaces/Navbar";
import { SelectOption } from "../interfaces/Toolbar";
import { getStandardPattern } from "../services/FileServices";
import Select from "./Select";

function NewChoreoButton(props: NewChoreoButtonProps) {
  const [show, setShow] = useState(false);

  const [validated, setValidated] = useState(false);

  const [firstPatternName, setFirstPatternName] = useState("");
  const [newChoreoName, setNewChoreoName] = useState("");
  const [newChoreoDescription, setNewChoreoDescription] = useState("");
  const [numCouples, setNumCouples] = React.useState(8);

  const [selectedOption, setSelectedOption] = useState(0);
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
    { value: 2, label: "Horizontal lines", key: "2" },
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
    if (numCouples === 8) {
      setStandardPatterns(standardPatternsFor8Dancers);
      setSelectOptions(standardPatternsFor8Dancers);
    } else {
      setStandardPatterns(standardPatternsForLessDancers);
      setSelectOptions(standardPatternsForLessDancers);
    }
  }, [numCouples]);

  useEffect(() => {
    setSelectOptions(standardPatterns);
  }, []);

  const handleSubmit = (event: any) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);

    if (newChoreoName.length > 0 && firstPatternName.length > 0) {
      createNewChoreography();
    }
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function onChangeCoupleNumAmount(newCoupleNumAmount: number) {
    setNumCouples(newCoupleNumAmount);
  }

  async function createNewChoreography() {
    const filePath: string = `./standardPatterns/${selectOptions[
      selectedOption
    ].label
      .replaceAll(" ", "")
      .trim()}${numCouples}.json`;
    const firstPattern: Pattern = await getStandardPattern(filePath);
    firstPattern.dance = firstPatternName;

    props.createNewChoreography(
      newChoreoName,
      newChoreoDescription,
      numCouples,
      firstPattern
    );
    handleClose();
  }

  function onSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedOption(+e.currentTarget.value);
  }

  return (
    <>
      <Button
        variant="light"
        className="ms-3 me-2"
        onClick={handleShow}
        title="Create new choreo"
      >
        <FileEarmarkText />{" "}
        <p className="not-for-mobile no-margin-bottom">New</p>
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create new choreo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Label style={{ fontWeight: "bold" }}>
              Specify your new choreo
            </Form.Label>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="New choreo title"
                onChange={(e) => {
                  setNewChoreoName(e.target.value);
                }}
                autoFocus
              />
              <Form.Control.Feedback type="invalid">
                Please choose a name for the new choreography.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                onChange={(e) => {
                  setNewChoreoDescription(e.target.value);
                }}
              />
            </Form.Group>

            <Form.Group
              className="mb-3"
              as={Row}
              //controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Number of couples</Form.Label>
              <Col xs="11">
                <Form.Range
                  value={numCouples}
                  onChange={(e) => onChangeCoupleNumAmount(+e.target.value)}
                  min={3}
                  max={8}
                  step={1}
                />
              </Col>
              <Col xs="1">
                <Form.Label>{numCouples}</Form.Label>
              </Col>
            </Form.Group>
            <Form.Label style={{ fontWeight: "bold" }}>
              Specify your first pattern
            </Form.Label>

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Name of first pattern"
                onChange={(e) => {
                  setFirstPatternName(e.target.value);
                }}
                autoFocus
              />
              <Form.Control.Feedback type="invalid">
                Please choose a name for the first pattern.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Label>First pattern</Form.Label>
          </Form>
          <Select
            value={selectedOption}
            onChange={onSelectChange}
            options={selectOptions}
            renderOnAllDevices={true}
          ></Select>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button type="submit" variant="primary" onClick={handleSubmit}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NewChoreoButton;
