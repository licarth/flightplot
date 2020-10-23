//@ts-ignore
import React, { Component } from "react";
import { ContextProps, withLeaflet } from "react-leaflet";
// import * as Leaflet from "leaflet";
import Locate from "leaflet.locatecontrol";

type Props = { startDirectly: boolean };

class LocateControl extends Component<Props, {}> {
  componentDidMount() {
    //@ts-ignore
    const { options, startDirectly } = this.props;
    //@ts-ignore
    const { map } = this.props.leaflet;

    const locateOptions = {
      position: "topright",
      strings: {
        title: "Show me where I am, yo!",
      },
      onActivate: () => {}, // callback before engine starts retrieving locations
    };
    //@ts-ignore
    const lc = new Locate(locateOptions);

    lc.addTo(map);

    if (startDirectly) {
      // request location update and set location
      lc.start();
    }
  }

  render() {
    return null;
  }
}

export default withLeaflet<Props & ContextProps>(LocateControl);
