import styled from 'styled-components';
import { MagneticRunwayOrientation } from 'ts-aerodata-france';
import AerodromeIcon from './AerodromeIcon';

type PropsType = {
    $magneticVariation: number;
    $magneticOrientation: MagneticRunwayOrientation;
    $pavedRunway: boolean;
    $military: boolean;
};

export const StyledAerodromeLogo = styled(AerodromeIcon)<PropsType>`
    #magnetic-variation {
        ${({ $military }) => $military && `display: none !important;`}
        transform-origin: center;
        transform: ${(props) => `rotate(${props.$magneticVariation}deg)`};
    }
    #runway {
        ${({ $pavedRunway }) => !$pavedRunway && `display: none !important;`}
        transform-origin: center;
        transform: ${(props) => `rotate(${props.$magneticOrientation}deg)`};
    }
    #runway * {
        ${({ $military }) => $military && `fill: #ba2020 !important;`}
    }
    #military {
        ${({ $military }) => !$military && `display: none !important;`}
    }
`;
