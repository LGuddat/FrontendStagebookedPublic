import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { commonStyles } from '../../constants/Theme';
import { Title, BodyText, Button } from './StyledComponents';
import { useRouter } from 'expo-router';

interface PremiumModalProps {
  modalRef: React.RefObject<Modalize>;
  title: string;
  onClose?: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  modalRef,
  title,
  onClose,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const handleUpgradePress = () => {
    modalRef.current?.close();
    router.push('/billing');
  };

  const features = [
    'Op til 20 Billeder i Galleri',
    'Video galleri',
    'Kontakt formular',
    '4k Billede fremvisning',
    'Premium temaer'
  ];

  const styles = StyleSheet.create({
    container: {
      padding: commonStyles.spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: commonStyles.spacing.xl,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.accentBgColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: commonStyles.spacing.md,
    },
    titleContainer: {
      backgroundColor: theme.errorColor + '20',
      paddingVertical: commonStyles.spacing.sm,
      paddingHorizontal: commonStyles.spacing.md,
      borderRadius: commonStyles.borderRadius.medium,
      marginTop: commonStyles.spacing.md,
    },
    titleText: {
      color: theme.errorColor,
      fontWeight: '500',
    },
    featureList: {
      marginVertical: commonStyles.spacing.xl,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBgColor,
      padding: commonStyles.spacing.sm,
      borderRadius: commonStyles.borderRadius.medium,
      marginBottom: commonStyles.spacing.sm,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    featureText: {
      marginLeft: commonStyles.spacing.sm,
      color: theme.textColor,
    },
    upgradeButton: {
      backgroundColor: theme.activeGreen,
      padding: commonStyles.spacing.md,
      borderRadius: commonStyles.borderRadius.medium,
      alignItems: 'center',
    },
    upgradeButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 16,
    },
  });

  return (
    <Modalize
      ref={modalRef}
      adjustToContentHeight
      modalStyle={{
        backgroundColor: theme.backgroundColor,
        borderTopLeftRadius: commonStyles.borderRadius.xl,
        borderTopRightRadius: commonStyles.borderRadius.xl,
      }}
      onClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="crown" size={24} color={theme.activeGreen} />
          </View>
          <Title>Enhanced feature</Title>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        </View>

        <View style={styles.featureList}>
          <BodyText style={{ marginBottom: commonStyles.spacing.md, fontWeight: '600' }}>
            Lås op for Enhanced features:
          </BodyText>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={theme.activeGreen} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgradePress}
        >
          <Text style={styles.upgradeButtonText}>
            Opgrader din plan for kun 59 kr. / måned
          </Text>
        </TouchableOpacity>
      </View>
    </Modalize>
  );
}; 