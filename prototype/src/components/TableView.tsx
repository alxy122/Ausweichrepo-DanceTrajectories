import { Table } from "react-bootstrap";
import { DanceCouple } from "../interfaces/Choreography";
import { TableViewProps } from "../interfaces/TableView";

function TableView(props: TableViewProps) {
  function table() {
    if (props.pattern.positions[0].position.length === 1) {
      return (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Side</th>
              <th>Depth</th>
            </tr>
          </thead>
          <tbody>
            {props.pattern.positions.map((danceCouple: DanceCouple) => (
              <tr key={`${danceCouple.id}`}>
                <td>{danceCouple.id}</td>
                <td>{danceCouple.position[0].x}</td>
                <td>{danceCouple.position[0].y}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      );
    }

    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th rowSpan={2}>ID</th>
            <th colSpan={2}>Gentlemen</th>
            <th colSpan={2}>Ladies</th>
          </tr>
          <tr key={"header-2-row"}>
            <th>Side</th>
            <th>Depth</th>
            <th>Side</th>
            <th>Depth</th>
          </tr>
        </thead>
        <tbody>
          {props.pattern.positions.map((danceCouple: DanceCouple) => (
            <tr key={`${danceCouple.id}`}>
              <td>{danceCouple.id}</td>
              <td>{danceCouple.position[0].x}</td>
              <td>{danceCouple.position[0].y}</td>
              <td>{danceCouple.position[1].x}</td>
              <td>{danceCouple.position[1].y}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  return <div>{table()}</div>;
}

export default TableView;
