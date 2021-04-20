import { SendOutlined } from "@ant-design/icons";
import { Menu, Switch } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import { LayerEnum } from "./layer/Layer";

type LeftMenuProps = {
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

export const LeftMenu = ({ displayedLayers, setLayer }: LeftMenuProps) => {
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
      <SubMenu key={MENU_KEYS.MAP} icon={<SendOutlined />} title="Map layers">
        {layerMenuItem("ICAO", LayerEnum.ICAO)}
        {layerMenuItem("Open Street Map", LayerEnum.OPEN_STREET_MAP)}
      </SubMenu>
    </Menu>
  );
};
