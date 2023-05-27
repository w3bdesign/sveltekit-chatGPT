import { writable } from 'svelte/store';

interface TextStore {
	inputText: string;
	outputText: string[];
}

const textStore = writable<TextStore>({ inputText: '', outputText: [] });

export default textStore;
