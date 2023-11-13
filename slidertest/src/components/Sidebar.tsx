import { Button, Col, Container, Navbar, Row, Stack, ToggleButton } from 'react-bootstrap';
import { Bezier2, BoundingBoxCircles, Calendar3 } from 'react-bootstrap-icons';
import Nav from 'react-bootstrap/Nav';
function Sidebar(){


    return(
        <>
        <Col lg={1} className="no-padding-left" style={{background:"#212529"}}>
          <Stack
            direction="vertical"
            gap={2}
            className="vertical-toolbar not-for-mobile"
          >
            <ToggleButton
              type="checkbox"
              id="toggleCheckHeatmap"
              variant="light"
              className="ms-3 me-3 mt-5"
              value="1"

              title={
                "lol"
              }
            >
              <Calendar3 />
              <p className="not-for-smaller-desktop no-margin-bottom">Analysis</p>
            </ToggleButton>
  
            <ToggleButton
              type="checkbox"
              id="toggleCheckShapes"
              variant="light"
              className="ms-3 me-3"
              value="1"
              title="lol2"
            >
              <BoundingBoxCircles /> <br />{" "}
              <p className="not-for-smaller-desktop no-margin-bottom">Shapes</p>
            </ToggleButton>
  
            <ToggleButton
              type="checkbox"
              id="toggleCheckTransitions"
              variant="light"
              className=" ms-3 me-3"
              value="1"
              title="lol3"
            >
              <Bezier2 /> <br />{" "}
              <p className="not-for-smaller-desktop no-margin-bottom">
                Transitions
              </p>
            </ToggleButton>

          </Stack>
        </Col>
      </>
        
    
    );
    
}
export default Sidebar;