import { writable } from 'svelte/store';

interface TextStore {
	inputText: string;
	outputText: string[];
	questions: any[];
}

const textStore = writable<TextStore>({ inputText: '', outputText: [], questions: [] });

export function addQuestionAndAssociateOutput(questionId: number, outputText: any[]) {
	textStore.update(store => {
	  const newQuestion = {
		id: questionId,
		outputText: outputText
	  };
  
	  store.questions.push(newQuestion);
	  store.outputText = [];
  
	  return store;
	});
  }



export default textStore;
