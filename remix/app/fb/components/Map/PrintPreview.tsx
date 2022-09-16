import { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { Route } from '../../../domain';
import type { PageFormat } from '../../../domain/PageFormat';
import type { PrintArea } from '../../../domain/PrintArea';
import { usePrint } from '../PrintContext';
import { useRoute } from '../useRoute';
import { VerticalProfileChartWithHook } from '../VerticalProfileChart';
import { NavigationLog } from './NavigationLog';
import { RouteSvg } from './RouteSvg';

const A4paper = { longMm: 296.98, shortMm: 210 };

export const PrintPreview = () => {
    const { route } = useRoute();
    const { printElements } = usePrint();

    return route ? (
        <PageDisplay>
            {printElements.navLog && (
                <Page>
                    {route.splitOnTouchAndGos().map((r, i) => (
                        <NavigationLog key={`navlog-${i}`} route={r} paperVersion />
                    ))}
                </Page>
            )}
            {route && printElements.verticalProfile && (
                <Page singlePage landscape avoidBreakInside>
                    <VerticalProfileChartWithHook />
                </Page>
            )}
            {printElements.charts &&
                route.printAreas &&
                route.printAreas.map((printArea, i) => (
                    <PrintedMapPage key={`print-area-${i}`} printArea={printArea} route={route} />
                ))}
        </PageDisplay>
    ) : (
        <></>
    );
};

const PrintedMapPage = ({ route, printArea }: { route: Route; printArea: PrintArea }) => {
    const { pageFormat: format } = printArea;
    return (
        <Page singlePage landscape={format.dxMillimeters > format.dyMillimeters}>
            <OaciMapContainer format={format}>
                {/* <IgnMap printArea={newLocal} /> */}
                <IgnMap printArea={printArea} />
                <StyledRouteSvg viewBox={`0 0 ${format.dxMillimeters} ${format.dyMillimeters}`}>
                    <RouteSvg route={route} printArea={printArea} />
                </StyledRouteSvg>
            </OaciMapContainer>
        </Page>
    );
};

const IgnMap = ({ printArea }: { printArea: PrintArea }) => {
    const { pageFormat: format, bottomLeft } = printArea;
    const { setChartsLoading } = usePrint();
    const [imageBlob, setImageBlob] = useState<string>();
    useEffect(() => {
        if (bottomLeft) {
            setChartsLoading(true);
            console.log('fetching map');
            fetch(
                `https://flightplot.fly.dev/${format.dxMillimeters}x${format.dyMillimeters}/${bottomLeft.lat},${bottomLeft.lng}`,
                {},
            )
                .then((response) => {
                    return response.blob().then((blob) => {
                        const objectURL = URL.createObjectURL(blob);
                        setImageBlob(objectURL);
                    });
                })
                .finally(() => {
                    setChartsLoading(false);
                })
                .catch((err) => console.error(err));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bottomLeft.lat, bottomLeft.lng, format.dxMillimeters, format.dyMillimeters]);
    return <StyledImage src={imageBlob} />;
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

const OaciMapContainer = styled.div<{
    format: PageFormat;
}>`
    position: absolute;
    overflow: hidden;
    width: 100%;
    height: 100%;
    break-inside: avoid;
`;

const StyledImage = styled.img`
    position: absolute;
    overflow: hidden;
    width: 100%;
    height: 100%;
    opacity: 0.9;
`;

const StyledRouteSvg = styled.svg`
    position: absolute;
    width: 100%;
    height: 100%;
    break-inside: avoid;
`;

const Page = styled.div<{
    padding?: number;
    margin?: number;
    landscape?: boolean;
    avoidBreakInside?: boolean;
    singlePage?: boolean;
}>`
    width: ${({ landscape }) => pageWidth(landscape)}mm;
    height: ${({ singlePage, landscape }) => singlePage && pageHeight(landscape)}mm;
    ${({ avoidBreakInside }) => avoidBreakInside && 'break-inside: avoid;'}
    padding: ${({ padding }) => padding || 0}cm;
    page-break-after: always;
    @media print {
        @page {
            size: A4;
        }
    }
    ${({ landscape }) =>
        landscape &&
        `
    transform: rotate(90deg);
    transform-origin: 10.5cm 10.5cm;
  `}
`;

const pageWidth = (landscape?: boolean) => {
    return landscape ? A4paper.longMm : A4paper.shortMm;
};

const pageHeight = (landscape?: boolean) => {
    return landscape ? A4paper.shortMm : A4paper.longMm;
};
