export function createBookItemObserver() {
    const observer= new IntersectionObserver((entries)=>{
        for (let entry of entries) {
            if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                entry.target.classList.remove("b-waiting");
                const cover = entry.target.children[0];
                const coverImg = cover.children[0];
                coverImg.src = cover.dataset.src;
            }
        }
    }, { rootMargin: "50px" });
    return observer
}

export function createResizeObserver(callback) {
    return new ResizeObserver(callback);
}