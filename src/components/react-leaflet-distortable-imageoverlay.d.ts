import { Component } from "react";

declare module "react-leaflet-distortable-imageoverlay";

type Props = {
  editMode: boolean;
};

export default interface ReactDistortableImageOverlay extends Component<Props> {}
