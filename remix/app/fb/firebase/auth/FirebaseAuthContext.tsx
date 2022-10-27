import type { User, UserCredential } from '@firebase/auth';
import { GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut } from '@firebase/auth';
import * as React from 'react';
import { FullStoryAPI } from 'react-fullstory';
import { auth } from '~/fb/firebaseConfig';

const provider = new GoogleAuthProvider();

type UserState = 'loading' | User | null;

type ContextState = {
    user: UserState;
};

const FirebaseAuthContext = React.createContext<ContextState | undefined>(undefined);

const FirebaseAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [user, setUser] = React.useState<UserState>('loading');

    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && !user.isAnonymous) {
                FullStoryAPI('identify', user.uid, {
                    email: user.email || undefined,
                    displayName: user.displayName || undefined,
                });
            }
            setUser(user);
        });
        return unsubscribe;
    }, []);

    return <FirebaseAuthContext.Provider value={{ user }}>{children}</FirebaseAuthContext.Provider>;
};

type UseFirebaseAuth = {
    user: User | null;
    googleSignIn: () => void;
    anonymousSignIn: () => void;
    signOut: () => void;
    loading: boolean;
};

function useFirebaseAuth(): UseFirebaseAuth {
    const context = React.useContext(FirebaseAuthContext);
    if (context === undefined) {
        throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
    }
    const sendIdTokenToServer = ({ user }: UserCredential) => {
        user.getIdToken().then((idToken) => {
            return fetch('/session', {
                method: 'POST',
                body: JSON.stringify({ idToken }),
            });
        });
    };

    const anonymousSignIn = () =>
        signInAnonymously(auth)
            .then(sendIdTokenToServer)
            .catch((error) => {
                // const errorCode = error.code;
                // const errorMessage = error.message;
                // TODO deal with errors
            });

    const googleSignIn = () => {
        signInWithPopup(auth, provider)
            .then(sendIdTokenToServer)
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

    const loading = context.user === 'loading';
    return {
        user: loading ? null : (context.user as User),
        anonymousSignIn,
        googleSignIn,
        signOut: () => signOut(auth).then(() => fetch('/logout')),
        loading,
    };
}

export { FirebaseAuthProvider, useFirebaseAuth };
