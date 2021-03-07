import styled from "styled-components";
import { Route } from "../../domain";

export const NavigationLog = ({ route }: { route: Route }) => (
  <NavlogContainer>
    <LegTable>
      <HeaderRow>
        <LegHeader>Altitude</LegHeader>
        <LegHeader>Rm</LegHeader>
        <LegHeader>Dist</LegHeader>
        <LegHeader>TSV</LegHeader>
        <WaypointCell>Heure Réelle</WaypointCell>
        <WaypointCell>Heure Estimée</WaypointCell>
        <WaypointCell>Report</WaypointCell>
      </HeaderRow>
      {route.legs.length > 0 && (
        <Row>
          <BlackCell></BlackCell>
          <BlackCell></BlackCell>
          <BlackCell></BlackCell>
          <BlackCell></BlackCell>
          <WaypointCell></WaypointCell>
          <BlackCell></BlackCell>
          <WaypointCell>{route.legs[0].departureWaypoint.name}</WaypointCell>
        </Row>
      )}
      {route.legs.map(
        ({
          arrivalWaypoint: { name },
          trueHdg,
          distanceInNm,
          durationInMinutes,
        }) => (
          <Row>
            <LegCell>...... ft</LegCell>
            <LegCell>{Math.round(trueHdg)}°T</LegCell>
            <LegCell>{Math.round(distanceInNm)} NM</LegCell>
            <LegCell>{Math.round(durationInMinutes)} min</LegCell>
            <WaypointCell></WaypointCell>
            <EmptyCell></EmptyCell>
            <WaypointCell>{name}</WaypointCell>
          </Row>
        ),
      )}
    </LegTable>
  </NavlogContainer>
);

const NavlogContainer = styled.div`
  width: 100%;
  margin: 0;
`;

const LegTable = styled.div`
  display: flex;
  flex-direction: column;
  @media print {
    width: 20cm;
    border-width: 0.6mm;
  }
  background-color: black;
`;

const HeaderRow = styled.div`
  z-index: 100;
  width: 100%;
  display: flex;
  height: 1cm;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  height: 2cm;
`;

const cell = styled.span`
  border-top: solid;
  border-left: solid;
  /* flex-grow: 1; */
  width: ${100 / 7}%;
  background-color: white;
  height: 100%;
  white-space: no-wrap;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  @media print {
    border-width: 0.05cm;
  }
`;

const LegCell = styled(cell)`
  transform: translateY(-1cm);
`;

const WaypointCell = styled(cell)`
  @media print {
    border-width: 0.05cm;
  }
`;

const BlackCell = styled(cell)`
  background-color: black;
`;

const EmptyCell = styled(cell)``;

const LegHeader = styled(cell)`
  transform: none;
`;
