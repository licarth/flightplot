import { Map } from "leaflet";
//@ts-ignore
import L from "leaflet-path-transform";

export const setDraggableRectangle = ({ map }: { map: Map }) => {
  // const polygonRef = createRef<Polygon>();
  // const [topLeft, setTopLeft] = useState<LatLngTuple>([43.88, 3.5]);
  // const [bottomRight, setBottomRight] = useState<LatLngTuple>([43.15, 4.2]);
  const topLeft = [43.88, 3.5];
  const bottomRight = [43.15, 4.2];
  const bounds = [topLeft, bottomRight];

  const polygon = L.polygon(bounds, { transform: true }).addTo(map);

  polygon.transform.enable();
  // or partially:
  polygon.transform.enable({ rotation: true, scaling: false });
  // or, on an already enabled handler:
  polygon.transform.setOptions({ rotation: true, scaling: false });

  return null;
};
