import { Layout } from "antd";
import React, { useState } from "react";
import { LayerEnum } from "./components/layer/Layer";
import { LeftMenu } from "./components/LeftMenu";
import { LeafletMap } from "./components/Map/LeafletMap";
import { PrintContent } from "./components/Map/PrintContent";
const { Sider } = Layout;

export type DisplayedLayers = {
  [keys in LayerEnum]: boolean;
};

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [displayedLayers, setDisplayedLayers] = useState<DisplayedLayers>({
    icao: true,
    open_street_map: false,
  });

  return (
    <>
      <Layout id="app" style={{ minHeight: "100vh" }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <LeftMenu
            displayedLayers={displayedLayers}
            setLayer={({ layer, displayed }) =>
              setDisplayedLayers({ ...displayedLayers, [layer]: displayed })
            }
          />
        </Sider>
        <LeafletMap
          displayedLayers={displayedLayers}
        />
      </Layout>
      <PrintContent>
        <div id="printArea"></div>
      </PrintContent>
    </>
  );
};

export default App;
