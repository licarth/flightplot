import { Slider, Switch } from 'antd';
import type { SliderMarks } from 'antd/lib/slider';
import _ from 'lodash';
import styled from 'styled-components';
import { Colors } from '../Map/Colors';
import { useMainMap } from '../Map/MainMapContext';

const style = {
    fontSize: 12,
    fontFamily: 'Univers',
};

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
    120: {
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

    return (
        <Container>
            <Vertical>
                Espaces
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
                            setFilters((f) => ({ ..._.set(f, 'displayModePerAirspaceType.R', v) }))
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
                            setFilters((f) => ({ ..._.set(f, 'displayModePerAirspaceType.D', v) }))
                        }
                    />
                </LabelledSwitch>
            </Vertical>
            <StyledSlider
                vertical
                marks={marks}
                defaultValue={showAirspacesStartingBelowFL}
                min={0}
                max={120}
                step={5}
                tooltip={{
                    formatter: (v) =>
                        v
                            ? marks[v]
                                ? //@ts-ignore can't be bothered to fix this
                                  `${marks[v]?.label}`
                                : v <= 50
                                ? `${v * 100} ft.`
                                : `FL${v}`
                            : '',
                }}
                onChange={(v) =>
                    setFilters((f) => ({ ...f, showAirspacesStartingBelowFL: v === 120 ? 400 : v }))
                }
            />
        </Container>
    );
};

const StyledSlider = styled(Slider)`
    height: 300px;
`;

const Vertical = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    /* width: 30px; */
    align-self: center;
    font-family: Univers;
    font-size: 5;
    overflow: hidden;
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: right;
    gap: 1rem;
    position: absolute;
    top: 125px;
    right: 10px;
    z-index: 700;
    width: 70px;
    background-color: white;
    border-radius: 5px;
    padding: 3px;
`;

const LabelledSwitch = styled.div<{ $color: string }>`
    display: flex;
    gap: 0.25rem;
    align-items: center;
    color: ${({ $color }) => $color};
`;

const RedSwitch = styled(Switch)`
    background-color: ${({ checked }) => checked && Colors.pThickBorder};
`;

const GreenSwitch = styled(Switch)`
    background-color: ${({ checked }) => checked && Colors.sivThinBorder};
`;
