import styled from 'styled-components';
import type { MagneticRunwayOrientation } from 'ts-aerodata-france';
import AerodromeIcon from '~/generated/icons/Aerodrome';

type PropsType = {
    $magneticVariation: number;
    $magneticOrientation: MagneticRunwayOrientation;
    $pavedRunway: boolean;
    $military: boolean;
    $closed: boolean;
};

export const StyledAerodromeLogo = styled(AerodromeIcon)<PropsType>`
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
