import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Job } from '../../contexts/JobContext';
import { useTheme } from '../../contexts/ThemeContext';
import { commonStyles } from '../../constants/Theme';
import { BodyText, Title } from './StyledComponents';

interface JobItemProps {
  job: Job;
  onEdit: () => void;
  onDelete: () => void;
}

export const JobItem: React.FC<JobItemProps> = ({ job, onEdit, onDelete }) => {
  const { theme } = useTheme();

  const truncateString = (str: string | null, num: number) => {
    if (!str) return "";
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + "...";
  };

  const isJobInFuture = () => {
    if (!job.job_dato || !job.job_tid) return false;
    const jobDateTime = new Date(`${job.job_dato}T${job.job_tid}`);
    return jobDateTime > new Date();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <TouchableOpacity 
      onPress={onEdit}
      activeOpacity={0.7}
    >
      <View style={[
        styles.container,
        { 
          backgroundColor: theme.cardBgColor,
          borderColor: theme.borderColor,
        },
        commonStyles.shadow,
      ]}>
        <View style={styles.header}>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: isJobInFuture() 
                ? `${theme.activeGreen}20`
                : `${theme.inactiveGray}20`,
            }
          ]}>
            <BodyText style={{
              color: isJobInFuture() ? theme.activeGreen : theme.inactiveGray,
            }}>
              {isJobInFuture() ? 'Active' : 'Past'}
            </BodyText>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={onEdit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons 
              name="more-vert" 
              size={20} 
              color={theme.textColor}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Title style={styles.venue}>
            {truncateString(job.job_spillested, 20)}
          </Title>
          <BodyText style={styles.city}>
            {truncateString(job.job_by, 20)}
          </BodyText>
        </View>

        <View style={[
          styles.divider,
          { backgroundColor: theme.dividerColor }
        ]} />

        <View style={styles.footer}>
          <BodyText style={styles.date}>
            {formatDate(job.job_dato)}
          </BodyText>
          <View style={styles.timeContainer}>
            <MaterialIcons 
              name="access-time" 
              size={16} 
              color={theme.textColor}
              style={styles.timeIcon}
            />
            <BodyText>{job.job_tid || ''}</BodyText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: commonStyles.borderRadius.medium,
    borderWidth: 1,
    padding: commonStyles.spacing.md,
    marginBottom: commonStyles.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: commonStyles.spacing.sm,
  },
  statusBadge: {
    paddingVertical: commonStyles.spacing.xxs,
    paddingHorizontal: commonStyles.spacing.sm,
    borderRadius: commonStyles.borderRadius.full,
  },
  menuButton: {
    padding: commonStyles.spacing.xs,
  },
  content: {
    marginBottom: commonStyles.spacing.md,
  },
  venue: {
    ...commonStyles.typography.h3,
    marginBottom: commonStyles.spacing.xxs,
  },
  city: {
    ...commonStyles.typography.body,
  },
  divider: {
    height: 1,
    marginBottom: commonStyles.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...commonStyles.typography.bodySmall,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: commonStyles.spacing.xs,
  },
}); 