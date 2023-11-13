import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { PlayFill, PauseFill } from "react-bootstrap-icons";

interface Props{
  currentTime:number,
  setCurrentTime:(newTime: number) => void;
  padding:number
}

function NextFormationButton(props:Props){

  const [currentShapeNr, setShapeNr] = useState(0);

  function findClosestElement(arr: number[], target: number): number {
    if (arr.length === 0) return 0;

    var element = arr[0];
    arr.forEach(function (currentElement) {
      if (currentElement < target - props.padding) element = currentElement;
    });
    return element;
  }

  return (
    <Button variant="dark" onClick={togglePause}>
      {isPaused ? <PlayFill /> : <PauseFill />}
    </Button>
  );
};

export default PauseButton;
