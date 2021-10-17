import styled, { createGlobalStyle } from "styled-components";

const HideRestOfDOM = createGlobalStyle`
  @media print {
    #app {
      display: none
    }
  }

  @page {
    size: A4;
    margin: 0
  }
`;

const PrintContentContainer = styled.div`
  @media screen {
    display: none;
  }
`;

export const PrintContent = ({ children }: { children: React.ReactNode }) => (
  <>
    <HideRestOfDOM />
    <PrintContentContainer>{children}</PrintContentContainer>
  </>
);
