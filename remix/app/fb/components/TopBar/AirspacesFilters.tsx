import { Slider, Switch } from 'antd';
import type { SliderMarks } from 'antd/lib/slider';
import _ from 'lodash';
import styled from 'styled-components';
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
            displayModePerAirspaceType: { R, D },
        },
    } = useMainMap();

    return (
        <Container>
            <Vertical>
                <LabelledSwitch>
                    R
                    <Switch
                        checked={R}
                        size={'small'}
                        title="R"
                        onChange={(v) =>
                            setFilters((f) => ({ ..._.set(f, 'displayModePerAirspaceType.R', v) }))
                        }
                    />
                </LabelledSwitch>
                <LabelledSwitch>
                    D
                    <Switch
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
                onChange={(v) => setFilters((f) => ({ ...f, showAirspacesStartingBelowFL: v }))}
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
    width: 30px;
    align-self: center;
    font-family: Univers;
    font-size: 5;
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

const LabelledSwitch = styled.div`
    display: flex;
    gap: 0.25rem;
    align-items: center;
`;
