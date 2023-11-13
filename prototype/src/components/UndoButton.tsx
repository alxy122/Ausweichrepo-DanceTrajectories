import { Button } from "react-bootstrap";
import { ArrowCounterclockwise, Disc } from "react-bootstrap-icons";
import { UndoButtonProps } from "../interfaces/Navbar";

function UndoButton(props: UndoButtonProps) {
  return (
    <Button variant="light" className="me-2">
      <ArrowCounterclockwise />{" "}
      <p className="not-for-mobile no-margin-bottom">Undo</p>
    </Button>
  );
}

export default UndoButton;
