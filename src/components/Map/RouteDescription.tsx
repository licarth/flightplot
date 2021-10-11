import { createPortal } from "react-dom";
import { Rnd } from "react-rnd";
import styled from "styled-components";
import { Route } from "../../domain";
import { NavigationLog } from "./NavigationLog";

const RouteDescriptionContainer = styled.div`
  background-color: white;
  z-index: 1000;
  height: 100%;
  width: 100%;
  overflow-y: auto;
`;

export const RouteDescription = ({ route }: { route: Route }) => {
  const print = () => {
    window.print();
  };

  const printArea = window.document.getElementById("printArea");
  return (
    <Rnd
      style={{ zIndex: 10000 }}
      enableResizing
      default={{ x: 10, y: 500, height: 100, width: 100 }}
    >
      <RouteDescriptionContainer>
        <button onClick={print}>PRINT</button>
        <NavigationLog route={route} />
        {printArea &&
          createPortal(<NavigationLog route={route} paperVersion />, printArea)}
      </RouteDescriptionContainer>
    </Rnd>
  );
};
