import * as React from "react";
import { StyleSheet } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { TextInput } from "react-native";
import Button from "../components/Button";
import { auth } from "../firebaseConfig";
import firebase from "firebase/app";

export default function TabTwoScreen() {
  const [email, setEmail] = React.useState();
  const [password, setPassword] = React.useState();
  const db = firebase.firestore();

  const handleLogin = async (e) => {
    // e.preventDefault();
    if (email && password) {
      try {
        await auth.signInWithEmailAndPassword(email, password);
        alert("SignIn Successfull");
        setEmail();
        setPassword();
      } catch (error) {
        alert(error.message);
      }
    } else alert("fields can not be empty!");
  };

  const handleSignUp = async (e) => {
    // e.preventDefault();
    try {
      const responce = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      if (responce.additionalUserInfo.isNewUser) {
        db.collection("Users")
          .doc(`${responce.user.uid}`)
          .set({
            email: email,
          })
          .then(() => {
            alert("Signup Successfull!");
            setEmail();
            setPassword();
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
          });
      } else alert("SignUp Successfull");
    } catch (error) {
      console.log(error);
      alert("Error Occurred:", error.message);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login/Register</Text>

      <View
        style={{
          width: "100%",
          margin: 10,
          alignItems: "center",
        }}
      >
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={(e) => {
            setEmail(e);
          }}
          value={email}
        />
        <Text>Password</Text>
        <TextInput
          style={styles.input}
          onChangeText={(e) => {
            setPassword(e);
          }}
          value={password}
        />
        <Button style={styles.btn} onPress={() => handleLogin()}>
          Login
        </Button>
        <Text>Don't have account? click below with email password</Text>

        <Button style={styles.btn} onPress={() => handleSignUp()}>
          Register
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  margin: {
    margin: 15,
  },
  input: {
    // height: 10,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
  btn: {
    backgroundColor: "black",
    width: 150,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    margin: 5,
  },
});
