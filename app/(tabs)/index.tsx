import axios from 'axios';
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useRef, useState } from "react";
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function App() {
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const captureImage = async () => {
  console.log("Pumasok");

  if (cameraRef.current) {
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });

    const resized = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 224, height: 224 } }], 
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    const formData = new FormData();
    formData.append("file", {
      uri: resized.uri,
      name: "photo.jpg",
      type: "image/jpeg",
    });

    try {
      const res = await axios.post(
        "http://38.224.253.86:8000/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 20000, // optional timeout
        }
      );

      const result = res.data;

      Alert.alert(
        "Image result",
        `Mango classification is ${result.prediction}`
      );
      console.log("Prediction:", result);

    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to connect to server.");
    }
  }
};

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={captureImage}>
          <Text style={styles.text}>Capture Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    backgroundColor: "transparent",
    width: "100%",
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
