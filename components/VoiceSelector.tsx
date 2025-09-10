import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

export default function VoiceSelector() {
	const [voices, setVoices] = useState<Speech.Voice[]>([]);
	const [maleVoices, setMaleVoices] = useState<Speech.Voice[]>([]);
	const [femaleVoices, setFemaleVoices] = useState<Speech.Voice[]>([]);
	const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
	const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('female');

	useEffect(() => {
		(async () => {
			const availableVoices = await Speech.getAvailableVoicesAsync();
			setVoices(availableVoices);

			// Filter voices by gender keywords in name
			const males = availableVoices.filter(v =>
				v.language.startsWith('en') && v.name.toLowerCase().includes('male')
			);

			const females = availableVoices.filter(v =>
				v.language.startsWith('en') && v.name.toLowerCase().includes('female')
			);

			setMaleVoices(males.length > 0 ? males : availableVoices);
			setFemaleVoices(females.length > 0 ? females : availableVoices);

			// Default voice based on selectedGender
			if (selectedGender === 'female' && females.length > 0) {
				setSelectedVoice(females[0].identifier);
			} else if (selectedGender === 'male' && males.length > 0) {
				setSelectedVoice(males[0].identifier);
			} else if (availableVoices.length > 0) {
				setSelectedVoice(availableVoices[0].identifier);
			}
		})();
	}, []);

	// Update selectedVoice when selectedGender changes
	useEffect(() => {
		if (selectedGender === 'male' && maleVoices.length > 0) {
			setSelectedVoice(maleVoices[0].identifier);
		} else if (selectedGender === 'female' && femaleVoices.length > 0) {
			setSelectedVoice(femaleVoices[0].identifier);
		}
	}, [selectedGender, maleVoices, femaleVoices]);

	const speak = () => {
		if (selectedVoice) {
			Speech.speak('Hello, this is a voice test.', { voice: selectedVoice });
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Select Voice Gender</Text>

			<View style={styles.buttons}>
				<Button
					title="Female"
					onPress={() => setSelectedGender('female')}
					color={selectedGender === 'female' ? '#2196F3' : '#ccc'}
				/>
				<Button
					title="Male"
					onPress={() => setSelectedGender('male')}
					color={selectedGender === 'male' ? '#2196F3' : '#ccc'}
				/>
			</View>

			<Button title="Test Voice" onPress={speak} />

			<Text style={styles.note}>Selected voice ID: {selectedVoice}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { padding: 20, alignItems: 'center' },
	title: { fontSize: 18, marginBottom: 10 },
	buttons: { flexDirection: 'row', marginBottom: 20, gap: 10 },
	note: { marginTop: 20, fontSize: 12, color: '#555' },
});
