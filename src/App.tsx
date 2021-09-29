import React, { useState } from "react";
import styled from "styled-components";
import { LayerEnum } from "./components/layer/Layer";
import { LeafletMap } from "./components/Map/LeafletMap";
import { PrintContent } from "./components/Map/PrintContent";

export type DisplayedLayers = {
  [keys in LayerEnum]: boolean;
};

type AppContainerProps = { disabled: boolean };

const AppContainer = styled.div<AppContainerProps>`
  filter: ${({ disabled }) => (disabled ? "blur(5px)" : "none")};
`;

const App = ({ disabled }: { disabled: boolean }) => {
  const [displayedLayers] = useState<DisplayedLayers>({
    icao: true,
    open_street_map: false,
  });

  return (
    <>
      <AppContainer id="app" disabled={disabled}>
        <LeafletMap displayedLayers={displayedLayers} />
      </AppContainer>
      <PrintContent>
        <div id="printArea"></div>
      </PrintContent>
    </>
  );
};

export default App;
