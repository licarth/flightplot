import styled from "styled-components";
import { AiracData } from "ts-aerodata-france";
import { useRoute } from "../useRoute";
import { VerticalProfileChart } from "../VerticalProfileChart";
import { NavigationLog } from "./NavigationLog";

export const PrintPreview = ({ airacData }: { airacData: AiracData }) => {
  const { route } = useRoute();
  return (
    <PageDisplay>
      <Page>
        {route.splitOnTouchAndGos().map((r, i) => (
          <NavigationLog key={`navlog-${i}`} route={r} paperVersion />
        ))}
      </Page>
      <Page>
        <TiltedChart>
          <VerticalProfileChart airacData={airacData} />
        </TiltedChart>
      </Page>
    </PageDisplay>
  );
};

const PageDisplay = styled.div`
  @media screen {
    position: absolute;
    visibility: hidden;
    overflow: hidden;
    width: 0px;
    height: 0px;
  }
`;

const TiltedChart = styled.div`
  width: 297mm;
  height: 210mm;
  transform: rotate(90deg);
  transform-origin: 10.5cm 10.5cm;
  break-inside: avoid;
`;

const Page = styled.div<{
  padding?: number;
  landscape?: boolean;
}>`
  width: ${({ landscape }) => (landscape ? 297 : 210)}mm;
  padding: ${({ padding }) => padding || 0}cm;
  page-break-after: always;
`;
