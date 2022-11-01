import styled from 'styled-components';
import VorDmeIcon from '~/generated/icons/VorDme';
import type { PropsType } from './Map/VorMarker/VorMarker';

export const StyledVor = styled(VorDmeIcon)<PropsType>`
    ${({ $mouseOver }) => $mouseOver && `filter: drop-shadow(3px 5px 1px rgb(0 0 0 / 0.4));`}
    #dme {
        ${({ $dme }) => !$dme && `display: none !important;`}
    }
`;
