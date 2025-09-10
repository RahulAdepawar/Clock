import React, { useEffect, useState, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Animated,
	Easing,
} from 'react-native';

export default function Clock() {
	const [time, setTime] = useState({
		hours: '',
		minutes: '',
		seconds: '',
		ampm: '',
		dateString: '',
	});

	// Animation refs
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.8)).current;
	const pulseAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		const updateClock = () => {
			const now = new Date();
			const hours = now.getHours();
			const minutes = now.getMinutes();
			const seconds = now.getSeconds();
			const ampm = hours >= 12 ? 'PM' : 'AM';
			const formattedHours = hours % 12 || 12;

			const options: Intl.DateTimeFormatOptions = {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			};
			const dateString = now.toLocaleDateString(undefined, options);

			setTime({
				hours: formattedHours.toString().padStart(2, '0'),
				minutes: minutes.toString().padStart(2, '0'),
				seconds: seconds.toString().padStart(2, '0'),
				ampm,
				dateString,
			});
		};

		// Animate clock in
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true,
			}),
			Animated.spring(scaleAnim, {
				toValue: 1,
				friction: 5,
				useNativeDriver: true,
			}),
		]).start();

		// Pulse animation for seconds
		Animated.loop(
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1.2,
					duration: 500,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 500,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			])
		).start();

		const interval = setInterval(updateClock, 1000);
		updateClock(); // initial call

		return () => clearInterval(interval);
	}, []);

	return (
		<Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
			<Text style={styles.date}>{time.dateString}</Text>
			<View style={styles.timeContainer}>
				<Text style={styles.timeText}>{time.hours}</Text>
				<Text style={styles.timeText}>:</Text>
				<Text style={styles.timeText}>{time.minutes}</Text>
				<Animated.Text
					style={[
						styles.timeText,
						{ transform: [{ scale: pulseAnim }], color: '#FF6F61' },
					]}>
					:{time.seconds}
				</Animated.Text>
				<Text style={styles.ampm}>{time.ampm}</Text>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 30,
		backgroundColor: 'linear-gradient(45deg, #6a11cb, #2575fc)', // Can't use gradient directly, see note
		borderRadius: 20,
		shadowColor: '#000',
		shadowOpacity: 0.25,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 5 },
		elevation: 10,
	},

	// For React Native gradient, you’ll need expo-linear-gradient or react-native-linear-gradient.
	// Here, just use solid color as fallback.
	date: {
		fontSize: 18,
		color: '#e0e0e0',
		fontWeight: '600',
		marginBottom: 12,
	},

	timeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	timeText: {
		fontSize: 60,
		color: 'white',
		fontWeight: '700',
		letterSpacing: -2,
	},

	ampm: {
		fontSize: 22,
		color: 'white',
		marginLeft: 10,
		marginTop: 18,
		fontWeight: '600',
	},
});
