import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import {
  useState,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";

export default function Index() {
  const {
    isSignedIn,
    isLoaded,
    userId,
    getToken,
  } = useAuth();
  const [hasWebsite, setHasWebsite] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<
    string | null
  >(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const checkWebsiteStatus = async () => {
      if (!isSignedIn || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error(
            "Kunne ikke hente auth token"
          );
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          10000
        );

        const response = await fetch(
          `https://api.stagebooked.com/websites/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 404) {
            if (isMounted.current) {
              setHasWebsite(false);
            }
            return;
          }
          throw new Error(
            `Server fejl: ${response.status}`
          );
        }

        const data = await response.json();
        if (isMounted.current) {
          setHasWebsite(data && data.length > 0);
        }
      } catch (error) {
        console.error(
          "Fejl ved tjek af website status:",
          error
        );
        if (isMounted.current) {
          setError(
            error instanceof Error
              ? error.message
              : "Der opstod en uventet fejl"
          );
          setHasWebsite(false);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    checkWebsiteStatus();
  }, [isSignedIn, userId, getToken]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
        <Text>Checking website status...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            color: "red",
            marginBottom: 10,
          }}
        >
          {error}
        </Text>
        <Text>
          Prøv at genstarte appen eller kontakt
          support hvis problemet fortsætter.
        </Text>
      </View>
    );
  }

  if (!hasWebsite) {
    return <Redirect href="/(onboarding)/flow" />;
  }

  return <Redirect href="/(app)/events" />;
}
