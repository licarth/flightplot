import "./firebaseConfig";
import { useState } from "react";
import styled from "styled-components";
import { AiracDataProvider } from "./components/AiracDataContext";
import { LayerEnum } from "./components/layer/Layer";
import { DisplayedContent } from "./components/Map/DisplayedContent";
import { PrintContent } from "./components/Map/PrintContent";
import { PrintPreview } from "./components/Map/PrintPreview";
import { RouteProvider } from "./components/RouteContext";
import { UserRoutesProvider } from "./components/UserRoutesContext";
import { FirebaseAuthProvider } from "./firebase/auth/FirebaseAuthContext";

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

  return (
    <FirebaseAuthProvider>
      <AiracDataProvider>
        <UserRoutesProvider>
          <RouteProvider>
            <div id="modal-root"></div>
            <AppContainer id="app" disabled={disabled}>
              <DisplayedContent displayedLayers={displayedLayers} />
            </AppContainer>
            <PrintContent>{""}</PrintContent>
            <PrintPreview />
          </RouteProvider>
        </UserRoutesProvider>
      </AiracDataProvider>
    </FirebaseAuthProvider>
  );
};

export default App;
