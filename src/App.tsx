import "./firebaseConfig";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { AiracCycles, AiracData } from "ts-aerodata-france";
import { LayerEnum } from "./components/layer/Layer";
import { DisplayedContent } from "./components/Map/DisplayedContent";
import { PrintContent } from "./components/Map/PrintContent";
import { PrintPreview } from "./components/Map/PrintPreview";
import { RouteProvider } from "./components/RouteContext";
import { FirebaseAuthProvider } from "./firebase/auth/FirebaseAuthContext";
import { UserRoutesProvider } from "./components/UserRoutesContext";
import { AiracDataProvider } from "./components/AiracDataContext";

export type DisplayedLayers = {
  [keys in LayerEnum]: boolean;
};

type AppContainerProps = { disabled: boolean };

const AppContainer = styled.div<AppContainerProps>`
  filter: ${({ disabled }) => (disabled ? "blur(5px)" : "none")};
  height: 100%;
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
    <FirebaseAuthProvider>
      <AiracDataProvider>
      <UserRoutesProvider>
        <RouteProvider>
          <div id="modal-root"></div>
          <AppContainer id="app" disabled={disabled}>
            {airacData && (
              <DisplayedContent
                displayedLayers={displayedLayers}
                airacData={airacData}
              />
            )}
          </AppContainer>
          <PrintContent>{""}</PrintContent>
          {airacData && <PrintPreview airacData={airacData} />}{" "}
        </RouteProvider>
      </UserRoutesProvider>
      </AiracDataProvider>
    </FirebaseAuthProvider>
  );
};

export default App;
