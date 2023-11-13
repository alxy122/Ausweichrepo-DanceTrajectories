import { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import { AccordionProps } from "../interfaces/Accordion";

function AccordionComponent(props: AccordionProps) {
    return (
      <Accordion defaultActiveKey={props.defaultKey} className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>{props.title}</Accordion.Header>
          <Accordion.Body>{props.child}</Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
}

export default AccordionComponent;
