import { getAuth, signInAnonymously, signOut, User } from "firebase/auth";
import * as React from "react";

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
  signIn: () => void;
  signOut: () => void;
};

function useFirebaseAuth(): UseFirebaseAuth {
  const context = React.useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error(
      "useFirebaseAuth must be used within a FirebaseAuthProvider",
    );
  }
  const signIn = () =>
    signInAnonymously(auth)
      .then(() => {
        // Do nothing, will be done automatically with auth.onAuthStateChanged().
      })
      .catch((error) => {
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // TODO deal with errors
      });

  return { ...context, signIn, signOut: () => signOut(auth) };
}

export { FirebaseAuthProvider, useFirebaseAuth };
