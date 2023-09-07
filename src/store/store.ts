import { v4 as uuidv4 } from 'uuid';
import { writable } from 'svelte/store';

interface TextStore {
	inputText: string;
	outputText: string[];
	questions: any[];
	conversationId: string;
}

export const textStore = writable<TextStore>({
	inputText: '',
	outputText: [],
	questions: [],
	conversationId: uuidv4()
});

export default textStore;
