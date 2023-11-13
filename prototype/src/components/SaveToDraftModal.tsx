import { Button, Form, Modal } from "react-bootstrap";
import { SaveToDraftModalProps } from "../interfaces/PatternView";
import { useEffect, useState } from "react";

function SaveToDraftModal(props: SaveToDraftModalProps) {
  const [validated, setValidated] = useState(false);
  const [newDraftName, setNewDraftName] = useState("");

  useEffect(() => {
    if (props.showModal) {
      setValidated(false);
      setNewDraftName("");
    }
  }, [props.showModal]);

  function saveToDraft(e: any) {
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }
    setValidated(true);

    if (newDraftName.length > 0) {
      let draftPattern = {
        id: 0,
        dance: newDraftName,
        remarks: "",
        pointDescription: "",
        bar: 0,
        beat: 0,
        positions: props.pattern.positions,
        intermediatePatterns: [],
        shapes: [],
      };
      props.addPatternToDraft(newDraftName, draftPattern);
      props.setShowModal(false);
    }
  }

  return (
    <Modal show={props.showModal} onHide={() => props.setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Save to draft</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={saveToDraft}>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Name</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Draft name"
              onChange={(e) => {
                setNewDraftName(e.target.value);
              }}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              Please choose a name pattern in the draft.
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            props.setShowModal(false);
          }}
        >
          Cancel
        </Button>
        <Button variant="primary" onClick={(e) => saveToDraft(e)}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SaveToDraftModal;
