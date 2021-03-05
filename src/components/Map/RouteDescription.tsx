import { Input } from "antd";
import styled from "styled-components";
import { Route } from "../../domain";

const RouteDescriptionContainer = styled.div`
  background-color: white;
  z-index: 1000;
  position: fixed;
  padding: 20px;
  top: 50px;
  right: 50px;
  height: 600px;
  width: 300px;
  /* display: flex;
  flex-direction: column; */

  /* No normal bullets please */
  ul {
    list-style-type: none;
  }

  li {
    /* You need to turn on relative positioning so the line is placed relative to the item rather than absolutely on the page */
    position: relative;

    /* Use padding to space things out rather than margins as the line would get broken up otherwise */
    margin: 0;
    padding-bottom: 1em;
    padding-left: 20px;
  }

  /* The actual line being placed before each list item, tweak width and color as appropriate */
  li:before {
    background-color: #c00;
    width: 2px;
    content: "";
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 5px;
  }

  /* Small bullets for normal list items */
  li::after {
    content: "";
    position: absolute;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' viewBox='0 0 32 32' focusable='false'%3E%3Ccircle stroke='none' fill='%23c00' cx='16' cy='16' r='10'%3E%3C/circle%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: contain;
    left: 0;
    top: 2px;
    width: 12px;
    height: 12px;
  }

  /* Large bullet for the first list item */
  li:first-child::after,
  li:last-child::after {
    content: "";
    width: 16px;
    height: 16px;
    left: -2px;
    top: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' viewBox='0 0 32 32' focusable='false'%3E%3Cpath d='M16 4c6.6 0 12 5.4 12 12s-5.4 12-12 12S4 22.6 4 16 9.4 4 16 4zm0-4C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0z' fill='%23c00'%3E%3C/path%3E%3Ccircle fill='%23c00' cx='16' cy='16' r='6'%3E%3C/circle%3E%3C/svg%3E");
  }

  /* Start the line further down on the first list item */
  li:first-child:before {
    top: 15px;
  }

  /* Stop the line short on the final list item */
  li:last-child:before {
    height: 6px;
  }
`;

export const RouteDescription = ({ route }: { route: Route }) => {
  return (
    <RouteDescriptionContainer>
      <div>
        <ul>
          {route.waypoints.map((wp, i) => (
            <li>
              {i} {wp.name}
            </li>
          ))}
        </ul>
      </div>
      <Input autoFocus={true} placeholder={"LFMT"} />
    </RouteDescriptionContainer>
  );
};
