import { SendOutlined } from "@ant-design/icons";
import { Menu, Switch } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import React from "react";
import { LayerEnum } from "./layer/Layer";

type LeftMenuProps = {
  displayLFMT: boolean;
  setDisplayLFMT: (displayLFMT: boolean) => void;
  flightPlanningMode: boolean;
  setFlightPlanningMode: (flightPlanningMode: boolean) => void;
  displayedLayers: {
    [keys in LayerEnum]: boolean;
  };
  setLayer: ({
    layer,
    displayed,
  }: {
    layer: string;
    displayed: boolean;
  }) => void;
};

enum MENU_KEYS {
  MAP = "sub-map",
  VAC = "sub-vac",
  FLIGHTS = "sub-flights",
}

export const LeftMenu = ({
  displayLFMT,
  setDisplayLFMT,
  displayedLayers,
  setLayer,
  flightPlanningMode,
  setFlightPlanningMode,
}: LeftMenuProps) => {
  const _setLayer = (layer: LayerEnum) => (displayed: boolean) => {
    setLayer({ layer, displayed });
  };
  const layerMenuItem = (title: string, layer: LayerEnum) => (
    <Menu.Item
      key={layer}
      onClick={() => _setLayer(layer)(!displayedLayers[layer])}
    >
      <Switch
        title={title}
        onChange={_setLayer(layer)}
        checked={displayedLayers[layer]}
      />{" "}
      {title}
    </Menu.Item>
  );

  return (
    <Menu
      multiple={true}
      theme="dark"
      selectedKeys={[]}
      defaultOpenKeys={[MENU_KEYS.FLIGHTS, MENU_KEYS.MAP, MENU_KEYS.VAC]}
      mode="inline"
    >
      <SubMenu key={MENU_KEYS.MAP} icon={<SendOutlined />} title="Modes">
        <Menu.Item onClick={() => setFlightPlanningMode(!flightPlanningMode)}>
          Planning{" "}
          <Switch
            title="Flight Planning"
            onChange={setFlightPlanningMode}
            checked={flightPlanningMode}
          />{" "}
        </Menu.Item>
      </SubMenu>
      <SubMenu key={MENU_KEYS.MAP} icon={<SendOutlined />} title="Map layers">
        {layerMenuItem("ICAO", LayerEnum.ICAO)}
        {layerMenuItem("Open Street Map", LayerEnum.OPEN_STREET_MAP)}
      </SubMenu>
      <SubMenu key={MENU_KEYS.VAC} icon={<SendOutlined />} title="VAC Charts">
        <Menu.Item onClick={() => setDisplayLFMT(!displayLFMT)}>
          LFMT VAC{" "}
          <Switch
            title="LFMT VAC"
            onChange={setDisplayLFMT}
            checked={displayLFMT}
          />
        </Menu.Item>
      </SubMenu>
      <SubMenu key={MENU_KEYS.FLIGHTS} icon={<SendOutlined />} title="Flights">
        <Menu.Item>22.10.2020</Menu.Item>
        <Menu.Item>24.10.2020</Menu.Item>
      </SubMenu>
    </Menu>
  );
};
