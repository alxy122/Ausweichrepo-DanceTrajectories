import { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { PencilFill } from "react-bootstrap-icons";
import Accordion from "react-bootstrap/Accordion";
import { RemarksAccordionProps } from "../interfaces/Accordion";

function RemarksAccordionComponent(props: RemarksAccordionProps) {
  const [show, setShow] = useState(false);

  const [newRemark, setNewRemark] = useState("");

  function changeNewRemark(e: any) {
    setNewRemark(e.target.value);
  }

  useEffect(() => {
    setNewRemark(props.remarks);
  }, [props.remarks]);

  function handleClose() {
    setShow(false);
    props.setRemarks(props.selectedPattern, newRemark);
  }
  const handleShow = () => {
    if (props.editingModeActive) {
      setShow(true);
    }
  };

  return (
    <>
      <Accordion defaultActiveKey={props.defaultKey} className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Remarks</Accordion.Header>
          <Accordion.Body onClick={handleShow}>{props.remarks}</Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Remarks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>New Remarks</Form.Label>
              <Form.Control
                as="textarea"
                defaultValue={props.remarks}
                rows={3}
                onChange={changeNewRemark}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RemarksAccordionComponent;
