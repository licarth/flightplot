// Firebase App (the core Firebase SDK) is always required and must be listed first
import { default as firebase } from "firebase/app";
import "firebase/auth";
import withFirebaseAuth, {
  WrappedComponentProps
} from "react-with-firebase-auth";
import App from "./App";
import { firebaseConfig } from "./firebaseConfig";
import "./index.css";
import { Login } from "./Login";

const firebaseApp = firebase.initializeApp(firebaseConfig);

const firebaseAppAuth = firebaseApp.auth();

/** See the signature above to find out the available providers */
const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};

// /** providers can be customised as per the Firebase documentation on auth providers **/
// providers.googleProvider.setCustomParameters({
//   hd: "mycompany.com",
// });

/** Create the FirebaseAuth component wrapper */
const createComponentWithAuth = withFirebaseAuth({
  providers,
  firebaseAppAuth,
});

const Application = ({
  /** These props are provided by withFirebaseAuth HOC */
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithGoogle,
  signInWithFacebook,
  signInWithGithub,
  signInWithTwitter,
  signInAnonymously,
  signOut,
  setError,
  user,
  error,
  loading,
}: WrappedComponentProps) => (
  <>
    {!user && <Login signInWithGoogle={signInWithGoogle} loading={loading} />}
    <App disabled={!user} />
  </>
);

/** Wrap it */
export default createComponentWithAuth(Application);
