import { calculateMD5 } from "../api/crypto.js";

export function cutImage(image, comicId, page) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const sliceCount = getSliceCount(comicId, page);
    const sliceHeight = Math.floor(canvas.height / sliceCount);
    const remainingHeight = canvas.height % sliceCount;

    context.drawImage(
        image,
        0,
        canvas.height - sliceHeight - remainingHeight,
        canvas.width,
        sliceHeight + remainingHeight,
        0,
        0,
        canvas.width,
        sliceHeight + remainingHeight
    );
    for (let i = 0; i < sliceCount - 1; i++) {
        context.drawImage(
            image,
            0,
            sliceHeight * (sliceCount - i - 2),
            canvas.width,
            sliceHeight,
            0,
            (i + 1) * sliceHeight + remainingHeight,
            canvas.width,
            sliceHeight
        );
    }

    /**
     * 获取裁剪数量
     * @returns {number} 裁剪数量
     */
    function getSliceCount() {
        if (comicId >= 220980 && comicId < 268850) {
            return 10;
        }
        const hashData = calculateMD5(comicId + page);
        let key = hashData.charCodeAt(hashData.length - 1);
        if (comicId >= 268850 && comicId <= 421925) {
            key = key % 10;
        } else {
            key = key % 8;
        }
        if (key >= 0 && key <= 9) {
            return key * 2 + 2;
        } else {
            return 10;
        }
    }

    return canvas;
}

export function infinityScroll(observer, parent, loadContent) {
    let isLoadingComplete = true;
    let currentPage = 1;
    for (let item of parent.querySelectorAll(".b-waiting")) {
        observer.observe(item);
    }
    function onScrollEvent() {
        if (
            Math.ceil(document.documentElement.scrollTop + innerHeight) >=
                document.body.offsetHeight &&
            isLoadingComplete
        ) {
            isLoadingComplete = false;
            loadContent(++currentPage, removeScrollEvent).then(() => {
                isLoadingComplete = true;
                for (let item of parent.querySelectorAll(".b-waiting")) {
                    observer.observe(item);
                }
            });
        }
    }
    function removeScrollEvent() {
        window.removeEventListener("scroll", onScrollEvent);
    }
    window.addEventListener("scroll", onScrollEvent);
}