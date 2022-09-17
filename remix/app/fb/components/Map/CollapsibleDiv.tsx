import styled from 'styled-components';

export type Collapsible = { collapsed?: boolean };

export const CollapsibleDiv = styled.div<Collapsible>`
    ${({ collapsed }) => collapsed && 'display: none;'};
    overflow: hidden;
`;
