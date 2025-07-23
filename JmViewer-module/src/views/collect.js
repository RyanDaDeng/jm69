import { createBookItemObserver } from "../dom/observer.js";
import { createBookItemsHTML } from "./promotion.js";

export function updateCollectPage() {
    const storage = JSON.parse(localStorage.getItem("collect") || "[]");

    const main = document.querySelector(".main");
    const observer = createBookItemObserver();
    main.innerHTML = createBookItemsHTML(storage);
    for (let item of main.children) {
        observer.observe(item);
        item.addEventListener("click", () => {
            open("./chapter.html?cid=" + item.dataset.cid);
        });
    }
}