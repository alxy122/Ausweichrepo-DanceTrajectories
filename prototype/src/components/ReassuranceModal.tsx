import { Button, Modal } from "react-bootstrap";
import { ReassuranceModalProps } from "../interfaces/Timeline";

export function ReassuranceModal(props: ReassuranceModalProps) {
  return (
    <Modal
      show={props.showReassuranceModal}
      onHide={() => props.setShowReassuranceModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Delete pattern</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Do you really want to delete this pattern?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            props.setShowReassuranceModal(false);
          }}
        >
          No
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            props.setShowReassuranceModal(false);
            props.removePattern(props.selectedPattern);
          }}
        >
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
