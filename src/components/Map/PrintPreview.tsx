import styled from "styled-components";
import { AiracData } from "ts-aerodata-france";
import { useRoute } from "../useRoute";
import { VerticalProfileChart } from "../VerticalProfileChart";
import { NavigationLog } from "./NavigationLog";

export const PrintPreview = ({ airacData }: { airacData: AiracData }) => {
  const { route } = useRoute();
  return (
    <PageDisplay>
      <Page padding={0.5}>
        <NavigationLog route={route} paperVersion />
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
    /* background: rgb(204, 204, 204); */
    /* position: absolute;
    top: 0; */
    /* left: 500px; */
    /* height: 100%; */
    /* overflow-y: scroll; */
    z-index: 1000000;
  }

  --leftcol-width: 5cm;
  --background-color: darkslateblue;

  @page {
    size: A4;
    margin: 0;
  }
`;

const TiltedChart = styled.div`
  width: 297mm;
  height: 210mm;
  transform: rotate(90deg);
  transform-origin: 10.5cm 10.5cm;
`;

const Page = styled.div<{
  padding?: number;
  landscape?: boolean;
}>`
  width: ${({ landscape }) => (landscape ? 297 : 210)}mm;
  height: ${({ landscape }) => (landscape ? 210 : 297)}mm;
  padding: ${({ padding }) => padding || 0}cm;

  @page {
    size: A4 ${({ landscape }) => (landscape ? "landscape" : "")};
    margin: 0;
  }

  @media screen {
    background: white;
    display: block;
    margin: 0 auto;
    margin-bottom: 0.5cm;
    box-shadow: 0 0 0.5cm rgba(136, 136, 136, 0.5);
  }

  .section:not(:last-child) {
    margin-bottom: 5mm;
  }
`;
