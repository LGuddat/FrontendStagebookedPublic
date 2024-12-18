import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { Link, useRouter } from "expo-router";

export default function SignUp() {
  const { isLoaded, signUp, setActive } =
    useSignUp();
  const [emailAddress, setEmailAddress] =
    useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const result = await signUp.create({
        emailAddress,
        username,
        password,
      });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
        });
        router.replace("/(onboarding)/flow");
      } else {
        console.error(
          "Tilmelding ikke fuldført:",
          result
        );
      }
    } catch (err: unknown) {
      console.error(
        "Fejl:",
        err instanceof Error
          ? err.message
          : "Der opstod en ukendt fejl"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Opret Konto
      </Text>

      <TextInput
        autoCapitalize="none"
        placeholder="Email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        style={styles.input}
      />

      <TextInput
        autoCapitalize="none"
        placeholder="Brugernavn"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <TextInput
        placeholder="Adgangskode"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        onPress={onSignUpPress}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Opret Konto
        </Text>
      </TouchableOpacity>

      <Link
        href="/(auth)/login"
        style={styles.link}
      >
        Har du allerede en konto? Log ind
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
