import { Layout } from "antd";
import React, { useState } from "react";
import { LayerEnum } from "./components/layer/Layer";
import { LeafletMap } from "./components/Map/LeafletMap";
import { LeftMenu } from "./components/LeftMenu";
const { Sider } = Layout;

export type DisplayedLayers = {
  [keys in LayerEnum]: boolean;
};

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [displayLFMT, setDisplayLFMT] = useState(false);
  const [flightPlanningMode, setFlightPlanningMode] = useState(false);

  const [displayedLayers, setDisplayedLayers] = useState<DisplayedLayers>({
    icao: true,
    open_street_map: false,
  });

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <LeftMenu
          displayLFMT={displayLFMT}
          setDisplayLFMT={setDisplayLFMT}
          displayedLayers={displayedLayers}
          setLayer={({ layer, displayed }) =>
            setDisplayedLayers({ ...displayedLayers, [layer]: displayed })
          }
          flightPlanningMode={flightPlanningMode}
          setFlightPlanningMode={setFlightPlanningMode}
        />
      </Sider>
      <LeafletMap displayLFMT={displayLFMT} displayedLayers={displayedLayers} flightPlanningMode={flightPlanningMode} />
    </Layout>
  );
};

export default App;
