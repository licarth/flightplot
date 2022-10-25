import styled from 'styled-components';
import type { Aerodrome, MagneticRunwayOrientation } from 'ts-aerodata-france';
import { Aerodrome as AdIcon } from '~/generated/icons';

type PropsType = {
    $magneticVariation: number;
    $magneticOrientation: MagneticRunwayOrientation;
    $pavedRunway: boolean;
    $military: boolean;
    $closed: boolean;
};

export const StyledAerodromeLogo = (props: { aerodrome: Aerodrome }) => {
    const { icaoCode, magneticVariation, runways, status } = props.aerodrome;
    const {
        mainRunway: { magneticOrientation },
    } = runways;
    const hasPavedRunway = runways.runways.some((r) => r.surface === 'asphalt');
    return (
        <StyledAerodromeLogoComponent
            title={`${icaoCode}`}
            $military={status === 'MIL'}
            $pavedRunway={hasPavedRunway}
            $magneticVariation={magneticVariation}
            $magneticOrientation={magneticOrientation}
            $closed={status === 'OFF'}
            {...props}
        />
    );
};

const StyledAerodromeLogoComponent = styled(AdIcon)<PropsType>`
    #closed {
        ${({ $closed }) => !$closed && `display: none !important;`}
    }
    #magnetic-variation {
        ${({ $military, $closed }) => ($military || $closed) && `display: none !important;`}
        transform-origin: center;
        transform: ${(props) => `rotate(${props.$magneticVariation}deg)`};
    }
    #runway {
        ${({ $pavedRunway }) => !$pavedRunway && !closed && `display: none !important;`}
        transform-origin: center;
        transform: ${(props) => `rotate(${props.$magneticOrientation}deg)`};
    }
    #runway * {
        ${({ $closed }) => $closed && `display: none !important;`}
        ${({ $military }) => $military && `fill: #ba2020 !important;`}
    }
    #military {
        ${({ $military }) => !$military && `display: none !important;`}
    }
`;
