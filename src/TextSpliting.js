export default function wrapWordsInSpan(elementclass, spanclass) {
    const element = document.querySelectorAll(`.${elementclass}`);

    if (!element) {
        console.error('Element not found!');
        return;
    }


    element.forEach(element => {

        const words = element.innerText.split(' '); // split by space
        const classString = Array.isArray(spanclass) ? spanclass.join(' ') : '';
        const spans = words.map(word => `<span class="${classString}">${word}</span>`);
        element.innerHTML = spans.join(' '); // join them back with space
    })
}


