import { Button } from "react-bootstrap";
import { Disc } from "react-bootstrap-icons";
import { SaveChoreoButtonProps } from "../interfaces/Navbar";

function SaveChoreoButton(props: SaveChoreoButtonProps) {
  function downloadChoreoFile(e: any) {
    const fileName = props.choreo.name;
    const json = JSON.stringify(props.choreo, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }

  return (
    <Button
      variant="light"
      className="me-2"
      type="button"
      onClick={downloadChoreoFile}
      title="Save choreo to file system"
    >
      <Disc /> <p className="not-for-mobile no-margin-bottom">Save</p>
    </Button>
  );
}

export default SaveChoreoButton;
