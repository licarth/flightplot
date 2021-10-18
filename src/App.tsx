import { useEffect, useState } from "react";
import styled from "styled-components";
import { AiracCycles, AiracData } from "ts-aerodata-france";
import { LayerEnum } from "./components/layer/Layer";
import { LeafletMap } from "./components/Map/LeafletMap";
import { PrintContent } from "./components/Map/PrintContent";
import { PrintPreview } from "./components/Map/PrintPreview";
import { RouteProvider } from "./components/RouteContext";

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

  const [airacData, setAiracData] = useState<AiracData>();

  useEffect(() => {
    setAiracData(AiracData.loadCycle(AiracCycles.NOV_04_2021));
  }, []);

  return (
    <RouteProvider>
      <div id="modal-root"></div>
      <AppContainer id="app" disabled={disabled}>
        {airacData && (
          <LeafletMap displayedLayers={displayedLayers} airacData={airacData} />
        )}
      </AppContainer>
      <PrintContent>
      </PrintContent>
      {airacData && <PrintPreview airacData={airacData} />}
    </RouteProvider>
  );
};

export default App;
