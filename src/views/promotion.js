import appState from "../store/appState.js";

export function createBookItemsHTML(content) {
    return content
        .map((bookData) => {
            return `
        <div class="book-item b-waiting" data-cid="${bookData.id}">
            <div class="b-cover" data-src="https://${appState.serverInfo.Server[0]}/media/albums/${bookData.id}_3x4.jpg">
                <img alt="封面" />
            </div>
            <div class="b-right">
                <div class="b-title">${bookData.name}</div>
                <div class="b-anchor">${bookData.author}</div>
            </div>
        </div>
        `;
        })
        .join("");
}

export function createComicPromotionHTML(promotion) {
    const bookItemsHTML = createBookItemsHTML(promotion.content);
    return `
        <div class="comic-promote" id="${promotion.title}">
            <h1>${promotion.title}</h1>
            <div class="scroll-block">
                <div class="inner">${bookItemsHTML}</div>
                <div class="next-btn"></div>
            </div>
            <div class="scroll-bar">
                <div class="bar-inner"></div>
            </div>
        </div>
    `;
}