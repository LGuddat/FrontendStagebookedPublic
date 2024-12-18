import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { commonStyles } from '@/lib/constants/Theme';
import { Container, Title, BodyText } from '@/lib/components/styled/StyledComponents';
import { useAuth } from '@clerk/clerk-expo';
import { useStripe } from '@stripe/stripe-react-native';
import { useWebsite } from '@/lib/contexts/WebsiteContext';

type BillingPeriod = 'monthly' | 'yearly';

const STRIPE_PRODUCTS = {
  monthly: {
    productId: 'prod_QWrakQxYCrFOT8',
    priceId: 'price_1OQvRpHVuJ5sTXtFGVfGWFfyO6bZBw4QnqwmHAQ8vNfAqWH9f9yAWEDv7IyZF5E4C7mx9xLOQXQx5ckrVWEzlWpK00AXrP8Tl7',
    price: 5900 // 59.00 DKK in øre
  },
  yearly: {
    productId: 'prod_QWrrmhqkicvxeu',
    priceId: 'price_1OQvRpHVuJ5sTXtFGVfGWFfyO6bZBw4QnqwmHAQ8vNfAqWH9f9yAWEDv7IyZF5E4C7mx9xLOQXQx5ckrVWEzlWpK00AXrP8Tl7',
    price: 59900 // 599.00 DKK in øre
  }
};

export default function Billing() {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { selectedWebsite } = useWebsite();
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const freeFeatures = [
    'Op til 5 Billeder i Galleri',
    'Basis temaer',
    'Kontakt formular',
    'Basis statistik',
  ];

  const premiumFeatures = [
    'Op til 20 Billeder i Galleri',
    'Video galleri',
    'Kontakt formular',
    '4k Billede fremvisning',
    'Premium temaer',
    'Avanceret statistik',
    'Prioriteret support',
  ];

  const styles = StyleSheet.create({
    header: {
      alignItems: 'center',
      marginBottom: commonStyles.spacing.xl,
      paddingTop: commonStyles.spacing.lg,
    },
    periodToggle: {
      flexDirection: 'row',
      backgroundColor: theme.cardBgColor,
      borderRadius: commonStyles.borderRadius.large,
      padding: commonStyles.spacing.xs,
      marginBottom: commonStyles.spacing.xl,
      marginHorizontal: commonStyles.spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    periodButton: {
      flex: 1,
      paddingVertical: commonStyles.spacing.md,
      paddingHorizontal: commonStyles.spacing.md,
      borderRadius: commonStyles.borderRadius.medium,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    periodButtonActive: {
      backgroundColor: theme.backgroundColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    periodText: {
      color: theme.textSecondary,
      fontWeight: '500',
      fontSize: 16,
    },
    periodTextActive: {
      color: theme.textColor,
      fontWeight: '600',
    },
    periodIcon: {
      marginRight: commonStyles.spacing.sm,
    },
    plansContainer: {
      flexDirection: 'column',
      gap: commonStyles.spacing.lg,
      paddingHorizontal: commonStyles.spacing.lg,
      paddingBottom: commonStyles.spacing.xl,
    },
    planCard: {
      backgroundColor: theme.cardBgColor,
      borderRadius: commonStyles.borderRadius.large,
      padding: commonStyles.spacing.xl,
      borderWidth: 1,
      borderColor: theme.borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      minHeight: 400,
    },
    planCardPremium: {
      borderColor: theme.activeGreen,
      borderWidth: 2,
    },
    planHeader: {
      alignItems: 'center',
      paddingVertical: commonStyles.spacing.md,
    },
    planIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: commonStyles.spacing.md,
    },
    planTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.textColor,
      marginBottom: commonStyles.spacing.lg,
    },
    priceContainer: {
      marginBottom: commonStyles.spacing.xl,
    },
    planPrice: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.textColor,
      lineHeight: 40,
    },
    planPeriod: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    featureList: {
      marginTop: commonStyles.spacing.lg,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: commonStyles.spacing.md,
      paddingRight: commonStyles.spacing.md,
    },
    featureText: {
      marginLeft: commonStyles.spacing.sm,
      color: theme.textColor,
      flex: 1,
      flexWrap: 'wrap',
    },
    upgradeButton: {
      backgroundColor: theme.activeGreen,
      padding: commonStyles.spacing.md,
      borderRadius: commonStyles.borderRadius.medium,
      alignItems: 'center',
      marginTop: commonStyles.spacing.xl,
    },
    upgradeButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 16,
    },
    upgradeButtonDisabled: {
      backgroundColor: theme.textSecondary,
    },
  });

  const handleUpgrade = async () => {
    if (!selectedWebsite?.id) {
      Alert.alert('Error', 'No website selected');
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();

      // Create payment intent using the backend endpoint
      const response = await fetch(
        `https://api.stagebooked.com/subscription/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: STRIPE_PRODUCTS[selectedPeriod].price,
            currency: 'dkk',
            payment_method_types: ['card'],
            metadata: {
              productId: STRIPE_PRODUCTS[selectedPeriod].productId,
              period: selectedPeriod,
              websiteId: selectedWebsite.id
            }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error('Server returned an error');
      }

      const { paymentIntent, ephemeralKey, customer } = await response.json();

      // Initialize the Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Stagebooked',
        paymentIntentClientSecret: paymentIntent,
        customerEphemeralKeySecret: ephemeralKey,
        customerId: customer,
        defaultBillingDetails: {
          name: 'Default Name'
        },
        returnURL: 'stagebooked://stripe-redirect',
        appearance: {
          colors: {
            background: theme.backgroundColor,
            componentBackground: theme.cardBgColor,
            componentText: theme.textColor,
          }
        }
      });

      if (initError) {
        console.error('Payment sheet init error:', initError);
        Alert.alert('Error', 'Kunne ikke initialisere betaling. Prøv venligst igen.');
        return;
      }

      // Present the Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Payment sheet present error:', presentError);
        if (presentError.code === 'Canceled') {
          // User canceled the payment - this is not an error
          return;
        }
        Alert.alert('Error', 'Betalingen fejlede. Prøv venligst igen.');
      } else {
        Alert.alert(
          'Success', 
          'Din betaling er gennemført! Du har nu adgang til alle premium funktioner.',
          [{ text: 'OK', onPress: () => {
            // Here you might want to refresh the user's subscription status
          }}]
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Der opstod en fejl. Prøv venligst igen senere.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Title>Vælg din plan</Title>
          <BodyText>Opgrader for at få adgang til alle funktioner</BodyText>
        </View>

        <View style={styles.periodToggle}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'monthly' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <MaterialCommunityIcons
              name="calendar-month"
              size={20}
              color={selectedPeriod === 'monthly' ? theme.textColor : theme.textSecondary}
              style={styles.periodIcon}
            />
            <BodyText
              style={[
                styles.periodText,
                selectedPeriod === 'monthly' && styles.periodTextActive,
              ]}
            >
              Månedlig
            </BodyText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'yearly' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('yearly')}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={selectedPeriod === 'yearly' ? theme.textColor : theme.textSecondary}
              style={styles.periodIcon}
            />
            <BodyText
              style={[
                styles.periodText,
                selectedPeriod === 'yearly' && styles.periodTextActive,
              ]}
            >
              Årlig
            </BodyText>
          </TouchableOpacity>
        </View>

        <View style={styles.plansContainer}>
          {/* Premium Plan */}
          <View style={[styles.planCard, styles.planCardPremium]}>
            <View style={styles.planHeader}>
              <View style={styles.planIconContainer}>
                <MaterialCommunityIcons
                  name="crown"
                  size={24}
                  color={theme.activeGreen}
                />
              </View>
              <BodyText style={styles.planTitle}>Premium</BodyText>
              <View style={styles.priceContainer}>
                <BodyText style={styles.planPrice}>
                  {selectedPeriod === 'monthly' ? '59 kr' : '599 kr'}
                </BodyText>
                <BodyText style={styles.planPeriod}>
                  {selectedPeriod === 'monthly' ? 'pr. måned' : 'pr. år'}
                </BodyText>
              </View>
            </View>

            <View style={styles.featureList}>
              {premiumFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={theme.activeGreen}
                  />
                  <BodyText style={styles.featureText}>{feature}</BodyText>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.upgradeButton,
                isLoading && styles.upgradeButtonDisabled
              ]}
              onPress={handleUpgrade}
              disabled={isLoading}
            >
              <BodyText style={styles.upgradeButtonText}>
                {isLoading ? 'Indlæser...' : 'Opgrader nu'}
              </BodyText>
            </TouchableOpacity>
          </View>

          {/* Free Plan */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.planIconContainer}>
                <MaterialCommunityIcons
                  name="star-outline"
                  size={24}
                  color={theme.textColor}
                />
              </View>
              <BodyText style={styles.planTitle}>Free</BodyText>
              <View style={styles.priceContainer}>
                <BodyText style={styles.planPrice}>0 kr</BodyText>
                <BodyText style={styles.planPeriod}>Gratis for altid</BodyText>
              </View>
            </View>

            <View style={styles.featureList}>
              {freeFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={20}
                    color={theme.textColor}
                  />
                  <BodyText style={styles.featureText}>{feature}</BodyText>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
} 