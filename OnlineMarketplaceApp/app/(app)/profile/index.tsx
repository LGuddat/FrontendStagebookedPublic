import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {
  useAuth,
  useUser,
} from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuItems = [
    {
      icon: "account-balance-wallet",
      title: "Abonnement",
      onPress: () => {
        router.push("/profile/billing");
      },
    },
    {
      icon: "help",
      title: "Help & Support",
      onPress: () => {
        Alert.alert(
          "Hjælp & Support",
          "Stagebooked er stadig i beta, og vi arbejder på at forbedre platformen. Hvis du har brug for hjælp, kan du altid kontakte os på kontakt@stagebooked.com"
        );
      },
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0] ||
              user?.emailAddresses[0].emailAddress[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.firstName
            ? `${user.firstName} ${
                user.lastName || ""
              }`
            : user?.emailAddresses[0]
                .emailAddress}
        </Text>
        <Text style={styles.email}>
          {user?.emailAddresses[0].emailAddress}
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color="#000"
            />
            <Text style={styles.menuItemText}>
              {item.title}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <MaterialIcons
          name="logout"
          size={24}
          color="white"
        />
        <Text style={styles.signOutButtonText}>
          Sign Out
        </Text>
      </TouchableOpacity>

      <Text style={styles.version}>
        Version 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  menuContainer: {
    backgroundColor: "white",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC3545",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  signOutButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  version: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
}); 