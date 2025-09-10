// components/TaskReminderManager.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
	View,
	Text,
	TextInput,
	Button,
	FlatList,
	StyleSheet,
	Platform,
	TouchableOpacity,
	Linking,
} from 'react-native';
import * as Speech from 'expo-speech';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Contacts from 'expo-contacts';
import Voice from '@react-native-voice/voice';

type Task = {
	id: string;
	time: string; // Format: "HH:mm"
	message: string;
	type: 'reminder' | 'call';
	contactName?: string;
	phoneNumber?: string;
};

type Props = {
	voiceId?: string;
	enabled: boolean;
};

const TaskReminderManager: React.FC<Props> = ({ voiceId, enabled }) => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [time, setTime] = useState('');
	const [message, setMessage] = useState('');
	const [taskType, setTaskType] = useState<'reminder' | 'call'>('reminder');

	const [contactName, setContactName] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');

	const [showTimePicker, setShowTimePicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());

	const spokenTasks = useRef<Set<string>>(new Set());
	const lastMinute = useRef<string | null>(null);

	// Simulate recognized text (replace with real voice recognition logic)
	const mockVoiceResponse = async () => {
		return new Promise<string>((resolve) => {
			setTimeout(() => {
				resolve('yes'); // Simulate user saying "yes"
			}, 3000);
		});
	};

	const handleCallTask = async (task: Task) => {
		console.log("handleCallTask 3")
		return new Promise<void>(async (resolve) => {
			console.log("handleCallTask 4")

			Speech.speak(`Do you want to call ${task.contactName}? Say yes or no.`);

			let timeoutId: ReturnType<typeof setTimeout>;

			const cleanup = () => {
				Voice.removeAllListeners();
				clearTimeout(timeoutId);
				Voice.stop();
			};

			const onSpeechResults = (e: any) => {
				const spokenText = (e.value || []).join(' ').toLowerCase();
				console.log('User said:', spokenText);

				cleanup();

				if (spokenText.includes('yes')) {
					Speech.speak(`Calling ${task.contactName}`);
					if (task.phoneNumber) {
						Linking.openURL(`tel:${task.phoneNumber}`);
					}
				} else {
					Speech.speak('Okay, call cancelled.');
				}

				resolve();
			};

			const onSpeechError = (e: any) => {
				console.error('Speech recognition error:', e.error);
				Speech.speak('Sorry, I did not catch that.');
				cleanup();
				resolve();
			};

			try {
				Voice.onSpeechResults = onSpeechResults;
				Voice.onSpeechError = onSpeechError;

				await Voice.start('en-US');

				timeoutId = setTimeout(() => {
					Voice.removeAllListeners();
					Voice.stop();
					Speech.speak('No response received. Call cancelled.');
					resolve();
				}, 7000); // Wait for 7 seconds
			} catch (err) {
				console.error('Voice start error:', err);
				Speech.speak('Something went wrong with voice recognition.');
				resolve();
			}
		});
	};
	useEffect(() => {
		// if (!enabled) return; // ✅ DON'T comment this out
		const interval = setInterval(async () => {

			const now = new Date();
			const hh = now.getHours().toString().padStart(2, '0');
			const mm = now.getMinutes().toString().padStart(2, '0');
			const currentTime = `${hh}:${mm}`;

			if (lastMinute.current !== currentTime) {
				spokenTasks.current.clear();
				lastMinute.current = currentTime;
			}

			for (const task of tasks) {
				console.log("task.time", task.time)
				console.log("currentTime", currentTime)

				if (task.time === currentTime && !spokenTasks.current.has(task.id)) {
					console.log('🔔 Triggered task:', task);

					console.log("task.type 1");
					if (task.type === 'call' && task.contactName && task.phoneNumber) {
						console.log("task.type 2");

						await handleCallTask(task);
					} else {
						Speech.speak(`Reminder: ${task.message}`, { voice: voiceId });
					}
					spokenTasks.current.add(task.id);
				}
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [enabled, tasks, voiceId]);



	const isValidTime = (t: string) => /^\d{2}:\d{2}$/.test(t);

	const addTask = () => {
		if (!time || !isValidTime(time)) {
			alert('Please enter a valid time in HH:mm format');
			return;
		}

		if (!message && taskType === 'reminder') {
			alert('Please enter a reminder message');
			return;
		}

		if (taskType === 'call' && (!contactName || !phoneNumber)) {
			alert('Please enter contact name and phone number');
			return;
		}

		const newTask: Task = {
			id: `${Date.now()}`,
			time,
			message,
			type: taskType,
			contactName: taskType === 'call' ? contactName : undefined,
			phoneNumber: taskType === 'call' ? phoneNumber : undefined,
		};

		setTasks(prev => [...prev, newTask]);
		setTime('');
		setMessage('');
		setContactName('');
		setPhoneNumber('');
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>📋 Task Reminders</Text>

			{/* Time Picker */}
			<TouchableOpacity
				onPress={() => setShowTimePicker(true)}
				style={styles.inputTouchable}
				activeOpacity={0.7}
			>
				<Text style={[styles.inputText, !time && { color: '#888' }]}>{time || 'Select Time'}</Text>
			</TouchableOpacity>
			{showTimePicker && (
				<DateTimePicker
					value={selectedDate}
					mode="time"
					is24Hour={true}
					display={Platform.OS === 'ios' ? 'spinner' : 'default'}
					onChange={(event, date) => {
						setShowTimePicker(false);
						if (date) {
							const hh = date.getHours().toString().padStart(2, '0');
							const mm = date.getMinutes().toString().padStart(2, '0');
							setTime(`${hh}:${mm}`);
							setSelectedDate(date);
						}
					}}
				/>
			)}

			{/* Task Type Switch */}
			<View style={styles.buttonRow}>
				<TouchableOpacity
					style={[
						styles.taskTypeButton,
						taskType === 'reminder' && styles.taskTypeButtonActiveReminder,
					]}
					onPress={() => setTaskType('reminder')}
					activeOpacity={0.7}
				>
					<Text
						style={[
							styles.taskTypeText,
							taskType === 'reminder' && styles.taskTypeTextActiveReminder,
						]}
					>
						Reminder Task
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.taskTypeButton,
						taskType === 'call' && styles.taskTypeButtonActiveCall,
					]}
					onPress={() => setTaskType('call')}
					activeOpacity={0.7}
				>
					<Text
						style={[
							styles.taskTypeText,
							taskType === 'call' && styles.taskTypeTextActiveCall,
						]}
					>
						Call Task
					</Text>
				</TouchableOpacity>
			</View>

			{/* Contact Inputs if Call Task */}
			{taskType === 'call' && (
				<>
					<TextInput
						placeholder="Contact Name"
						value={contactName}
						onChangeText={setContactName}
						style={styles.input}
						placeholderTextColor="#aaa"
					/>
					<TextInput
						placeholder="Phone Number"
						value={phoneNumber}
						onChangeText={setPhoneNumber}
						style={styles.input}
						keyboardType="phone-pad"
						placeholderTextColor="#aaa"
					/>
				</>
			)}

			{/* Message */}
			<TextInput
				placeholder="Reminder Message"
				value={message}
				onChangeText={setMessage}
				style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
				multiline
				placeholderTextColor="#aaa"
			/>

			<TouchableOpacity onPress={addTask} style={styles.addButton} activeOpacity={0.8}>
				<Text style={styles.addButtonText}>Add Task</Text>
			</TouchableOpacity>

			<FlatList
				data={tasks}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View style={styles.taskItemContainer}>
						<Text style={styles.taskItem}>
							⏰ {item.time} -{' '}
							{item.type === 'call' ? (
								<>
									Call <Text style={styles.contactName}>{item.contactName}</Text>
								</>
							) : (
								item.message
							)}
						</Text>
					</View>
				)}
				style={styles.taskList}
				contentContainerStyle={{ paddingBottom: 100 }}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#eef9ff',
		padding: 15,
		borderRadius: 10,
		marginTop: 20,
		width: '100%',
	},
	title: {
		fontSize: 26,
		fontWeight: '700',
		marginBottom: 20,
		color: '#222',
		textAlign: 'center',
	},
	taskList: {
		marginTop: 15,
	},
	inputTouchable: {
		backgroundColor: '#fff',
		paddingVertical: 16,
		paddingHorizontal: 14,
		borderRadius: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#ddd',
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 5,
		elevation: 2,
	},
	inputText: {
		fontSize: 16,
		color: '#000',
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: 20,
	},
	taskTypeButton: {
		flex: 1,
		paddingVertical: 14,
		marginHorizontal: 6,
		borderRadius: 20,
		backgroundColor: '#ddd',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 2,
	},
	taskTypeButtonActiveReminder: {
		backgroundColor: '#2196F3',
	},
	taskTypeButtonActiveCall: {
		backgroundColor: '#4CAF50',
	},
	taskTypeText: {
		textAlign: 'center',
		color: '#555',
		fontWeight: '600',
	},
	taskTypeTextActiveReminder: {
		color: '#fff',
	},
	taskTypeTextActiveCall: {
		color: '#fff',
	},
	input: {
		backgroundColor: '#fff',
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 12,
		fontSize: 16,
		marginBottom: 14,
		borderWidth: 1,
		borderColor: '#ddd',
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 6,
		elevation: 1,
	},
	addButton: {
		backgroundColor: '#ff6f61',
		paddingVertical: 16,
		borderRadius: 25,
		marginVertical: 10,
		shadowColor: '#ff6f61',
		shadowOpacity: 0.5,
		shadowRadius: 10,
		elevation: 5,
	},
	addButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
		textAlign: 'center',
	},
	taskItemContainer: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOpacity: 0.03,
		shadowRadius: 4,
		elevation: 1,
	},
	taskItem: {
		fontSize: 16,
		color: '#333',
		padding: 8,
		backgroundColor: '#d9f0ff',
		marginVertical: 4,
		borderRadius: 4,
	},
	contactName: {
		fontWeight: '700',
		color: '#4CAF50',
	},
});

export default TaskReminderManager;
