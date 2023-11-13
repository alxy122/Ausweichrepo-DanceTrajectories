import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { SetBarAndBeatModalProps } from "../interfaces/Timeline";

export default function SetBarAndBeatModal(props: SetBarAndBeatModalProps) {
  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Set pattern time</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" as={Row}>
          <Form.Label>New Bar</Form.Label>
          <Col xs="11">
            <Form.Range
              value={props.selectedBarModal}
              onChange={(e) => props.setSelectedBarModal(+e.target.value)}
              min={0}
              max={props.highestBarNumber - 1}
              step={1}
            />
          </Col>
          <Col xs="1">
            <Form.Label>{props.selectedBarModal + 1}</Form.Label>
          </Col>
        </Form.Group>

        <Form.Group className="mb-3" as={Row}>
          <Form.Label>New Beat</Form.Label>
          <Col xs="11">
            <Form.Range
              value={props.selectedBeatModal}
              onChange={(e) => props.setSelectedBeatModal(+e.target.value)}
              min={0}
              max={7}
              step={1}
            />
          </Col>
          <Col xs="1">
            <Form.Label>{props.selectedBeatModal + 1}</Form.Label>
          </Col>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="danger"
          onClick={() => {
            props.handleClose();
            props.setShowReassuranceModal(true);
          }}
        >
          Remove
        </Button>
        <Button variant="primary" onClick={props.applyModalValues}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
