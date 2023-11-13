import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

function BasicExample(props: { cardTitle: string; buttonText: string }) {
  return (
    <Card style={{ width: "18rem" }} className="mb-3 me-3">
      <Card.Img variant="top" src="https://placeholder.com//100x180" />
      <Card.Body>
        <Card.Title>{props.cardTitle}</Card.Title>
        <Card.Text>
          Some quick example text to build on the card title and make up the
          bulk of the card's content.
        </Card.Text>
        <Button variant="primary">{props.buttonText}</Button>
      </Card.Body>
    </Card>
  );
}

export default BasicExample;
