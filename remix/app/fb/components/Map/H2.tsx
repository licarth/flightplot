import styled from 'styled-components';

export const H2 = styled.h2<{ marginTop?: number }>`
    margin-top: ${({ marginTop }) => marginTop || 0}px;
    margin-bottom: 3px;
    text-align: center;
    background: #002e94;
    color: white;
`;
