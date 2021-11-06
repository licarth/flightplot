import { GoogleLoginButton } from "react-social-login-buttons";
import styled from "styled-components";

const ColumnContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  z-index: 1000;
`;

const CenterColumn = styled.div`
  width: 400px;
  padding: 10px;
  border-radius: 5px;
  border: solid grey;
  background-color: white;
`;

export const Login = ({
  signInWithGoogle,
  loading,
}: {
  signInWithGoogle: () => void;
  loading: boolean;
}) => (
    <ColumnContainer>
      <CenterColumn>
        <h1>Bienvenue sur Flightplot</h1>
        Merci de vous inscrire pour continuer.
        <GoogleLoginButton onClick={signInWithGoogle} />
        {loading && <h2>Loading..</h2>}
      </CenterColumn>
    </ColumnContainer>
);
