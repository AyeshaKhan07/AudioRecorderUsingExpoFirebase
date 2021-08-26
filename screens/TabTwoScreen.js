import * as React from "react";
import { StyleSheet } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { TextInput } from "react-native";
import * as firebase from "firebase";
import { Audio } from "expo-av";
import Button from "../components/Button";

export default function TabTwoScreen() {
  const db = firebase.firestore();
  const [audioList, setAudioList] = React.useState([]);
  const [description, setDescription] = React.useState("");
  const [show, setShow] = React.useState(false);
  const getAudioList = async () => {
    const response = await db.collection("Ayesha").get();
    if (response) {
      const audioList = response.docs.map((doc) => {
        return { uid: doc.id, ...doc.data() };
      });
      console.log(`audioList`, audioList);
      setAudioList(audioList);
      // setAwatingOrders(orders)
      // for(const doc of response)
      // {
      //   const data = [];

      // }
      // response.forEach((doc) => {
      // const data = [];
      // console.log(doc.data());
      //   setAudioList(doc.data());
      // });
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
              <Text
                style={styles.margin}
                onPress={() => {
                  setShow(true);
                }}
              >
                {audio.Description}
              </Text>
              <View
                style={{
                  width: "100%",
                  margin: 10,
                  alignItems: "center",
                  display: show ? "flex" : "none",
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
                <Button
                  style={styles.btn}
                  onPress={async () => {
                    if (description !== "") {
                      db.collection("Ayesha")
                        .doc(`${audio.uid}`)
                        .set(
                          {
                            Description: description,
                          },
                          { merge: true }
                        )
                        .then(() => {
                          console.log("Document successfully written!");
                        })
                        .catch((error) => {
                          console.error("Error writing document: ", error);
                        });
                    } else console.log("no description present!");
                  }}
                >
                  UPDATE
                </Button>
                <Button
                  style={styles.btn}
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
  input: {
    height: 40,
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
