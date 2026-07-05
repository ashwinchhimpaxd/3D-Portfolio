import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function wrapWordsInSpan(elementclass, spanclass) {
    const elements = document.querySelectorAll(`.${elementclass}`);

    if (!elements || elements.length === 0) {
        return;
    }

    const classString = Array.isArray(spanclass) ? spanclass.join(' ') : '';
    elements.forEach(element => {

        // Extract gradient-text and place it on the inner span to avoid Chrome's background-clip + transform rendering bug
        let outerClasses = classString;
        let innerClasses = 'inner-word';
        if (classString.includes('gradient-text')) {
            outerClasses = classString.replace(/\bgradient-text\b/g, '').trim();
            innerClasses += ' gradient-text';
        }

        // Split text into words using GSAP's SplitText
        const split = new SplitText(element, { type: "words", tag: "span" });

        // Add classes and inner span to each split word element
        split.words.forEach(wordNode => {
            if (outerClasses) {
                wordNode.className = `${wordNode.className} ${outerClasses}`;
            }

            const wordText = wordNode.innerText;
            // Create the inner span inside the outer span
            wordNode.innerHTML = `<span class="${innerClasses}">${wordText}</span>`;
        });
    });
}