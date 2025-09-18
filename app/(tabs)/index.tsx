import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Clock from '@/components/Clock'; // adjust path based on your folder structure

export default function HomeScreen() {
	return (
		<LinearGradient colors={['#1d1624ff', '#0b0b0cff']} style={styles.gradient}>
			<Clock />
		</LinearGradient>
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
