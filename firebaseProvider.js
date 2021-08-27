import React, { useEffect, useState } from "react";
import firebase from "firebase";

// The type definition for the firebase context data.

// The firebase context that will store the firebase instance and other useful variables.
export const FirebaseContext = React.createContext({
  firebase,
  user: null,
  userData: null,
});

// The provider that will store the logic for manipulating the firebase instance and variables.
export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  //Get latest user information
  React.useEffect(() => {
    const getUserData = async () => {
      const collaborator = await firebase
        .firestore()
        .collection("Users")
        .doc(user.uid)
        .get();
      setUserData({ id: user.uid, ...collaborator.data() });
    };

    if (user) {
      getUserData();
    }
  }, [user]);
  React.useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        console.log("user logded in");
        setUser(user);
      } else {
        // No user is signed in.
        console.log("no user signed in");
        setUser(undefined);
      }
    });
  }, []);
  return (
    <FirebaseContext.Provider
      value={{
        firebase,
        user,
        userData,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
