import Accordion from "react-bootstrap/Accordion";
import Player from "./Player";
import { VideoProps } from "../interfaces/VideoProps";

function VideoAccordion(props: VideoProps) {
  return (
    <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0">
        <Accordion.Header>Video</Accordion.Header>
        <Accordion.Body>
          <Player
            videoSrc={props.videoSrc}
            videoRef={props.videoRef}
            onTimeUpdate={props.onTimeUpdate}
            isPaused={props.isPaused}
            trajectoryData={props.trajectoryData}
          ></Player>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}
export default VideoAccordion;
