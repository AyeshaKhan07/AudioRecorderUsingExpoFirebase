/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from "react";
import { Audio } from "expo-av";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import * as firebase from "firebase";
import { firebaseConfig } from "../firebaseConfig";
import Button from "../components/Button";
import { FirebaseContext } from "../firebaseProvider";

// import * as FileSystem from "expo-file-system";
const App = () => {
  const [state, setState] = useState({
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: "00:00:00",
    currentPositionSec: 0,
    currentDurationSec: 0,
    playTime: "00:00:00",
    duration: "00:00:00",
  });
  const { user } = React.useContext(FirebaseContext);
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const storage = firebase.storage();
  const storageRef = storage.ref();
  const audioRef = storageRef.child("audio");
  const [description, setDescription] = useState("");
  const screenWidth = Dimensions.get("screen").width;
  const [recording, setRecording] = React.useState();
  const [audioList, setAudioList] = useState(0);
  const [sound, setSound] = React.useState();
  const [uri, setUri] = useState("");
  // const path = Platform.select({
  //   ios: "hello.m4a",
  //   android: `${FileSystem.cacheDirectory}/hello.mp3`,
  // });

  let playWidth =
    (state.currentPositionSec / state.currentDurationSec) * (screenWidth - 56);

  if (!playWidth) {
    playWidth = 0;
  }

  async function playSound() {
    console.log("Loading Sound");
    // const playUri = await firebase
    //   .storage()
    //   .ref("audio/nameOfTheFile.m4a")
    //   .getDownloadURL();

    // console.log("uri:", playUri);
    const { sound } = await Audio.Sound.createAsync(
      { uri: uri },
      { shouldPlay: false }.uri
    );
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }
  const onStartRecord = async () => {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const onStopRecord = async () => {
    console.log("Stopping recording..");
    await recording.stopAndUnloadAsync();
    const uri = await recording.getURI();
    setUri(uri);
    console.log("Recording stopped and stored at", uri);
    setRecording(undefined);
  };

  const uploadAudioAndDescription = async () => {
    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          try {
            resolve(xhr.response);
          } catch (error) {
            console.log("error:", error);
          }
        };
        xhr.onerror = (e) => {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });
      if (blob != null) {
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        firebase
          .storage()
          .ref()
          .child(`audio/Recording${audioList}.${fileType}`)
          .put(blob, {
            contentType: `audio/${fileType}`,
          })
          .then(async () => {
            {
              console.log("Sent!");
              const playUri = await firebase
                .storage()
                .ref(`audio/Recording${audioList}.m4a`)
                .getDownloadURL();
              console.log(playUri);
              console.log("writting");
              db.collection("Users")
                .doc(user.uid)
                .collection("AudioFiles")
                .doc(description)
                .set({
                  Description: description,
                  AudioUrl: playUri,
                })
                .then((res) => {
                  alert("Uploaded Successfully");
                  setDescription("");
                })
                .catch((error) => alert(error.message));
            }
          })
          .catch((e) => console.log("error:", e));
      } else {
        console.log("erroor with blob");
      }
    } catch (error) {
      console.log("error:", error);
    }
  };
  useEffect(() => {
    audioRef
      .listAll()
      .then((res) => {
        setAudioList(res.items.length);
      })
      .catch((error) => {
        console.log("error:", error);
      });
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleTxt}>Audio Recorder Player</Text>
      <Text style={styles.txtRecordCounter}>{state.recordTime}</Text>
      <View style={styles.viewRecorder}>
        <View style={styles.recordBtnWrapper}>
          <Button
            style={styles.btn}
            onPress={() => onStartRecord()}
            textStyle={styles.txt}
          >
            Record
          </Button>
          <Button
            style={[styles.btn, { marginLeft: 12, marginRight: 12 }]}
            onPress={() => onStopRecord()}
            textStyle={styles.txt}
          >
            Stop
          </Button>
          <Button
            style={styles.btn}
            onPress={() => playSound()}
            textStyle={styles.txt}
          >
            Play
          </Button>
        </View>
      </View>
      <View style={styles.viewPlayer}>
        <View style={{ width: "100%", margin: 10 }}>
          <Text style={styles.txt}>Description</Text>
          <TextInput
            style={styles.input}
            onChangeText={(e) => {
              setDescription(e);
            }}
            value={description}
          />
          <View style={styles.viewRecorder}>
            <View style={styles.recordBtnWrapper}>
              <Button
                style={styles.btn}
                onPress={() => onStartRecord()}
                textStyle={styles.txt}
                onPress={async () => {
                  if (description !== "" && uri !== "") {
                    await uploadAudioAndDescription();
                  } else
                    alert("either description is empty or audio not present");
                }}
              >
                UPLOAD
              </Button>
              <Button
                style={[styles.btn, { marginLeft: 12 }]}
                onPress={() => {
                  firebase
                    .auth()
                    .signOut()
                    .then(() => {
                      console.log("Signout successfully");
                      // Sign-out successful.
                    })
                    .catch((error) => {
                      console.error();
                    });
                }}
                textStyle={styles.txt}
              >
                SIGNOUT
              </Button>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  titleTxt: {
    marginTop: 100,
    color: "black",
    fontSize: 28,
  },
  viewRecorder: {
    marginTop: 40,
    width: "100%",
    alignItems: "center",
  },
  recordBtnWrapper: {
    flexDirection: "row",
  },
  viewPlayer: {
    marginTop: 60,
    alignSelf: "stretch",
    alignItems: "center",
  },
  viewBarWrapper: {
    marginTop: 28,
    marginHorizontal: 28,
    alignSelf: "stretch",
  },
  viewBar: {
    backgroundColor: "#ccc",
    height: 4,
    alignSelf: "stretch",
  },
  viewBarPlay: {
    backgroundColor: "black",
    height: 4,
    width: 0,
  },
  playStatusTxt: {
    marginTop: 8,
    color: "#ccc",
  },
  playBtnWrapper: {
    flexDirection: "row",
    marginTop: 40,
  },
  btn: {
    borderColor: "black",
    borderWidth: 1,
  },
  txt: {
    color: "black",
    fontSize: 14,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  txtRecordCounter: {
    marginTop: 32,
    color: "black",
    fontSize: 20,
    textAlignVertical: "center",
    fontWeight: "200",
    letterSpacing: 3,
  },
  txtCounter: {
    marginTop: 12,
    color: "black",
    fontSize: 20,
    textAlignVertical: "center",
    fontWeight: "200",
    letterSpacing: 3,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "black",
    borderColor: "black",
  },
});
export default App;
