import { writable } from 'svelte/store';

interface TextStore {
	inputText: string;
	outputText: string[];
	questions: any[];
}

export const textStore = writable<TextStore>({ inputText: '', outputText: [], questions: [] });

export default textStore;
