import js_beautify from "js-beautify";

export function processText(text: string) {
    let codeRegex = /```javascript([\s\S]*?)```/;
    let codeMatch = text.match(codeRegex);
    let code = codeMatch ? codeMatch[1] : '';
    let prettifiedCode = js_beautify(code);

    let newText = text.replace(codeRegex, 'CODE_BLOCK');
    let linkRegex = /\[\d+\]:\s*(.+?)\s*"(.*?)"\s*/g;
    let links = [...newText.matchAll(linkRegex)].map((match) => ({
        url: match[1],
        text: match[2]
    }));
    newText = newText.replace(linkRegex, '');
    let [textBeforeCode, textAfterCode] = newText.split('CODE_BLOCK');

    return { prettifiedCode, links, textBeforeCode, textAfterCode };
}