import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { WebsiteProvider } from "../../lib/contexts/WebsiteContext";
import { VideoProvider } from "../../lib/contexts/VideoContext";
import { GalleryProvider } from "../../lib/contexts/GalleryContext";
import { ThemeProvider } from "../../lib/contexts/ThemeContext";
import { WebmanagerProvider } from "../../lib/contexts/WebmanagerContext";
import { JobProvider } from "../../lib/contexts/JobContext";
import { Platform } from "react-native";
import { useTheme } from "../../lib/contexts/ThemeContext";

function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.textColor,
        tabBarInactiveTintColor:
          theme.placeholderColor,
        tabBarStyle: {
          backgroundColor: theme.backgroundColor,
          borderTopColor: theme.borderColor,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.backgroundColor,
          height: Platform.OS === "ios" ? 90 : 70,
        },
        headerTitleStyle: {
          color: theme.textColor,
          fontWeight: "bold",
          fontSize: 18,
          marginTop:
            Platform.OS === "ios" ? 35 : 15,
        },
        headerShadowVisible: false,
        headerStatusBarHeight:
          Platform.OS === "ios" ? 35 : 15,
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="event"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="design"
        options={{
          title: "Design",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="palette"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: "Videos",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="video-library"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="photo-library"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="person"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function AppLayout() {
  return (
    <ThemeProvider>
      <WebsiteProvider>
        <WebmanagerProvider>
          <JobProvider>
            <VideoProvider>
              <GalleryProvider>
                <TabNavigator />
              </GalleryProvider>
            </VideoProvider>
          </JobProvider>
        </WebmanagerProvider>
      </WebsiteProvider>
    </ThemeProvider>
  );
}
