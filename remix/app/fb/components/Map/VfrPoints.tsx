import CheapRuler from 'cheap-ruler';
import { Fragment, memo, useMemo } from 'react';
import { Pane, Polygon, SVGOverlay, Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import type { VfrPoint } from 'ts-aerodata-france';
import { toCheapRulerPoint } from '~/domain/toCheapRulerPoint';
import { fromtTurfPoint, toLeafletLatLng } from '../../../domain';
import { useAiracData } from '../useAiracData';
import { boxAround } from './boxAround';
import type { MapBounds } from './DisplayedContent';
import { isVfrPoint } from './FixtureDetails';
import type { FocusableFixture } from './FixtureFocusContext';
import { useFixtureFocus } from './FixtureFocusContext';
import { Z_INDEX_VFR_NAMES } from './zIndex';

export const VfrPoints = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData, loading } = useAiracData();
    const { highlightedFixture } = useFixtureFocus();
    const vfrPointsInBbox = useMemo(
        () => airacData?.getVfrPointsInBbox(...mapBounds),
        [airacData, mapBounds],
    );

    let components: JSX.Element[] | undefined = [];
    if (mapBounds && !loading) {
        components = vfrPointsInBbox?.map((vfrPoint) => (
            <VfrPointC
                key={`vfr-point-${vfrPoint.icaoCode}/${vfrPoint.name}`}
                vfrPoint={vfrPoint}
                highlightedFixture={highlightedFixture}
            />
        ));
    }
    return <>{components}</>;
};

const StyledPolygon = styled(Polygon)<{ $highlighted: boolean }>`
    ${({ $highlighted }) =>
        $highlighted && `filter:saturate(300%); filter: drop-shadow(3px 5px 1px rgb(0 0 0 / 0.4));`}
`;

const StyledTooltip = styled(Tooltip)<{ $highlighted: boolean }>`
    ${({ $highlighted }) => $highlighted && `filter: drop-shadow(3px 5px 1px rgb(0 0 0 / 0.4));`}

    background-color: transparent;
    box-shadow: unset;
    background-color: none;
    border: none;
    border-radius: none;
    color: ${({ $highlighted }) => ($highlighted ? 'red' : '#002e94')};
    /* -webkit-text-stroke: 0.5px white; */
    white-space: nowrap;
    text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
    text-align: left;
    margin: 0px;
    font-family: 'Folio XBd BT';
    font-style: bold;

    ::before {
        display: none;
    }
`;

export const VfrPointC = memo(function VfrPoint({
    vfrPoint,
    highlightedFixture,
}: {
    vfrPoint: VfrPoint;
    highlightedFixture?: FocusableFixture;
}) {
    const { name, latLng, icaoCode } = vfrPoint;
    const ruler = new CheapRuler(Number(latLng.lat), 'nauticalmiles');
    const center = toCheapRulerPoint(toLeafletLatLng(latLng));
    const bottomRight = fromtTurfPoint(ruler.offset(center, 0.5, -0.5));
    const top = fromtTurfPoint(ruler.offset(center, 0, 0.4));
    const left = fromtTurfPoint(ruler.offset(center, -0.35, -0.2));
    const right = fromtTurfPoint(ruler.offset(center, 0.35, -0.2));

    const bounds = boxAround(toCheapRulerPoint(bottomRight), 10);

    const shouldBeHighlighted =
        (highlightedFixture &&
            isVfrPoint(highlightedFixture) &&
            highlightedFixture?.name === vfrPoint.name &&
            highlightedFixture?.icaoCode === vfrPoint.icaoCode) ||
        false;
    return (
        <Fragment key={`${icaoCode}/${name}`}>
            {
                <div title={`${icaoCode}`}>
                    <SVGOverlay
                        attributes={{
                            stroke: 'red',
                            class: 'overflow-visible',
                        }}
                        bounds={bounds}
                        interactive={true}
                    >
                        <StyledPolygon
                            key={name + shouldBeHighlighted}
                            $highlighted={shouldBeHighlighted}
                            color={shouldBeHighlighted ? 'red' : '#002e94'}
                            positions={[top, left, right]}
                        />
                        <Polygon color="#002e94" positions={[right]}>
                            <Pane
                                name={`tooltip-wpt-${icaoCode}-${name}-${shouldBeHighlighted}`}
                                style={{ zIndex: Z_INDEX_VFR_NAMES }}
                            >
                                <StyledTooltip
                                    $highlighted={shouldBeHighlighted}
                                    key={`tooltip-wpt-${icaoCode}-${name}-${shouldBeHighlighted}`}
                                    permanent
                                    direction={'right'}
                                >
                                    {name}
                                </StyledTooltip>
                            </Pane>
                        </Polygon>
                    </SVGOverlay>
                </div>
            }
        </Fragment>
    );
});
