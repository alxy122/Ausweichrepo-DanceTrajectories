import { Alert, Button, Form, Modal } from "react-bootstrap";
import React, { useRef, useState } from "react";
import { Folder2Open } from "react-bootstrap-icons";
import "../styles/App.css";
import { LoadChoreoButtonProps } from "../interfaces/Navbar";

function LoadChoreoButton(props: LoadChoreoButtonProps) {
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    let reader = new FileReader();
    if (uploadedFile) {
      reader.readAsText(uploadedFile);

      reader.onload = function () {
        console.log(JSON.parse(String(reader.result)));
        props.loadChoreo(JSON.parse(String(reader.result)));
      };

      reader.onerror = function () {
        console.log(reader.error);
      };
    }
  };
  const handleShow = () => setShow(true);

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    inputRef.current?.click();
  };
  const handleDisplayFileDetails = () => {
    if (inputRef.current?.files) {
      if (inputRef.current.files[0].type === "application/json") {
        setUploadedFileName(inputRef.current.files[0].name);
        setUploadedFile(inputRef.current.files[0]);
      }
    }
  };

  return (
    <>
      <Button
        variant="light"
        className="me-2"
        onClick={handleShow}
        title="Load choreo from file system"
      >
        <Folder2Open /> <p className="not-for-mobile no-margin-bottom">Load</p>
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Load Choreography</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant={"warning"}>
            Please make sure that you only upload valid choreographies until
            JSON validation is implemented.
          </Alert>
          <div className="m-3">
            <label className="mx-3">Choose file:</label>
            <input
              ref={inputRef}
              onChange={handleDisplayFileDetails}
              className="d-none"
              type="file"
            />
            <button
              onClick={handleUpload}
              className={`btn btn-outline-${
                uploadedFileName ? "success" : "primary"
              }`}
            >
              {uploadedFileName ? uploadedFileName : "Upload"}
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Load
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default LoadChoreoButton;
