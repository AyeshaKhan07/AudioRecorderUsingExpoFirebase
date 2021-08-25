/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from "react";
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
// import * as FileSystem from "expo-file-system";
const App = () => {
  const [uri, setUri] = useState("");
  const [state, setState] = useState({
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: "00:00:00",
    currentPositionSec: 0,
    currentDurationSec: 0,
    playTime: "00:00:00",
    duration: "00:00:00",
  });

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const [description, setDescription] = useState("");
  const screenWidth = Dimensions.get("screen").width;
  const [recording, setRecording] = React.useState();
  const [sound, setSound] = React.useState();
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
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setUri(uri);
    console.log("Recording stopped and stored at", uri);
  };

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
            style={[styles.btn, { marginLeft: 12 }]}
            onPress={() => onStopRecord()}
            textStyle={styles.txt}
          >
            Stop
          </Button>
        </View>
      </View>
      <View style={styles.viewPlayer}>
        <View style={styles.playBtnWrapper}>
          <Button
            style={styles.btn}
            onPress={() => playSound()}
            textStyle={styles.txt}
          >
            Play
          </Button>
        </View>
        <View style={{ width: "100%", margin: 10 }}>
          <Text>Description</Text>
          <TextInput
            style={styles.input}
            onChangeText={(e) => {
              setDescription(e);
            }}
            value={description}
          />
          <Button
            onPress={() => {
              console.log("writting");
              db.collection("Data")
                .doc()
                .set({
                  Description: description,
                })
                .then((res) => console.log("document written successfully"))
                .catch((error) => console.log(error));
            }}
          >
            UPLOAD
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#455A64",
    flexDirection: "column",
    alignItems: "center",
  },
  titleTxt: {
    marginTop: 100,
    color: "white",
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
    backgroundColor: "white",
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
    borderColor: "white",
    borderWidth: 1,
  },
  txt: {
    color: "white",
    fontSize: 14,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  txtRecordCounter: {
    marginTop: 32,
    color: "white",
    fontSize: 20,
    textAlignVertical: "center",
    fontWeight: "200",
    letterSpacing: 3,
  },
  txtCounter: {
    marginTop: 12,
    color: "white",
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
  },
});
export default App;