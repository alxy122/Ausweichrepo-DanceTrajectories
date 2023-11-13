import "bootstrap/dist/css/bootstrap.min.css";
import { Diagram2Fill } from "react-bootstrap-icons";
import { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";

function MyDropdown() {
  // Initialize a state variable to hold the selected value
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  // Define a function to handle the dropdown item selection
  const handleDropdownSelect = (eventKey: string | null) => {
    setSelectedValue(eventKey);
    console.log(eventKey);
  };

  return (
    <Dropdown onSelect={handleDropdownSelect}>
      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
        <Diagram2Fill />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item eventKey="diagram1">Diagramm 1</Dropdown.Item>
        <Dropdown.Item eventKey="diagram2">Diagramm 2</Dropdown.Item>
        <Dropdown.Item eventKey="diagram3">Diagramm 3</Dropdown.Item>
      </Dropdown.Menu>

      {/* Display the selected value */}
      {/* {selectedValue && <p>Selected Value: {selectedValue}</p>} */}
      {/* {console.log(selectedValue)} */}
    </Dropdown>
  );
}

export default MyDropdown;
