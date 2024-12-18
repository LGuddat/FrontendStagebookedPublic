import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { Link, useRouter } from "expo-router";

export default function Login() {
  const { signIn, setActive, isLoaded } =
    useSignIn();
  const [emailAddress, setEmailAddress] =
    useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setActive({
        session: completeSignIn.createdSessionId,
      });
      router.replace("/");
    } catch (err: unknown) {
      console.error(
        "Error:",
        err instanceof Error
          ? err.message
          : "An unknown error occurred"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        autoCapitalize="none"
        placeholder="Email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        onPress={onSignInPress}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Sign In
        </Text>
      </TouchableOpacity>

      <Link
        href="/(auth)/signup"
        style={styles.link}
      >
        Don't have an account? Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    color: "#000",
    textAlign: "center",
    marginTop: 10,
  },
});
