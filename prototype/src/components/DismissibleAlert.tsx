import React, { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { DismissibleAlertProps } from "../interfaces/Toolbar";

function DismissibleAlert(props: DismissibleAlertProps) {
  return (
    <Alert variant="danger" onClose={() => props.setShow(false)} dismissible>
      <Alert.Heading>Attention</Alert.Heading>
      <p>{props.content}</p>
    </Alert>
  );
}

export default DismissibleAlert;
