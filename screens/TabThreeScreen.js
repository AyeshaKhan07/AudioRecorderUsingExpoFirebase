import * as React from "react";
import { StyleSheet } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { TextInput } from "react-native";
import * as firebase from "firebase";
import { Audio } from "expo-av";
import Button from "../components/Button";
import { FirebaseContext } from "../firebaseProvider";

export default function TabTwoScreen() {
  const db = firebase.firestore();
  const { user } = React.useContext(FirebaseContext);
  const [audioList, setAudioList] = React.useState([]);
  const [description, setDescription] = React.useState("");
  const getAudioList = async () => {
    const response = await db
      .collection("Users")
      .doc(user.uid)
      .collection("AudioFiles")
      .get();
    if (response) {
      const audioList = response.docs.map((doc) => {
        return { uid: doc.id, ...doc.data() };
      });
      setAudioList(audioList);
    }
  };
  React.useEffect(() => {
    getAudioList();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recording List</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {audioList &&
        audioList.map((audio) => {
          return (
            <View key={audio.uid}>
              <Text style={styles.margin}>{audio.Description}</Text>
              <View
                style={{
                  width: "100%",
                  margin: 10,
                  alignItems: "center",
                }}
              >
                <Text>Description</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(e) => {
                    setDescription(e);
                  }}
                  value={description}
                />

                <View style={styles.recordBtnWrapper}>
                  <Button
                    style={styles.btn}
                    textStyle={styles.txt}
                    onPress={async () => {
                      if (description !== "") {
                        db.collection("Users")
                          .doc(user.uid)
                          .collection("AudioFiles")
                          .doc(`${audio.uid}`)
                          .set(
                            {
                              Description: description,
                            },
                            { merge: true }
                          )
                          .then(() => {
                            console.log("Document successfully written!");
                            setDescription();
                            alert("Updated Successfully");
                          })
                          .catch((error) => {
                            console.error("Error writing document: ", error);
                            alert(error.message);
                          });
                      } else alert("no description present!");
                    }}
                  >
                    UPDATE
                  </Button>
                  <Button
                    style={[styles.btn, { marginLeft: 12 }]}
                    textStyle={styles.txt}
                    onPress={async () => {
                      console.log("Loading Sound");

                      // console.log("uri:", playUri);
                      const { sound } = await Audio.Sound.createAsync(
                        { uri: audio.AudioUrl },
                        { shouldPlay: false }.uri
                      );
                      console.log("Playing Sound");
                      await sound.playAsync();
                    }}
                  >
                    PLAY
                  </Button>
                </View>
              </View>
            </View>
          );
        })}
      {/* <EditScreenInfo path="/screens/TabTwoScreen.tsx" /> */}
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
  txt: {
    color: "black",
    fontSize: 14,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
  btn: {
    borderColor: "black",
    color: "black",
    borderWidth: 1,
  },
  recordBtnWrapper: {
    flexDirection: "row",
  },
});
