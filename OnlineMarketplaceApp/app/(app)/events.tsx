import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Dimensions, Alert, Platform, FlatList, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { AntDesign } from '@expo/vector-icons';
import { useJob, Job } from '../../lib/contexts/JobContext';
import { useWebsite } from '../../lib/contexts/WebsiteContext';
import { useTheme } from '../../lib/contexts/ThemeContext';
import {
  Container,
  Title,
  BodyText,
  Button,
  Input,
} from '../../lib/components/styled/StyledComponents';
import { JobItem } from '../../lib/components/styled/JobItem';
import { commonStyles } from '../../lib/constants/Theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface JobFormState {
  job_title: string;
  job_hvor: string;
  job_dato: string;
  job_tid: string;
  job_spillested: string;
  job_by: string;
  job_med: string;
  job_billet: string;
}

function EventsScreen() {
  const { theme } = useTheme();
  const { jobs, addJob, updateJob, deleteJob, fetchJobs } = useJob();
  const { selectedWebsite } = useWebsite();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [formState, setFormState] = useState<JobFormState>({
    job_title: '',
    job_hvor: '',
    job_dato: '',
    job_tid: '',
    job_spillested: '',
    job_by: '',
    job_med: '',
    job_billet: '',
  });

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const editModalRef = useRef<Modalize>(null);
  const addModalRef = useRef<Modalize>(null);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setFormState(prev => ({
        ...prev,
        job_dato: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
      setFormState(prev => ({
        ...prev,
        job_tid: format(selectedTime, 'HH:mm')
      }));
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchJobs();
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs().catch(console.error);
  }, [fetchJobs]);

  const handleAddJob = async () => {
    try {
      if (!selectedWebsite?.id || !selectedWebsite?.user_id) {
        Alert.alert('Error', 'No website selected');
        return;
      }

      const formattedJob = {
        ...formState,
        website_id: selectedWebsite.id,
        is_public: true,
        user_id: selectedWebsite.user_id,
      };

      await addJob(formattedJob);
      addModalRef.current?.close();
      Alert.alert('Success', 'Event added successfully');
      setFormState({
        job_title: '',
        job_hvor: '',
        job_dato: '',
        job_tid: '',
        job_spillested: '',
        job_by: '',
        job_med: '',
        job_billet: '',
      });
      await fetchJobs();
    } catch (error) {
      console.error('Error adding job:', error);
      Alert.alert('Error', 'Failed to add event');
    }
  };

  const handleEditJob = (job: Job) => {
    if (editModalRef.current) {
      setEditingJob(job);
      setFormState({
        job_title: job.job_title || '',
        job_hvor: job.job_hvor || '',
        job_dato: job.job_dato || '',
        job_tid: job.job_tid || '',
        job_spillested: job.job_spillested || '',
        job_by: job.job_by || '',
        job_med: job.job_med || '',
        job_billet: job.job_billet || '',
      });
      editModalRef.current.open();
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    try {
      await updateJob({
        ...editingJob,
        ...formState,
      });
      editModalRef.current?.close();
      setEditingJob(null);
      Alert.alert('Success', 'Event updated successfully');
      await fetchJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      Alert.alert('Error', 'Failed to update event');
    }
  };

  const handleDeleteJob = async () => {
    if (!editingJob) return;

    try {
      await deleteJob(editingJob.id);
      editModalRef.current?.close();
      setEditingJob(null);
      Alert.alert('Success', 'Event deleted successfully');
      await fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: handleDeleteJob,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = useCallback(({ item }: { item: Job }) => (
    <JobItem
      job={item}
      onEdit={() => handleEditJob(item)}
      onDelete={() => {
        setEditingJob(item);
        confirmDelete();
      }}
    />
  ), [handleEditJob]);

  const renderModalContent = (isEditing: boolean) => (
    <Container style={styles.modalContent}>
      <Title style={styles.modalTitle}>
        {isEditing ? 'Edit Event' : 'Add New Event'}
      </Title>
      
      <View style={styles.inputGroup}>
        <BodyText style={styles.inputLabel}>Title</BodyText>
        <Input
          placeholder="Event title"
          value={formState.job_title}
          onChangeText={(text: string) => setFormState(prev => ({ ...prev, job_title: text }))}
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <BodyText style={styles.inputLabel}>Venue</BodyText>
        <Input
          placeholder="Where is the event?"
          value={formState.job_spillested}
          onChangeText={(text: string) => setFormState(prev => ({ ...prev, job_spillested: text }))}
          style={styles.input}
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <BodyText style={styles.inputLabel}>Date</BodyText>
          <Button
            onPress={() => setShowDatePicker(true)}
            variant="outline"
            style={styles.dateTimeButton}
          >
            <View style={styles.dateTimeButtonContent}>
              <BodyText numberOfLines={1} style={styles.dateTimeText}>
                {formState.job_dato || 'Select Date'}
              </BodyText>
              <AntDesign name="calendar" size={20} color={theme.textColor} />
            </View>
          </Button>
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: commonStyles.spacing.md }]}>
          <BodyText style={styles.inputLabel}>Time</BodyText>
          <Button
            onPress={() => setShowTimePicker(true)}
            variant="outline"
            style={styles.dateTimeButton}
          >
            <View style={styles.dateTimeButtonContent}>
              <BodyText numberOfLines={1} style={styles.dateTimeText}>
                {formState.job_tid || 'Select Time'}
              </BodyText>
              <AntDesign name="clockcircleo" size={20} color={theme.textColor} />
            </View>
          </Button>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      <View style={styles.inputGroup}>
        <BodyText style={styles.inputLabel}>City</BodyText>
        <Input
          placeholder="City"
          value={formState.job_by}
          onChangeText={(text: string) => setFormState(prev => ({ ...prev, job_by: text }))}
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <BodyText style={styles.inputLabel}>With</BodyText>
        <Input
          placeholder="Co-performers"
          value={formState.job_med}
          onChangeText={(text: string) => setFormState(prev => ({ ...prev, job_med: text }))}
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <BodyText style={styles.inputLabel}>Ticket Link</BodyText>
        <Input
          placeholder="https://"
          value={formState.job_billet}
          onChangeText={(text: string) => setFormState(prev => ({ ...prev, job_billet: text }))}
          style={styles.input}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          onPress={isEditing ? handleUpdateJob : handleAddJob}
          variant="primary"
          style={styles.submitButton}
        >
          <BodyText style={{ color: 'white', fontWeight: '600' }}>
            {isEditing ? 'Update Event' : 'Add Event'}
          </BodyText>
        </Button>

        {isEditing && (
          <Button
            onPress={confirmDelete}
            variant="primary"
            style={styles.deleteButton}
          >
            <BodyText style={{ color: 'white', fontWeight: '600' }}>
              Delete Event
            </BodyText>
          </Button>
        )}
      </View>
    </Container>
  );

  const styles = {
    modalContent: {
      padding: commonStyles.spacing.lg,
    } as ViewStyle,
    modalTitle: {
      ...commonStyles.typography.h2,
      marginBottom: commonStyles.spacing.xl,
      textAlign: 'center' as const,
      fontWeight: '600' as const,
    } as TextStyle,
    inputGroup: {
      marginBottom: commonStyles.spacing.md,
    } as ViewStyle,
    inputLabel: {
      ...commonStyles.typography.label,
      marginBottom: commonStyles.spacing.xs,
      fontWeight: '600' as const,
    } as TextStyle,
    input: {
      borderWidth: 1,
      borderColor: '#E4E4E7',
      borderRadius: commonStyles.borderRadius.medium,
      padding: commonStyles.spacing.sm,
      backgroundColor: 'white',
      textAlign: 'left',
      height: 45,
      fontSize: 16,
      paddingHorizontal: commonStyles.spacing.md,
      textAlignVertical: 'center',
    } as TextStyle,
    rowContainer: {
      flexDirection: 'row' as const,
    } as ViewStyle,
    dateTimeButton: {
      borderWidth: 1,
      borderColor: '#E4E4E7',
      borderRadius: commonStyles.borderRadius.medium,
      padding: commonStyles.spacing.sm,
      backgroundColor: 'white',
      height: 45,
      justifyContent: 'center',
    } as ViewStyle,
    dateTimeButtonContent: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: commonStyles.spacing.xs,
      justifyContent: 'flex-start',
      gap: 8,
    } as ViewStyle,
    dateTimeText: {
      color: theme.textColor,
      textAlign: 'left' as const,
      flexShrink: 1,
    } as TextStyle,
    dateTimeIcon: {
      marginLeft: commonStyles.spacing.xs,
      width: 20,
    } as ViewStyle,
    buttonContainer: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginTop: commonStyles.spacing.xl,
    } as ViewStyle,
    submitButton: {
      flex: 1,
      marginRight: commonStyles.spacing.sm,
      backgroundColor: '#000',
    } as ViewStyle,
    deleteButton: {
      flex: 1,
      marginLeft: commonStyles.spacing.sm,
      backgroundColor: '#FF4444',
    } as ViewStyle,
    emptyText: {
      textAlign: 'center' as const,
      marginTop: commonStyles.spacing.xl,
    } as TextStyle,
    list: {
      padding: commonStyles.spacing.md,
    } as ViewStyle,
    addButton: {
      position: 'absolute',
      bottom: commonStyles.spacing.lg,
      right: commonStyles.spacing.lg,
      backgroundColor: '#000',
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    } as ViewStyle,
  };

  return (
    <Container>
      <FlatList
        data={jobs}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <BodyText style={[styles.emptyText, { color: theme.textColor }]}>
            No events found
          </BodyText>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addModalRef.current?.open()}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modalize
        ref={addModalRef}
        modalHeight={SCREEN_HEIGHT * 0.8}
        modalStyle={{
          backgroundColor: theme.backgroundColor,
          borderTopLeftRadius: commonStyles.borderRadius.xl,
          borderTopRightRadius: commonStyles.borderRadius.xl,
        }}
      >
        {renderModalContent(false)}
      </Modalize>

      <Modalize
        ref={editModalRef}
        modalHeight={SCREEN_HEIGHT * 0.8}
        modalStyle={{
          backgroundColor: theme.backgroundColor,
          borderTopLeftRadius: commonStyles.borderRadius.xl,
          borderTopRightRadius: commonStyles.borderRadius.xl,
        }}
      >
        {renderModalContent(true)}
      </Modalize>
    </Container>
  );
}

export default EventsScreen; 