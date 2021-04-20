import { LeafletMouseEvent } from "leaflet";

export const preventDefault = (e: LeafletMouseEvent) => {
  e.originalEvent.stopPropagation();
  e.originalEvent.preventDefault();
  //@ts-ignore
  e.originalEvent.view?.L?.DomEvent.stopPropagation(e);
};
