import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Voice from '@react-native-voice/voice';

type Task = {
	id: string;
	time?: string;
	type: 'reminder' | 'call';
	contactName?: string;
	message: string;
};

type Props = {
	onAddTask: (task: Task) => void;
};

export default function VoiceTaskSetter({ onAddTask }: Props) {
	const [isRecording, setIsRecording] = useState(false);
	const [transcript, setTranscript] = useState('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		Voice.onSpeechResults = onSpeechResultsHandler;
		Voice.onSpeechError = onSpeechErrorHandler;

		return () => {
			Voice.destroy().then(Voice.removeAllListeners);
		};
	}, []);

	const onSpeechResultsHandler = (event: any) => {
		const text = event.value?.[0] || '';
		setTranscript(text);
	};

	const onSpeechErrorHandler = (event: any) => {
		setError(event.error.message);
		setIsRecording(false);
	};

	const startRecording = async () => {
		setError(null);
		setTranscript('');
		try {
			await Voice.start('en-US');
			setIsRecording(true);
		} catch (e) {
			console.error(e);
		}
	};

	const stopRecording = async () => {
		try {
			await Voice.stop();
			setIsRecording(false);

			if (transcript.trim().length === 0) {
				setError('No speech detected, please try again.');
				return;
			}

			// Very basic task parsing (improve as needed)
			let taskType: 'reminder' | 'call' = 'reminder';
			let contactName = '';

			const lower = transcript.toLowerCase();
			if (lower.includes('call')) {
				taskType = 'call';

				// Extract contact name roughly (simple heuristic)
				const words = transcript.split(' ');
				const callIndex = words.findIndex((w) => w.toLowerCase() === 'call');
				if (callIndex >= 0 && words.length > callIndex + 1) {
					contactName = words[callIndex + 1];
				}
			}

			onAddTask({
				id: Math.random().toString(36).substr(2, 9),
				type: taskType,
				contactName: contactName || undefined,
				message: transcript,
			});

			setTranscript('');
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>🎤 Add Task by Voice</Text>

			<TouchableOpacity
				style={[styles.button, isRecording ? styles.buttonActive : null]}
				onPress={isRecording ? stopRecording : startRecording}
			>
				<Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Voice Input'}</Text>
			</TouchableOpacity>

			{isRecording && <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 10 }} />}

			{transcript ? (
				<Text style={styles.transcript}>You said: "{transcript}"</Text>
			) : (
				<Text style={styles.instruction}>Press button and speak your task aloud.</Text>
			)}

			{error && <Text style={styles.error}>{error}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: '#e3f2fd',
		borderRadius: 16,
		marginVertical: 20,
		alignItems: 'center',
	},
	title: {
		fontSize: 20,
		fontWeight: '700',
		marginBottom: 15,
		color: '#0d47a1',
	},
	button: {
		backgroundColor: '#2196F3',
		paddingVertical: 14,
		paddingHorizontal: 30,
		borderRadius: 25,
		marginBottom: 12,
	},
	buttonActive: {
		backgroundColor: '#1565c0',
	},
	buttonText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 16,
	},
	transcript: {
		marginTop: 15,
		fontStyle: 'italic',
		fontSize: 16,
		color: '#333',
		textAlign: 'center',
	},
	instruction: {
		marginTop: 15,
		fontSize: 14,
		color: '#555',
		fontStyle: 'italic',
	},
	error: {
		marginTop: 15,
		color: 'red',
		fontWeight: '700',
	},
});
