import styled from 'styled-components';
import { MagneticRunwayOrientation } from 'ts-aerodata-france';
import AerodromeIcon from './AerodromeIcon';

type PropsType = {
    $magneticVariation: number;
    $magneticOrientation: MagneticRunwayOrientation;
};

export const StyledAerodromeLogo = styled(AerodromeIcon)<PropsType>`
    #magnetic-variation {
        transform-origin: center;
        transform: ${(props) => `rotate(${props.$magneticVariation}deg)`};
    }
    #runway {
        transform-origin: center;
        transform: ${(props) => `rotate(${props.$magneticOrientation}deg)`};
    }
`;
