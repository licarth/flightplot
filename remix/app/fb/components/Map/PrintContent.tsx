import styled, { createGlobalStyle } from 'styled-components';

const HideRestOfDOM = createGlobalStyle`
  @media print {
    #app {
      display: none
    }
  }
`;

const PrintContentContainer = styled.div`
    overflow: hidden;
    visibility: hidden;
    position: absolute;
    width: 0;
    height: 0;
    @media screen {
    }
`;

export const PrintContent = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <HideRestOfDOM />
            <PrintContentContainer>{children}</PrintContentContainer>
        </>
    );
};
