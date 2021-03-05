import { IconProp, library } from "@fortawesome/fontawesome-svg-core";
import * as Icons from "@fortawesome/free-solid-svg-icons";
// import { faPlaneArrival } from "@fortawesome/free-solid-svg-icons/faPlaneArrival";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// FontAwesome requirements
import Leaflet, { Point } from "leaflet";
import { renderToString } from "react-dom/server";
import styled from "styled-components";

const IconContainer = styled.div`
  display: flex;
  align-content: center;
  justify-content: center;
`;

const icon = (iconName: IconProp) => {
  //@ts-ignore
  library.add(Icons[`fa${pascalize(iconName)}`]);

  return new Leaflet.DivIcon({
    html: renderToString(
      <IconContainer>
        <FontAwesomeIcon
          icon={iconName}
          style={{ width: "100%", height: "100%" }}
        />
      </IconContainer>,
    ),
    iconSize: new Point(25, 25),
    className: "marker-icon",
  });
};

export const planeDeparture = icon("plane-departure");
export const planeArrival = icon("plane-arrival");
export const circle = icon("circle");

function pascalize(str: string) {
  let arr = str.split("-");
  let capital = arr.map(
    (item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase(),
  );
  // ^-- change here.
  let capitalString = capital.join("");

  return capitalString;
}
