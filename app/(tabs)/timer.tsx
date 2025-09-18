import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import TimerWithVoice from '@/components/TimerWithVoice'; // adjust path based on your folder structure

export default function HomeScreen() {
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<TimerWithVoice initialMinutes={1} />
		</View>
	);
}

const styles = StyleSheet.create({
	gradient: {
		flex: 1,            // Make sure gradient fills whole screen
		alignItems: 'center',
		justifyContent: 'center',
		padding: 30,
	},
});
