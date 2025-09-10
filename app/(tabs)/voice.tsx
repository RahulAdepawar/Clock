import { View, Text, StyleSheet } from 'react-native';
import VoiceSelector from '@/components/VoiceSelector';
import VoiceTaskSetter from '@/components/VoiceTaskSetter';
import React, { useState, useEffect } from 'react';

type Task = {
  id: string;
  time?: string;
  type: 'reminder' | 'call';
  contactName?: string;
  message: string;
};

export default function VoiceScreen() {
	const [tasks, setTasks] = useState<Task[]>([]);

	const addTask = (task: Task) => {
		setTasks((prev) => [task, ...prev]);
	};

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text style={styles.title}>Voice Recognition Screen</Text>
			{/* <VoiceSelector /> */}
			<VoiceTaskSetter onAddTask={addTask} />
		</View>
	);
}


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
