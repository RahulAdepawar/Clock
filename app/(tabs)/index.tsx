import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Clock from '@/components/Clock'; // adjust path based on your folder structure

export default function HomeScreen() {
	return (
		<LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradient}>
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
