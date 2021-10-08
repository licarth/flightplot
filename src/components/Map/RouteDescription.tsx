import { Button } from "antd";
import { createPortal } from "react-dom";
import { Rnd } from "react-rnd";
import styled from "styled-components";
import { Route } from "../../domain";
import { NavigationLog } from "./NavigationLog";

const RouteDescriptionContainer = styled.div`
  background-color: white;
  z-index: 1000;
  /* position: fixed; */
  /* padding: 20px; */
  /* top: 50px;
  right: 50px;
  height: 600px;
  width: 80%; */
  /* max-width: 800px; */
  overflow-y: auto;
`;

export const RouteDescription = ({ route }: { route: Route }) => {
  const print = () => {
    window.print();
  };

  const printArea = window.document.getElementById("printArea");
  return (
    <Rnd
      default={{
        x: 0,
        y: 0,
        width: 320,
        height: 500,
      }}
      style={{ zIndex: 10000 }}
      enableResizing
    >
      <RouteDescriptionContainer>
        <Button onClick={print}>PRINT</Button>
        <NavigationLog route={route} />
        {printArea &&
          createPortal(<NavigationLog route={route} paperVersion />, printArea)}
      </RouteDescriptionContainer>
    </Rnd>
  );
};
