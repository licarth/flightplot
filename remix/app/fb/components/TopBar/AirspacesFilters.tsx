import { Button, Slider, Switch } from 'antd';
import type { SliderMarks } from 'antd/lib/slider';
import _ from 'lodash';
import type { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { Colors } from '../Map/Colors';
import { useFixtureFocus } from '../Map/FixtureFocusContext';
import type { DisplayedLayerProps } from '../Map/InnerMapContainer';
import { useMainMap } from '../Map/MainMapContext';
import { useSearchElement } from '../SearchItemContext';
import { useWeather } from '../WeatherContext';

const style = {
    fontSize: 12,
    fontFamily: 'Univers',
};

const MAX_CEILING = 120;

const marks: SliderMarks = {
    0: {
        style,
        label: 'SFC',
    },
    20: {
        style,
        label: '2000 ft.',
    },
    40: {
        style,
        label: '4000 ft.',
    },
    50: {
        style,
        label: '5000 ft.',
    },
    70: {
        style,
        label: 'FL070',
    },
    115: {
        style,
        label: 'FL115',
    },
    [MAX_CEILING]: {
        style,
        label: 'TOUS',
    },
};

export const AirspacesFilters = () => {
    const {
        setFilters,
        filters: {
            showAirspacesStartingBelowFL,
            displayModePerAirspaceType: { R, D, SIV },
        },
    } = useMainMap();

    const { clickedLocation } = useFixtureFocus();
    const { item } = useSearchElement();

    const { weatherEnabled, setWeatherEnabled } = useWeather();

    const formatter = (v: number): string =>
        v < MAX_CEILING
            ? marks[v]
                ? //@ts-ignore can't be bothered to fix this
                  `${marks[v]?.label}`
                : v <= 50
                ? `${v * 100} ft.`
                : v == 0
                ? 'SFC'
                : `FL${v}`
            : v === 0
            ? 'SFC'
            : 'TOUS';

    const marks2 = {
        ...marks,
        [showAirspacesStartingBelowFL >= MAX_CEILING ? MAX_CEILING : showAirspacesStartingBelowFL]:
            {
                style: { ...style, color: Colors.flightplotLogoBlue, textDecoration: 'underline' },
                label: formatter(showAirspacesStartingBelowFL),
            },
    };
    return (
        <OuterContainer>
            <Container $isHidden={window.innerWidth < 600 && (!!clickedLocation || !!item)}>
                <Vertical>
                    <SectionTitle>🗺</SectionTitle>
                    <MapBackgroundPickButton layer="osm">OSM</MapBackgroundPickButton>
                    <MapBackgroundPickButton layer="oaci">IGN OACI</MapBackgroundPickButton>
                    <MapBackgroundPickButton layer="sat">Satellite</MapBackgroundPickButton>
                    <SectionTitle>🌦</SectionTitle>
                    <LabelledSwitch>
                        METAR
                        <Switch
                            checked={weatherEnabled}
                            size={'small'}
                            onChange={(v) => setWeatherEnabled(v)}
                        />
                    </LabelledSwitch>
                    <br />
                    <SectionTitle>Espaces</SectionTitle>
                    <LabelledSwitch $color={Colors.sivThinBorder}>
                        SIV
                        <GreenSwitch
                            checked={SIV}
                            size={'small'}
                            title="SIV"
                            onChange={(v) =>
                                setFilters((f) => ({
                                    ..._.set(f, 'displayModePerAirspaceType.SIV', v),
                                }))
                            }
                        />
                    </LabelledSwitch>
                    <LabelledSwitch $color={Colors.pThinBorder}>
                        R
                        <RedSwitch
                            checked={R}
                            size={'small'}
                            title="R"
                            onChange={(v) =>
                                setFilters((f) => ({
                                    ..._.set(f, 'displayModePerAirspaceType.R', v),
                                }))
                            }
                        />
                    </LabelledSwitch>
                    <LabelledSwitch $color={Colors.pThinBorder}>
                        D
                        <RedSwitch
                            checked={D}
                            size={'small'}
                            title="D"
                            onChange={(v) =>
                                setFilters((f) => ({
                                    ..._.set(f, 'displayModePerAirspaceType.D', v),
                                }))
                            }
                        />
                    </LabelledSwitch>
                </Vertical>
                <SectionTitle>Plafond</SectionTitle>
                <StyledSlider
                    vertical
                    marks={marks2}
                    defaultValue={showAirspacesStartingBelowFL}
                    min={0}
                    max={MAX_CEILING}
                    step={5}
                    tooltip={{
                        formatter,
                    }}
                    onChange={(v) =>
                        setFilters((f) => ({
                            ...f,
                            showAirspacesStartingBelowFL: v === MAX_CEILING ? 400 : v,
                        }))
                    }
                />
            </Container>
        </OuterContainer>
    );
};

const StyledSlider = styled(Slider)`
    height: 300px;
    flex-shrink: 1;
    min-height: 200px;
`;

const Vertical = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    /* width: 30px; */
    align-self: center;
    font-size: 5;
    overflow: hidden;
    flex-shrink: 0;
`;

const Container = styled.div<{ $isHidden: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: right;
    position: relative;
    gap: 1rem;
    z-index: 700;
    background-color: white;
    border-radius: 5px;
    padding: 5px;
    border: 2px solid ${Colors.flightplotLogoBlue};
    font-family: Univers;
    height: 100%;
    overflow: hidden;
    ${({ $isHidden }) => $isHidden && 'display: none;'}
`;

const OuterContainer = styled.div`
    position: absolute;
    top: 0px;
    right: 0px;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    padding: 10px;
`;

const LabelledSwitch = styled.div<{ $color?: string }>`
    display: flex;
    justify-content: space-between;
    gap: 0.25rem;
    align-items: center;
    ${({ $color }) => $color && `color: ${$color}`};
`;

const RedSwitch = styled(Switch)`
    background-color: ${({ checked }) => checked && Colors.pThickBorder};
`;

const GreenSwitch = styled(Switch)`
    background-color: ${({ checked }) => checked && Colors.sivThinBorder};
`;

const SectionTitle = styled.span`
    /* font-size: 1.5rem; */
    font-weight: bold;
    margin-bottom: 0.5rem;
    background-color: #002e94;
    border-radius: 5px;
    text-align: center;
    color: white;
`;

const MapBackgroundPickButton: React.FC<
    PropsWithChildren<{ layer: DisplayedLayerProps['layer'] }>
> = ({ layer, children }) => {
    const { currentBackgroundLayer, setCurrentBackgroundLayer } = useMainMap();

    return (
        <Button
            type={currentBackgroundLayer === layer ? 'default' : 'dashed'}
            disabled={currentBackgroundLayer === layer}
            onClick={() => setCurrentBackgroundLayer(layer)}
        >
            {children}
        </Button>
    );
};
