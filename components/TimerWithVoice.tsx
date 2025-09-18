// TimerWithVoice.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import * as Speech from 'expo-speech';
import { Animated } from 'react-native';

interface TimerWithVoiceProps {
	initialMinutes?: number;
}

const TimerWithVoice: React.FC<TimerWithVoiceProps> = ({ initialMinutes = 5 }) => {
	const animation = useRef(new Animated.Value(1)).current;

	const totalSeconds = initialMinutes * 60;
	const [hoursInput, setHoursInput] = useState('0');
	const [minutesInput, setMinutesInput] = useState('5');
	const [secondsInput, setSecondsInput] = useState('0');

	const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
	const [isRunning, setIsRunning] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const intervalRef = useRef<number | null>(null);


	const handleTimeInputChange = (
		value: string,
		setFunc: React.Dispatch<React.SetStateAction<string>>,
		max: number
	) => {
		const cleaned = value.replace(/[^0-9]/g, ''); // Remove non-numeric
		let num = parseInt(cleaned, 10);
		if (isNaN(num)) {
			setFunc('0');
		} else {
			if (num > max) num = max;
			setFunc(num.toString());
		}
	};

	// Convert inputs to total seconds
	const getTotalSeconds = () => {
		const h = parseInt(hoursInput) || 0;
		const m = parseInt(minutesInput) || 0;
		const s = parseInt(secondsInput) || 0;
		return h * 3600 + m * 60 + s;
	};

	// Start or resume timer
	const startTimer = () => {
		if (intervalRef.current !== null) return;

		const totalSeconds = isPaused ? secondsLeft : getTotalSeconds();
		if (totalSeconds <= 0) return;

		setSecondsLeft(totalSeconds);
		setIsRunning(true);
		setIsPaused(false);

		intervalRef.current = setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					clearInterval(intervalRef.current!);
					intervalRef.current = null;
					setIsRunning(false);
					Speech.speak('Time is up');
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	// Pause timer
	const pauseTimer = () => {
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
			setIsPaused(true);
			setIsRunning(false);
			Speech.speak('Timer paused');
		}
	};

	// Stop and reset timer
	const stopTimer = () => {
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setSecondsLeft(totalSeconds);
		setIsRunning(false);
		setIsPaused(false);
		Speech.speak('Timer stopped');
	};

	// Voice updates
	useEffect(() => {
		if (!isRunning || secondsLeft === 0) return;
		Animated.sequence([
			Animated.timing(animation, {
				toValue: 1.2,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(animation, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start();

		if (secondsLeft % 60 === 0 && secondsLeft > 10) {
			Speech.speak(`${secondsLeft / 60} minutes remaining`);
		}

		if (secondsLeft <= 10 && secondsLeft > 0) {
			Speech.speak(`${secondsLeft}`);
		}
	}, [secondsLeft, isRunning]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	const formatTime = () => {
		const hours = Math.floor(secondsLeft / 3600);
		const minutes = Math.floor((secondsLeft % 3600) / 60);
		const seconds = secondsLeft % 60;

		return `${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			{!isRunning && !isPaused && (
				<View style={styles.inputRow}>
					<TextInput
						style={styles.input}
						keyboardType="number-pad"
						maxLength={2}
						editable={!isRunning}
						value={hoursInput}
						onChangeText={(text) => handleTimeInputChange(text, setHoursInput, 99)}
						placeholder="HH"
					/>

					<TextInput
						style={styles.input}
						keyboardType="number-pad"
						maxLength={2}
						editable={!isRunning}
						value={minutesInput}
						onChangeText={(text) => handleTimeInputChange(text, setMinutesInput, 59)}
						placeholder="MM"
					/>

					<TextInput
						style={styles.input}
						keyboardType="number-pad"
						maxLength={2}
						editable={!isRunning}
						value={secondsInput}
						onChangeText={(text) => handleTimeInputChange(text, setSecondsInput, 59)}
						placeholder="SS"
					/>
				</View>
			)}

			<Animated.Text
				style={[
					styles.timerText,
					{
						transform: [{ scale: animation }],
						opacity: animation.interpolate({
							inputRange: [0.9, 1.2],
							outputRange: [0.7, 1],
						}),
					},
				]}
			>
				{formatTime()}
			</Animated.Text>

			<View style={styles.buttonRow}>
				{!isRunning && !isPaused && <Button title="Start" onPress={startTimer} />}
				{isRunning && <Button title="Pause" onPress={pauseTimer} />}
				{isPaused && <Button title="Resume" onPress={startTimer} />}
				<Button title="Stop" onPress={stopTimer} disabled={!isRunning && !isPaused} />
			</View>
		</KeyboardAvoidingView>
	);
};

export default TimerWithVoice;

const styles = StyleSheet.create({
	container: {
		padding: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	timerText: {
		fontSize: 48,
		fontWeight: 'bold',
		marginBottom: 20,
		color: 'white'
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 20,
	},
	buttonRow: {
		flexDirection: 'row',
		gap: 10,
	},
	inputRow: {
		flexDirection: 'row',
		marginBottom: 20,
		alignItems: 'center',
	},
	input: {
		width: 60,
		height: 50,
		borderColor: '#ccc',
		color: '#ffffff',
		borderWidth: 1,
		textAlign: 'center',
		fontSize: 24,
		marginHorizontal: 4,
		borderRadius: 8,
	},
	colon: {
		fontSize: 30,
		fontWeight: 'bold',
	},
});
