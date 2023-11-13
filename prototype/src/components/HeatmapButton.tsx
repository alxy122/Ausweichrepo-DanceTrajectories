import { Button } from "react-bootstrap";
import { Calendar3 } from "react-bootstrap-icons";

function HeatmapButton() {
  return (
    <>
      <Button className="btn-light ms-3 me-3">
        <Calendar3 /> <p className="no-margin-bottom">Heatmap</p>
      </Button>
    </>
  );
}

export default HeatmapButton;
