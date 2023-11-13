import { useEffect, useRef, useState } from "react";
import "./App.css";
import "./Styles/bottomrow.css";
import TimeLine from "./components/TimeLine";
import {
  traverseTrajectoriesXMLDocument,
  traverseInterpolatedFormations,
  traverseTransformedTrajectoriesXMLDocument,
} from "./services/FileService";
import { Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import VideoAccordion from "./components/VideoAccordionComponent";
import TopNavbar from "./components/TopNavbar";
import CoordinateSystem from "./components/CoordinateSystem";
import Sidebar from "./components/Sidebar";

function App() {
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoLength = 82;
  const [trajectoryData, setTrajectoryData] = useState<number[][][]>([]);
  const [transformedTrajectoryData, setTransformedTrajectoryData] = useState<
    number[][][]
  >([]);
  const [formationData, setFormationData] = useState<number[][][]>([]);
  const [selectedDancer, setSelectedDancer] = useState<number[]>([1]);

  useEffect(() => {
    traverseTrajectoriesXMLDocument("src/assets/trajectories.xml").then(
      (data) => {
        // console.log("traj:", data);
        setTrajectoryData(data);
      }
    );
    traverseTransformedTrajectoriesXMLDocument(
      "src/assets/2transformedTrajectories.xml"
    ).then((data) => {
      setTransformedTrajectoryData(data);
    });
    traverseInterpolatedFormations(
      "src/assets/2interpolatedFormations.xml"
    ).then((data) => {
      // console.log("interform:", data);
      setFormationData(data);
    });
  }, []);

  const handleVideoTimeChange = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentVideoTime(newTime);
  };

  if (videoRef.current) {
    videoRef.current.addEventListener("play", () => {
      setIsPaused(false);
    });

    videoRef.current.addEventListener("pause", () => {
      setIsPaused(true);
    });
  }

  return (
    <>
      <TopNavbar></TopNavbar>
      <Container fluid>
        <Row className="mb-5">
          <Sidebar />
          <Col xxl={6} xl={6} lg={7} className="mt-3">
            <CoordinateSystem
              transformedTrajectoryData={transformedTrajectoryData}
              formationData={formationData}
              currentTime={currentVideoTime}
              selectedDancer={selectedDancer}
              setSelectedDancer={setSelectedDancer}
            />
          </Col>
          <Col xxl={5} xl={6} lg={7} className="mt-3">
            <VideoAccordion
              videoSrc="/src/assets/2ludw_cut.mp4"
              videoRef={videoRef}
              onTimeUpdate={setCurrentVideoTime}
              isPaused={isPaused}
              trajectoryData={trajectoryData}
            ></VideoAccordion>
          </Col>
        </Row>
        <Row className="mt-5">
          <TimeLine
            width={1300}
            height={150}
            radius={20}
            padding={50}
            currentTime={currentVideoTime}
            onTimeChange={handleVideoTimeChange}
            videoRef={videoRef}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            videoLength={videoLength}
            transformedTrajectoryData={transformedTrajectoryData}
            formationData={formationData}
            selectedDancer={selectedDancer}
          ></TimeLine>
        </Row>
      </Container>
    </>
  );
}

export default App;
