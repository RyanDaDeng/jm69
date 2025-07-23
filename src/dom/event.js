export function addEventListeners(promotionElements, observer, addPromotionEvent) {
    promotionElements.forEach((element) => {
        addPromotionEvent(element, observer);
    });
}
