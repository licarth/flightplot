import { pipe } from "fp-ts/lib/function";
import { useCallback } from "react";
import styled from "styled-components";
import { AiracData } from "ts-aerodata-france";
import { Route } from "../../domain";
import { useRoute } from "../useRoute";
import { RouteWaypoints } from "./RouteWaypoints";

const ContainerDiv = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const LeftMenu = ({ airacData }: { airacData: AiracData }) => {
  return (
    <ContainerDiv>
      <RouteDisplay airacData={airacData} />
      {/* @ts-ignore */}
    </ContainerDiv>
  );
};

const RouteDisplay = ({ airacData }: { airacData: AiracData }) => {
  const { route } = useRoute();

  const saveRoute = useCallback(() => {
    window.localStorage.setItem(
      "route",
      pipe(Route.codec(airacData).encode(route), JSON.stringify),
    );
  }, [route, airacData]);

  return (
    <RouteContainer>
      <H2>ROUTE</H2>
      <RouteWaypoints />
      <hr />
      <Tips />
      <hr />
      <H2>IMPRIMER</H2>
      <div>
        <label htmlFor="print-navlog">Log de Navigation</label>
        <input type="checkbox" disabled checked id="print-navlog" />
      </div>
      <div>
        <label htmlFor="print-vertical-profile">Profile Vertical</label>
        <input type="checkbox" disabled checked id="print-vertical-profile" />
      </div>
      <div>
        <label htmlFor="print-map">Carte 1 / 500 000 ème (soon)</label>
        <input type="checkbox" disabled id="print-map" />
      </div>{" "}
      <button onClick={() => window.print()}>Imprimer</button>
      <button onClick={saveRoute}>Sauver la route</button>
      <hr />
    </RouteContainer>
  );
};

const RouteContainer = styled.div`
  margin: 10px;
  border: 1px black;
`;

const H2 = styled.h2`
  text-align: center;
  background: #002e94;
  color: white;
`;

const Tips = () => (
  <TipsContainer>
    <H2>TIPS</H2>
    <ul>
      <li>❌ Faites un click droit sur un waypoint pour éditer son nom</li>
      <li>🖨️ Imprimez votre log de navigation avec le menu ci-dessous 👇️</li>
    </ul>
  </TipsContainer>
);

const TipsContainer = styled.div`
  ul {
    list-style: none;
    margin-left: 0;
    padding-left: 0;
  }

  li {
    padding-left: 1em;
    text-indent: -1em;
  }

  li:before {
    content: "->";
    padding-right: 5px;
  }
`;
