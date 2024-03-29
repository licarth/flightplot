import styled from 'styled-components';
import { Colors } from './Colors';

type Props = {
    $color?: string;
};

export const IgnAirspaceNameFont = styled.span<Props>`
    text-align: center;
    font-family: 'Futura';
    color: ${({ $color }) => $color || Colors.ctrBorderBlue};
`;
