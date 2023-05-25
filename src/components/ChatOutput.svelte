<script>
	import hljs from 'highlight.js';

	import 'highlight.js/styles/github-dark.css';

	import { CodeBlock } from '@skeletonlabs/skeleton';

	import { storeHighlightJs } from '@skeletonlabs/skeleton';

	/**
	 * @type {any[]}
	 */
	export let outputText = [];

	let testText = `[1]: https://stackoverflow.com/questions/45630965/loop-through-list-of-objects-that-contain-a-true-boolean-field-value-using-java "Loop through List of Objects that contain a true Boolean field value ..." [2]: https://stackoverflow.com/questions/30144551/how-do-i-return-2-boolean-values-from-a-while-loop-java "How do i return 2 boolean values from a while loop? Java" [3]: https://stackoverflow.com/questions/26824526/how-to-return-boolean-statement-if-list-has-duplicates "How to return boolean statement if list has duplicates?" [4]: https://stackoverflow.com/questions/59336346/can-you-return-a-boolean-value-in-loop-in-this-condition "Can you return a Boolean value in loop in this condition" [5]: https://stackoverflow.com/questions/54771478/how-to-use-stream-on-method-that-return-boolean-value-with-condition "java - How to use stream on method that return boolean value with ..." [6]: https://www.freecodecamp.org/news/how-to-iterate-over-objects-in-javascript/ "Loop Through an Object in JavaScript – How to Iterate Over an Object in JS" You can loop through the object and return a boolean if any emails have seen set to 0 by using the following code: \`\`\`javascript let mail = { "mail": [ { "id": 1, "sentTo": 9, "time": 0, "news": "test news", "seen": 1, "header": "test header" }, { "id": 2, "sentTo": 9, "time": 0, "news": "test news", "seen": 0, "header": "test header" } ] }; let isSeenSetToZero = false; for (let i = 0; i < mail.mail.length; i++) { if (mail.mail[i].seen === 0) { isSeenSetToZero = true; break; } } console.log(isSeenSetToZero); \`\`\` This will loop through the object and return a boolean if any emails have seen set to 0. In this case, it will return true because the second email has seen set to 0. I hope this helps! Let me know if you have any other questions.`;

	let codeRegex = /```javascript([\s\S]*?)```/;
	let codeMatch = testText.match(codeRegex);
	let code = codeMatch ? codeMatch[1] : '';
	let newTestText = testText.replace(codeRegex, 'CODE_BLOCK');
	let linkRegex = /\[\d+\]:\s*(.+?)\s*"(.*?)"\s*/g;
	let links = [...newTestText.matchAll(linkRegex)].map((match) => ({
		url: match[1],
		text: match[2]
	}));
	newTestText = newTestText.replace(linkRegex, '');
	let [textBeforeCode, textAfterCode] = newTestText.split('CODE_BLOCK');

	storeHighlightJs.set(hljs);
</script>

<svelte:body on:load={() => hljs.highlightAll()} />

<div class="mt-4 mb-4">
	<div class="mt-2 border shadow rounded p-4 w-[20rem] md:w-[40rem] relative bg-slate-50">
		<div class="p-2">
			{@html textBeforeCode}
			<div class="py-6">
				<CodeBlock language="javascript" {code} />
			</div>
			{@html textAfterCode}
			<div class="py-2">
				<h2 class="text-xl py-4 font-bold text-center">Sources</h2>
				{#each links as link}
					<div class="py-1 px-2">
						<a class="chip variant-filled w-full text-sm" href={link.url} target="_blank">{link.text}</a>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
