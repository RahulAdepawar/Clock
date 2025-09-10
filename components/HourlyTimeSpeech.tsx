// HourlyTimeSpeech.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
// import Tts from 'react-native-tts';
import * as Speech from 'expo-speech';
import TaskReminderManager from './TaskReminderManager';

type Props = {
	/**
	 * Interval in minutes: 60 for hourly, 30 for half-hourly.
	 */
	speechInterval?: 1 | 60;
};

const HourlyTimeSpeech: React.FC<Props> = ({ speechInterval = 60 }) => {
	const [speechEnabled, setSpeechEnabled] = useState(false);
	const lastSpokenTime = useRef<string | null>(null);

	const [voiceId, setVoiceId] = useState<string | undefined>();

	const speakNow = () => {
		Speech.speak("It's test time", {
			voice: voiceId,
		});
	};

	useEffect(() => {
		// Tts.setDefaultLanguage('en-US');

		const interval = setInterval(() => {
			if (!speechEnabled) return;

			const now = new Date();
			const hours = now.getHours();
			const minutes = now.getMinutes();
			const seconds = now.getSeconds();

			const shouldSpeak =
				(speechInterval === 60 && minutes === 0 && seconds === 0) ||
				(speechInterval === 1 && seconds === 0);

			if (shouldSpeak) {
				const timeKey = `${hours}:${minutes}`;
				if (lastSpokenTime.current !== timeKey) {
					speakTime(hours, minutes);
					lastSpokenTime.current = timeKey;
				}
			}

			if (seconds !== 0) {
				lastSpokenTime.current = null;
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [speechEnabled, speechInterval]);

	const speakTime = (hours: number, minutes: number) => {
		const spokenHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const minuteText = minutes === 0 ? `o'clock` : `${minutes}`;
		const message = `It's ${spokenHour} ${minuteText} ${ampm}`;
		console.log('Speaking:', message);
		Speech.speak(message); // ✅ Replaces Tts.speak
	};

	const toggleSpeech = () => {
		setSpeechEnabled(!speechEnabled);
	};

	return (
		<View style={styles.container}>
			{/* <Text style={styles.title}>⏰ Hourly Time Speech</Text>
			<Text style={styles.status}>
				Status: {speechEnabled ? 'Enabled ✅' : 'Disabled ❌'}
			</Text>
			<Text style={styles.status}>
				Interval: {speechInterval} minutes
			</Text>
			<View style={styles.buttonContainer}>
				<Button
					title={speechEnabled ? 'Disable Speech' : 'Enable Speech'}
					onPress={toggleSpeech}
					color={speechEnabled ? '#e53935' : '#43a047'}
				/>
			</View> */}

			{/* 🔔 Task Reminder Section */}
			<TaskReminderManager voiceId={voiceId} enabled={true} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: '#eef',
		borderRadius: 10,
		alignItems: 'center',
		margin: 10,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	status: {
		fontSize: 16,
		marginBottom: 5,
	},
	buttonContainer: {
		marginTop: 15,
		width: '60%',
	},
});

export default HourlyTimeSpeech;
