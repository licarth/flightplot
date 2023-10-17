import { formatInTimeZone } from 'date-fns-tz';
import styled, { css } from 'styled-components';
import type { RtbaActivation } from '~/fb/contexts/RtbaZonesContext';
import { isCurrentlyActive } from '~/fb/contexts/RtbaZonesContext';
import { Colors } from './Colors';
import { IgnAirspaceNameFont } from './IgnAirspaceNameFont';
import { Centered } from './InnerMapContainer';

const borderWidth = '3px';

export const RtbaActivationTooltip = ({ activation }: { activation: RtbaActivation }) => {
    const { name, lowerLimit, higherLimit } = activation.activeZone.zone;

    const color = Colors.pThinBorder;

    return (
        <AirspaceContainer>
            {/* <BorderLeftAnchor />
            <BorderTopAnchor />
            <BorderBottomAnchor />
            <BorderRightAnchor /> */}
            <Centered>
                <IgnAirspaceNameFont $color={color}>
                    <AirspaceNameContainer>
                        <AirspaceNameSeparator $color={color} />
                        <AirspaceName>{name}</AirspaceName>
                        <AirspaceNameSeparator $color={color} />
                    </AirspaceNameContainer>

                    <AltitudeFrame $color={color}>
                        <i>
                            <AltitudeValue>{higherLimit.toString()}</AltitudeValue>
                            <SeparationLine>
                                <Separator $color={color} />
                            </SeparationLine>
                            <AltitudeValue>
                                {lowerLimit.toString() === 'SFC' ? 'SFC' : lowerLimit.toString()}
                            </AltitudeValue>
                        </i>
                    </AltitudeFrame>
                </IgnAirspaceNameFont>
                {formatActivationDates(activation)}
                {isCurrentlyActive(activation) && <Live />}
            </Centered>
        </AirspaceContainer>
    );
};

const Live = () => {
    return (
        <LiveContainer>
            <LiveBullet />
            <LiveText>ACTIVE NOW</LiveText>
        </LiveContainer>
    );
};

const LiveContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;
const LiveBullet = styled.span`
    background: ${Colors.pThinBorder};
    border-radius: 50%;
    box-shadow: 0 0 0 0 ${Colors.pThinBorder};
    margin: 4px;
    height: 10px;
    width: 10px;
    transform: scale(1);
    // animate it make it glow
    animation: pulse 1s infinite;
    @keyframes pulse {
        0% {
            opacity: 0.5;
            box-shadow: 0 0 0 0 ${Colors.pThinBorder};
        }
        50% {
            opacity: 1;
            box-shadow: 0 0 0 1px ${Colors.pThinBorder};
        }
        100% {
            opacity: 0.5;
            box-shadow: 0 0 0 0 ${Colors.pThinBorder};
        }
    }
`;
const LiveText = styled.span``;

const formatActivationDates = (activation: RtbaActivation) => {
    const UTCformat = (date: Date, f: string) => formatInTimeZone(date, 'Z', f);
    const startDay = UTCformat(activation.activeZone.startDate, 'yyyyMMdd');
    const endDay = UTCformat(activation.activeZone.endDate, 'yyyyMMdd');
    const startPart = UTCformat(activation.activeZone.startDate, 'dd/MM');
    const endPart = startDay === endDay ? '' : UTCformat(activation.activeZone.endDate, 'dd/MM ');

    return `${startPart} ${UTCformat(
        activation.activeZone.startDate,
        'HHmm',
    )}Z - ${endPart}${UTCformat(activation.activeZone.endDate, 'HHmm')}Z`;
};

const SeparationLine = styled.div`
    display: flex;
    align-items: center;
    justify-content: stretch;
`;

const Separator = styled.div<{ $color: string }>`
    height: 1px;
    background-color: ${(props) => props.$color};
    flex-grow: 1;
`;
const AirspaceNameSeparator = styled.div<{ $color: string }>`
    height: 2px;
    background-color: ${(props) => props.$color};
    flex-grow: 1;
    min-width: 5px;
`;

const AirspaceName = styled.div`
    padding: 0 2px 0 2px;
`;

const AltitudeFrame = styled.div<{ $color: string }>`
    padding-top: 0.5rem;
    border-left: 2px solid ${(props) => props.$color};
    border-right: 2px solid ${(props) => props.$color};
    border-bottom: 2px solid ${(props) => props.$color};
`;

const AirspaceNameContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: stretch;
    transform: translateY(50%);
    margin-top: -1em;
`;

const AltitudeValue = styled.div`
    padding: 0 0.5em 0 0.5em;
    min-height: 0.75rem;
`;

const stripes = ['black', Colors.activeDangerZoneThick];

const stripesCss = ({ revert }: { revert: boolean } = { revert: false }) => css`
    content: '';
    position: absolute;
    background-image: linear-gradient(
        45deg,
        ${() => stripes[revert ? 0 : 1]} 25%,
        ${() => stripes[revert ? 1 : 0]} 25%,
        ${() => stripes[revert ? 1 : 0]} 50%,
        ${() => stripes[revert ? 0 : 1]} 50%,
        ${() => stripes[revert ? 0 : 1]} 75%,
        ${() => stripes[revert ? 1 : 0]} 75%,
        ${() => stripes[revert ? 1 : 0]} 100%
    );
    background-size: 1rem 1rem;
`;

const BorderTopAnchor = styled.span`
    ${stripesCss()}
    top: 0px;
    height: ${borderWidth};
    width: 100%;
    left: 0px;
    background-attachment: fixed;
`;
const BorderLeftAnchor = styled.span`
    ${stripesCss()}
    top: 0px;
    height: 100%;
    width: ${borderWidth};
    left: 0px;
    background-attachment: fixed;
`;
const BorderRightAnchor = styled.span`
    position: absolute;
    ${stripesCss()}
    width: ${borderWidth};
    z-index: 100;
    height: 100%;
    right: 0px;
    top: 0px;
    background-attachment: fixed;
`;
const BorderBottomAnchor = styled.span`
    ${stripesCss()}
    bottom: 0px;
    height: ${borderWidth};
    width: 100%;
    left: 0px;
    background-attachment: fixed;
`;
const AirspaceContainer = styled.div`
    position: relative;
    text-align: center;
    font-family: 'Futura';
    font-weight: 900;
    border-radius: 2px;
    padding: ${borderWidth};
`;
