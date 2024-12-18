import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useState, useCallback } from "react";
import { Stack, router } from "expo-router";
import {
  useAuth,
  useUser,
} from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { useWebsite } from "../../lib/contexts/WebsiteContext";
import * as ImagePicker from "expo-image-picker";

type WebsiteData = {
  title?: string;
  domain?: string;
  description?: string;
  templateId?: number;
  image_url?: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#18181b",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#71717a",
    lineHeight: 24,
  },
  inputContainer: {
    marginTop: 24,
  },
  input: {
    backgroundColor: "#f4f4f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#18181b",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: "#ef4444",
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButtonText: {
    color: "#71717a",
    fontSize: 16,
    marginLeft: 8,
  },
  descriptionInput: {
    backgroundColor: "#f4f4f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#18181b",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    height: 120,
    textAlignVertical: "top",
  },
  templateContainer: {
    marginTop: 20,
  },
  templateOption: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  templateOptionSelected: {
    borderColor: "#18181b",
    backgroundColor: "#f4f4f5",
  },
  templateOptionUnselected: {
    borderColor: "#e4e4e7",
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  templateDescription: {
    color: "#71717a",
    fontSize: 14,
  },
  imageUploadContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    width: "100%",
  },
  uploadButton: {
    width: "100%",
    height: 200,
    borderWidth: 2,
    borderColor: "#e4e4e7",
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f5",
  },
  uploadButtonText: {
    marginTop: 12,
    fontSize: 16,
    color: "#71717a",
    fontWeight: "500",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
  },
});

const OnboardingLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {children}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default function OnboardingFlow() {
  const { userId, getToken } = useAuth();
  const { user } = useUser();
  const {
    setSelectedWebsite,
    setWebsites,
    refreshWebsite,
  } = useWebsite();
  const [step, setStep] = useState(1);
  const [websiteData, setWebsiteData] =
    useState<WebsiteData>({});
  const [error, setError] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);
  const [isProcessing, setIsProcessing] =
    useState(false);

  const forbiddenWords = [
    "stagebooked",
    "www",
    "http",
    "https",
    "api",
    "admin",
    "dashboard",
    "backend",
    "image",
    "images",
    "betaling",
    "payment",
    "payments",
    "checkout",
    "test",
    "handelsbetingelser",
    "kontakt",
    "priser",
    "privatlivspolitik",
  ];

  const findInvalidCharacter = (
    subdomain: string
  ) => {
    const match = subdomain.match(
      /[^a-zA-Z0-9-]/
    );
    return match ? match[0] : null;
  };

  const isForbiddenWord = (subdomain: string) => {
    return forbiddenWords.includes(subdomain);
  };

  const pickImage = useCallback(async () => {
    try {
      setIsProcessing(true);
      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.5,
          }
        );

      if (
        !result.canceled &&
        result.assets &&
        result.assets[0]
      ) {
        // Check file size (10MB limit)
        const fileSize =
          result.assets[0].fileSize || 0;
        if (fileSize > 10 * 1024 * 1024) {
          Alert.alert(
            "Fejl",
            "Billedfilen skal være mindre end 10MB"
          );
          return;
        }

        try {
          // Opret form data til billedupload
          const formData = new FormData();
          const imageUri = result.assets[0].uri;
          const filename =
            imageUri.split("/").pop() ||
            "image.jpg";
          const type = "image/jpeg";

          formData.append("file", {
            uri:
              Platform.OS === "ios"
                ? imageUri.replace("file://", "")
                : imageUri,
            type,
            name: filename,
          } as any);

          // Upload til API endpoint
          const uploadResponse = await fetch(
            "https://image.stagebooked.com/",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            throw new Error(
              `Upload fejlede med status: ${uploadResponse.status}`
            );
          }

          const data =
            await uploadResponse.json();

          if (!data.url || !data.public_id) {
            throw new Error(
              "Ugyldigt svar fra billedserver"
            );
          }

          // Gem URL'en fra API'en
          setSelectedImage(data.url);
          setWebsiteData((prev) => ({
            ...prev,
            image_url: data.url,
          }));
        } catch (uploadError) {
          console.error(
            "Fejl ved upload af billede:",
            uploadError
          );
          Alert.alert(
            "Fejl",
            "Kunne ikke uploade billede. Prøv venligst igen."
          );
        }
      }
    } catch (error) {
      console.error("Fejl i pickImage:", error);
      Alert.alert(
        "Fejl",
        "Kunne ikke få adgang til billedbiblioteket. Prøv venligst igen."
      );
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleNext = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Validér hvert trin
      switch (step) {
        case 1:
          if (!websiteData.title?.trim()) {
            setError(
              "Hov! Du skal indtaste et kunstnernavn for at fortsætte."
            );
            return;
          }
          if (websiteData.title.length > 50) {
            setError(
              "Hov! Dit kunstnernavn må maksimalt indholde 50 tegn."
            );
            return;
          }
          break;
        case 2:
          const domain = websiteData.domain
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

          if (!domain) {
            setError(
              "Hov! Du skal indtaste et domæne for at fortsætte."
            );
            return;
          }

          if (domain.length > 25) {
            setError(
              "Hov! Domænet må ikke være længere end 25 tegn."
            );
            return;
          }

          const invalidChar =
            findInvalidCharacter(domain);
          if (invalidChar) {
            setError(
              `Beklager! Domænet indeholder et ulovligt tegn: '${invalidChar}'`
            );
            return;
          }

          if (isForbiddenWord(domain)) {
            setError(
              "Du må desværre ikke anvende dette domæne af sikkerhedsårsager."
            );
            return;
          }

          // Check for duplicate domain
          try {
            const response = await fetch(
              `https://api.stagebooked.com/websites/checkduplicatesubdomain/${domain}`
            );

            if (response.status === 409) {
              setError(
                "Der er desværre allerede en bruger med dette domænenavn"
              );
              return;
            }
          } catch (error) {
            console.error(
              "Fejl ved tjek af domæne:",
              error
            );
            setError(
              "Der opstod en fejl ved tjek af domæne. Prøv venligst igen."
            );
            return;
          }
          break;
        case 3:
          if (!websiteData.templateId) {
            setError(
              "Vælg venligst en skabelon til din hjemmeside."
            );
            return;
          }
          break;
        case 4:
          // Billede upload er valgfrit
          break;
        case 5:
          await handleSubmit();
          return;
      }

      setStep(step + 1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validér domænenavn
    const subdomain = websiteData.domain
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (!subdomain || subdomain.length < 3) {
      Alert.alert(
        "Fejl",
        "Dit domæne skal være mindst 3 tegn langt og må kun indeholde bogstaver, tal og bindestreger."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(
        "https://api.stagebooked.com/websites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subdomain,
            title: websiteData.title,
            template_id: websiteData.templateId,
            userId: userId,
            contact_email:
              user?.emailAddresses[0]
                ?.emailAddress,
            image_url: websiteData.image_url,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));
        throw new Error(
          errorData.message ||
            "Kunne ikke oprette hjemmeside"
        );
      }

      const newWebsite = await response.json();

      // Opdater WebsiteContext med det nye website
      setSelectedWebsite(newWebsite);
      setWebsites((prev) => [
        ...prev,
        newWebsite,
      ]);

      // Refresh website data før vi navigerer
      await refreshWebsite();

      Alert.alert(
        "Succes! 🎉",
        "Din hjemmeside er blevet oprettet.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(app)/design");
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "Fejl ved oprettelse af hjemmeside:",
        error
      );
      Alert.alert(
        "Fejl",
        "Der skete en fejl ved oprettelse af din hjemmeside. Prøv igen senere."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const renderButton = (
    text: string,
    onPress: () => void,
    loading: boolean = false
  ) => (
    <TouchableOpacity
      style={[
        styles.button,
        (loading || isProcessing) && {
          opacity: 0.7,
        },
      ]}
      onPress={onPress}
      disabled={loading || isProcessing}
    >
      {loading || isProcessing ? (
        <ActivityIndicator
          color="white"
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text style={styles.buttonText}>
        {loading || isProcessing
          ? "Vent venligst..."
          : text}
      </Text>
      {!loading && !isProcessing && (
        <Octicons
          name="arrow-right"
          size={20}
          color="white"
        />
      )}
    </TouchableOpacity>
  );

  const renderStep1 = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      keyboardShouldPersistTaps="handled"
    >
      {step > 1 && (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <Octicons
            name="arrow-left"
            size={24}
            color="#71717a"
          />
          <Text style={styles.backButtonText}>
            Tilbage
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>
          Fortæl os hvad du hedder
        </Text>
        <Text style={styles.subtitle}>
          Her kan du bruge dit personlige navn,
          eller dit kunstnernavn. Det vil fremgå
          som overskriften på din hjemmeside.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
          ]}
          placeholder="Indtast dit kunstnernavn"
          value={websiteData.title}
          onChangeText={(text) =>
            setWebsiteData((prev) => ({
              ...prev,
              title: text,
            }))
          }
          placeholderTextColor="#a1a1aa"
          autoCapitalize="words"
          autoCorrect={false}
        />

        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color="#ef4444"
            />
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        {renderButton("Næste skridt", handleNext)}
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
      >
        <Octicons
          name="arrow-left"
          size={24}
          color="#71717a"
        />
        <Text style={styles.backButtonText}>
          Tilbage
        </Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>
          Vælg dit domæne
        </Text>
        <Text style={styles.subtitle}>
          Indtast dit domæne, det kan eksempelvis
          være dit kunstnernavn. Ønsker du at
          bruge dit eget domæne, kan det gøres
          senere.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <View
          style={[
            styles.input,
            error && styles.inputError,
            {
              flexDirection: "row",
              alignItems: "center",
            },
          ]}
        >
          <TextInput
            style={{ flex: 1 }}
            placeholder="Dit ønskede domæne"
            value={websiteData.domain}
            onChangeText={(text) =>
              setWebsiteData((prev) => ({
                ...prev,
                domain: text,
              }))
            }
            placeholderTextColor="#a1a1aa"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {websiteData.domain && (
            <Text
              style={{
                color: "#71717a",
                marginLeft: 4,
              }}
            >
              .stagebooked.com
            </Text>
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color="#ef4444"
            />
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        {renderButton("Næste skridt", handleNext)}
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
      >
        <Octicons
          name="arrow-left"
          size={24}
          color="#71717a"
        />
        <Text style={styles.backButtonText}>
          Tilbage
        </Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>
          Vælg din hjemmeside skabelon
        </Text>
        <Text style={styles.subtitle}>
          Vælg det design der passer bedst til
          dig. Du kan altid ændre det senere.
        </Text>
      </View>

      <View style={styles.templateContainer}>
        {[
          {
            id: 1,
            title: "Lyst tema",
            description:
              "Rent og minimalistisk design med lyse farver",
          },
          {
            id: 2,
            title: "Mørkt tema",
            description:
              "Elegant og moderne design med mørke farver",
          },
        ].map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.templateOption,
              websiteData.templateId ===
              template.id
                ? styles.templateOptionSelected
                : styles.templateOptionUnselected,
            ]}
            onPress={() =>
              setWebsiteData((prev) => ({
                ...prev,
                templateId: template.id,
              }))
            }
          >
            <Text style={styles.templateTitle}>
              {template.title}
            </Text>
            <Text
              style={styles.templateDescription}
            >
              {template.description}
            </Text>
          </TouchableOpacity>
        ))}

        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color="#ef4444"
            />
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        {renderButton("Næste skridt", handleNext)}
      </View>
    </ScrollView>
  );

  const renderImageUploadStep = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
    >
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
      >
        <Octicons
          name="arrow-left"
          size={24}
          color="#71717a"
        />
        <Text style={styles.backButtonText}>
          Tilbage
        </Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>
          Upload et billede
        </Text>
        <Text style={styles.subtitle}>
          Lad os gøre din hjemmeside mere
          personlig, upload et billede fra en af
          dine tidligere events
        </Text>
      </View>

      <View style={styles.imageUploadContainer}>
        {selectedImage ? (
          <Image
            source={{ uri: selectedImage }}
            style={styles.previewImage}
          />
        ) : (
          <TouchableOpacity
            onPress={pickImage}
            style={styles.uploadButton}
          >
            <MaterialCommunityIcons
              name="upload"
              size={32}
              color="#71717a"
            />
            <Text style={styles.uploadButtonText}>
              Vælg billede
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        {renderButton("Næste skridt", handleNext)}
      </View>
    </ScrollView>
  );

  const renderFinalStep = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      keyboardShouldPersistTaps="handled"
    >
      {isSubmitting ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <ActivityIndicator
            size="large"
            color="#18181b"
          />
          <Text
            style={{
              marginTop: 20,
              fontSize: 16,
              textAlign: "center",
            }}
          >
            Din hjemmeside er ved at blive
            oprettet...
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
          >
            <Octicons
              name="arrow-left"
              size={24}
              color="#71717a"
            />
            <Text style={styles.backButtonText}>
              Tilbage
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>
              Du er næsten i mål!
            </Text>
            <Text style={styles.subtitle}>
              Gennemgå dine oplysninger og opret
              din hjemmeside.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Navn
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#71717a",
                }}
              >
                {websiteData.title}
              </Text>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Domæne
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#71717a",
                }}
              >
                {websiteData.domain
                  ?.toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}
                .stagebooked.com
              </Text>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Valgt skabelon
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#71717a",
                }}
              >
                {
                  ["Lyst tema", "Mørkt tema"][
                    (websiteData.templateId ||
                      1) - 1
                  ]
                }
              </Text>
            </View>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              marginBottom: 20,
            }}
          >
            {renderButton(
              "Opret hjemmeside",
              handleNext
            )}
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderImageUploadStep();
      case 5:
        return renderFinalStep();
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        {renderStep()}
      </View>
    </OnboardingLayout>
  );
}
