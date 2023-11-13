import { CalloutProps } from "../interfaces/Callout";
import "../styles/Callout.css";

function Callout(props: CalloutProps) {
  return (
    <foreignObject
      width={props.width}
      height={props.height}
      transform={props.transform}
    >
      <div className="callout-wrapper">
        <p className="callout-content">{props.child}</p>
      </div>
    </foreignObject>
  );
}

export default Callout;
