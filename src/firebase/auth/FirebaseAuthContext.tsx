import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import * as React from "react";
import { GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();
const auth = getAuth();

type UserState = User | null;

type ContextState = {
  user: UserState;
};

const FirebaseAuthContext = React.createContext<ContextState | undefined>(
  undefined,
);

const FirebaseAuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = React.useState<UserState>(null);
  const value = { user };

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

type UseFirebaseAuth = {
  user: User | null;
  googleSignIn: () => void;
  anonymousSignIn: () => void;
  signOut: () => void;
};

function useFirebaseAuth(): UseFirebaseAuth {
  const context = React.useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error(
      "useFirebaseAuth must be used within a FirebaseAuthProvider",
    );
  }
  const anonymousSignIn = () =>
    signInAnonymously(auth)
      .then(() => {
        // Do nothing, will be done automatically with auth.onAuthStateChanged().
      })
      .catch((error) => {
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // TODO deal with errors
      });

  const googleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // The signed-in user info.
        // const user = result.user;
        // ...
      })
      .catch((error) => {
        // // Handle Errors here.
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // // The email of the user's account used.
        // const email = error.email;
        // // The AuthCredential type that was used.
        // const credential = GoogleAuthProvider.credentialFromError(error);
        // // ...
      });
  };

  return {
    ...context,
    anonymousSignIn,
    googleSignIn,
    signOut: () => signOut(auth),
  };
}

export { FirebaseAuthProvider, useFirebaseAuth };
