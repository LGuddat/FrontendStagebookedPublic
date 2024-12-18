import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { TokenCache } from "@clerk/clerk-expo/dist/cache";

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item =
          await SecureStore.getItemAsync(key);
        if (item) {
          console.log(`${key} blev brugt 🔐 \n`);
        } else {
          console.log(
            "Ingen værdier gemt under nøglen: " +
              key
          );
        }
        return item;
      } catch (error) {
        console.error(
          "secure store get item fejl: ",
          error
        );
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: (key: string, token: string) => {
      return SecureStore.setItemAsync(key, token);
    },
  };
};

// SecureStore understøttes ikke på web
export const tokenCache =
  Platform.OS !== "web"
    ? createTokenCache()
    : undefined;
