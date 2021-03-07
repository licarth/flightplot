import { Button } from "antd";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { Route } from "../../domain";
import { NavigationLog } from "./NavigationLog";

const RouteDescriptionContainer = styled.div`
  background-color: white;
  z-index: 1000;
  position: fixed;
  padding: 20px;
  top: 50px;
  right: 50px;
  height: 600px;
  width: 20%;
`;

export const RouteDescription = ({ route }: { route: Route }) => {
  const print = () => {
    // const newLocal = window.document.getElementById("printArea");
    // if (newLocal)
    //   newLocal.innerHTML = renderToString(<NavigationLog route={route} />);
    window.print();
  };

  const printArea = window.document.getElementById("printArea");
  return (
    <RouteDescriptionContainer>
      <Button onClick={print}>PRINT</Button>
      <NavigationLog route={route} />
      {printArea && createPortal(<NavigationLog route={route} />, printArea)}
    </RouteDescriptionContainer>
  );
};
