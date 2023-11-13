import { SelectProps } from "../interfaces/Toolbar";
import "../styles/Toolbar.css";

function Select(props: SelectProps) {
  return (
    <select
      onChange={props.onChange}
      value={props.value}
      className={
        "form-select mb-3 " +
        (!props.renderOnAllDevices
          ? "ms-3 shortened-select not-for-smaller-desktop"
          : "me-3")
      }
    >
      {props.options.map(({ value, label, key }) => (
        <option value={value} key={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

export default Select;
