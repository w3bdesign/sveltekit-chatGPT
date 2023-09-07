import textStore from './store';

/**
 * Adds a question and associates output to the store.
 *
 * @param {number} questionId - The ID of the question.
 * @param {any[]} outputText - An array of output texts.
 * @param {string} routeName - The name of the route.
 */
export function addQuestionAndAssociateOutput(
	questionId: number,
	outputText: any[],
	routeName: string
) {
	textStore.update((store) => {
		const newQuestion = {
			id: questionId,
			outputText: outputText,
			routeName: routeName
		};

		store.questions.push(newQuestion);
		store.outputText = [];

		return store;
	});
}
