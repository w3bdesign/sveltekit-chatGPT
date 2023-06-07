import textStore from './store';

/**
 * Adds a new question to the store and associates it with the provided output text.
 *
 * @param {number} questionId - The ID of the question to be added.
 * @param {any[]} outputText - The output text to associate with the new question.
 */
export function addQuestionAndAssociateOutput(questionId: number, outputText: any[]) {
	textStore.update((store) => {
		const newQuestion = {
			id: questionId,
			outputText: outputText
		};

		store.questions.push(newQuestion);
		store.outputText = [];

		return store;
	});
}
