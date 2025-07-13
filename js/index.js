function checkInternet() {
    if (!navigator.onLine) {
        alert("没有互联网连接！！");
        throw new Error("not online");
    }
}
async function retryFetch(...args) {
    let tryCount = args.pop();
    try {
        const resp = await fetch(...args);
        return resp;
    } catch (error) {
        if (tryCount <= 0) throw new Error(error);
        return retryFetch(...args, tryCount - 1);
    }
}
/**
 * 从指定 URL 获取服务器信息并解密
 * @returns {Promise<Object>} 解密后的服务器信息
 */
async function getServers() {
    // 从指定 URL 获取服务器信息文本
    const serverDataResponse = await retryFetch(
        "http://jmappc01-1308024008.cos.ap-guangzhou.myqcloud.com/server-2024.txt",
        3
    );
    const encryptedServerData = await serverDataResponse.text();

    // 使用 AES ECB 模式解密服务器信息
    const decryptedServerData = CryptoJS.AES.decrypt(
        encryptedServerData,
        CryptoJS.enc.Utf8.parse("6ae6b037507edb82ee4699827c4b4066"),
        {
            mode: CryptoJS.mode.ECB, // 使用 ECB 模式
        }
    );

    // 返回解密后的 JSON 数据
    return JSON.parse(decryptedServerData.toString(CryptoJS.enc.Utf8));
}

/**
 * 计算字符串的 MD5 哈希值
 * @param {string} inputStr 输入的字符串
 * @returns {string} MD5 哈希值
 */
function calculateMD5(inputStr) {
    return CryptoJS.MD5(inputStr).toString();
}

/**
 * 根据密钥生成令牌
 * @param {string} key 密钥
 * @returns {Object} 包含令牌和令牌参数的对象
 */
function generateToken(key) {
    return {
        token: calculateMD5(key + "185Hcomic3PAPP7R"),
        tokenParam: `${key},1.7.9`,
    };
}

// 预定义的密钥模板
const predefinedKeyTemplates = ["185Hcomic3PAPP7R", "18comicAPPContent"];

/**
 * 使用预定义的密钥模板解密数据
 * @param {string} key 密钥
 * @param {string} cipherText 加密文本
 * @returns {Object} 解密后的 JSON 数据
 * @throws {Error} 如果所有密钥模板都尝试失败，则抛出错误
 */
function decryptData(key, cipherText) {
    for (const template of predefinedKeyTemplates) {
        try {
            // 生成动态密钥
            const dynamicKey = calculateMD5(key + template);
            // 使用 AES ECB 模式解密数据
            const decryptedData = CryptoJS.AES.decrypt(
                cipherText,
                CryptoJS.enc.Utf8.parse(dynamicKey),
                {
                    mode: CryptoJS.mode.ECB,
                }
            );
            return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));
        } catch (error) {
            // 尝试下一个密钥模板
            continue;
        }
    }
    throw new Error("Decryption failed");
}

// 存储服务器信息
let serverInfo;
// 存储生成的令牌
let accessToken;
// 存储当前使用的密钥
let currentKey;

// 获取服务器信息并初始化
getServers().then(async (servers) => {
    serverInfo = servers;
    serverInfo.imgServer = ["cdn-msp.jmapiproxy1.cc"];
    // 生成当前时间戳作为密钥
    currentKey = Math.floor(Date.now() / 1000);
    accessToken = generateToken(currentKey);

    // 更新主页面内容
    updateMainPage();
});

/**
 * 获取推广内容
 * @returns {Promise<Object>} 推广内容
 */
async function getPromotionContent() {
    let cache = localStorage.getItem("promoteCache");
    if (cache) {
        cache = JSON.parse(cache);
        if (cache.date === new Date().toDateString()) {
            return cache.data;
        }
    }
    const promotionResponse = await retryFetch(
        `https://${serverInfo.Server[0]}/promote?page=1`,
        {
            headers: {
                token: accessToken.token,
                tokenParam: accessToken.tokenParam,
            },
            redirect: "follow",
        },
        3
    );
    const promotionData = await promotionResponse.json();
    const data = decryptData(currentKey, promotionData.data);
    localStorage.setItem(
        "promoteCache",
        JSON.stringify({
            date: new Date().toDateString(),
            data,
        })
    );
    return data;
}

/**
 * 获取最新内容
 * @param {number} page 页码
 * @returns {Promise<Object>} 最新内容
 */
async function getLatestContent(page) {
    const latestResponse = await retryFetch(
        `https://${serverInfo.Server[0]}/latest?page=${page}`,
        {
            headers: {
                token: accessToken.token,
                tokenParam: accessToken.tokenParam,
            },
            redirect: "follow",
        },
        3
    );
    const latestData = await latestResponse.json();
    return decryptData(currentKey, latestData.data);
}

/**
 * 获取搜索结果
 * @param {string} searchQuery 搜索关键词
 * @param {number} page 页码
 * @returns {Promise<Object>} 搜索结果
 */
async function getSearchResults(searchQuery, page) {
    const searchResponse = await retryFetch(
        `https://${serverInfo.Server[0]}/search?search_query=${searchQuery}&o=mv&page=${page}`,
        {
            headers: {
                token: accessToken.token,
                tokenParam: accessToken.tokenParam,
            },
            redirect: "follow",
        },
        3
    );
    const searchData = await searchResponse.json();
    return decryptData(currentKey, searchData.data);
}

function createIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        for (let entry of entries) {
            if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                entry.target.classList.remove("b-waiting");
                const cover = entry.target.children[0];
                const coverImg = cover.children[0];
                coverImg.src = cover.dataset.src;
            }
        }
    });
    return observer;
}
function infinityScroll(observer, parent, loadContent) {
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
/**
 * 更新主页面内容
 */
async function updateIndexPage() {
    // 获取推广内容
    const promotionContent = await getPromotionContent();
    const mainElement = document.querySelector(".main");
    mainElement.innerHTML = promotionContent
        .map((promotion) => {
            return createComicPromotionHTML(promotion);
        })
        .join("");
    // 添加事件监听器
    addEventListeners();
}
async function updateLatestPage() {
    // 获取第一页最新内容
    const latestContent = await getLatestContent(1);
    const latestComicsElement = document.querySelector(".comics-latest");
    latestComicsElement.innerHTML = createBookItemsHTML(latestContent);
    const observer = createIntersectionObserver();

    latestComicsElement.addEventListener("click", (event) => {
        if (event.target.className !== "comics-latest") {
            let targetElement = event.target;
            while (
                (targetElement = targetElement.parentNode).className !==
                "book-item"
            ) {}
            location.href = "./chapter.html?cid=" + targetElement.dataset.cid;
        }
    });
    infinityScroll(observer, latestComicsElement, async (currentPage) => {
        const newLatestContent = await getLatestContent(currentPage);
        latestComicsElement.innerHTML += createBookItemsHTML(newLatestContent);
    });
}
async function updateSearchPage() {
    const searchQuery = new URLSearchParams(location.search).get("wd");
    if (!searchQuery) {
        location.href = "./index.html";
    }

    // 获取第一页搜索结果
    const searchResults = await getSearchResults(searchQuery, 1);
    const searchResultsElement = document.querySelector(".comics-result");
    const noMoreEle = searchResultsElement.nextElementSibling;
    searchResultsElement.innerHTML = createBookItemsHTML(searchResults.content);
    const observer = createIntersectionObserver();
    const resultLength = 80;
    searchResultsElement.addEventListener("click", (event) => {
        if (event.target.className !== "comics-result") {
            let targetElement = event.target;
            while (
                (targetElement = targetElement.parentNode).className !==
                "book-item"
            ) {}
            open("./chapter.html?cid=" + targetElement.dataset.cid);
        }
    });
    if (searchResults.content.length < resultLength) {
        for (let item of searchResultsElement.querySelectorAll(".b-waiting")) {
            observer.observe(item);
        }
        noMoreEle.style.display = "block";
        return;
    }
    infinityScroll(
        observer,
        searchResultsElement,
        async (currentPage, removeScrollEvent) => {
            const result = await getSearchResults(searchQuery, currentPage);
            searchResultsElement.innerHTML += createBookItemsHTML(
                result.content
            );
            if (result.content.length < resultLength) {
                removeScrollEvent();
                noMoreEle.style.display = "block";
            }
        }
    );
}
function updateChapterPage() {
    const comicId = new URLSearchParams(location.search).get("cid");
    if (!Number.isInteger(+comicId) && comicId >= 10) {
        alert("comic-id格式错误！！！");
        location.href = "./index.html";
    }
    // 获取漫画专辑信息
    getComicAlbum(comicId).then((comicInfo) => {
        console.log(comicInfo);
        setComicInfo(comicInfo);
    });
    // 获取漫画章节信息
    getComicChapter(comicId).then((chapter) => {
        console.log(chapter);
        setComicImages(comicId, chapter.images);
    });
    window.addEventListener("resize", debounceFunction(setChapterTop, 200));
}
function updateMainPage() {
    if (
        location.pathname.includes("/index.html") ||
        location.pathname === "/"
    ) {
        updateIndexPage();
    } else if (location.pathname.includes("/latest.html")) {
        updateLatestPage();
    } else if (location.pathname.includes("/search.html")) {
        updateSearchPage();
    } else if (location.pathname.includes("/chapter.html")) {
        updateChapterPage();
    }
}

/**
 * 设置漫画信息
 * @param {Object} comicInfo 漫画信息
 */
function setComicInfo(comicInfo) {
    document.querySelector(
        ".comic-bg"
    ).style.backgroundImage = `url(https://${serverInfo.Server[0]}/media/albums/${comicInfo.id}_3x4.jpg)`;
    const coverImageElement = document.querySelector(".cover img");
    coverImageElement.src = `https://${serverInfo.Server[0]}/media/albums/${comicInfo.id}_3x4.jpg`;
    coverImageElement.title = comicInfo.description;
    const titleElement = document.querySelector(".title span");
    titleElement.innerHTML = comicInfo.name;
    titleElement.title = comicInfo.name;
    document.querySelector(".like span").innerText = `${convertToEnglishNumber(
        comicInfo.likes
    )}`;
    document.querySelector(".like i").innerText = `(${Math.floor(
        ((comicInfo.likes ? comicInfo.likes : 0) /
            (+comicInfo.total_views ? comicInfo.total_views : 1)) *
            100
    )}%)`;
    document.querySelector(".view span").innerText = convertToEnglishNumber(
        comicInfo.total_views
    );
    document.querySelector(".comic-id").textContent = "——" + comicInfo.id;
    document.querySelector(".author").textContent =
        "创作者：" + comicInfo.author.join(" & ");
    document.querySelector(".tags").innerHTML = comicInfo.tags
        .concat(comicInfo.actors)
        .map((tag) => (tag ? `<div class='tag'>${tag}</div>` : ""))
        .join("");
    const seriesElement = document.querySelector(".series");
    if (comicInfo.series.length) {
        seriesElement.parentNode.style.display = "block";
        seriesElement.innerHTML = comicInfo.series
            .map(
                (item, index) =>
                    `<div class="series-item" data-id="${item.id}">第${
                        index + 1
                    }部</div>`
            )
            .join("");
        const activeEle =
            seriesElement.children[
                comicInfo.series.findIndex((i) => i.id == comicInfo.id)
            ];
        activeEle.classList.add("active");
        seriesElement.scroll({
            left: activeEle.offsetLeft - seriesElement.offsetWidth / 2,
            behavior: "smooth",
        });
        seriesElement.addEventListener("click", (e) => {
            if (e.target.className === "series-item") {
                location.href = "./chapter.html?cid=" + e.target.dataset.id;
            }
        });
    }

    document.querySelector(
        ".forum h2"
    ).textContent = `评论(${convertToEnglishNumber(comicInfo.comment_total)})`;
    let currentForumPage = 1;
    const loadMoreButton = document.querySelector(".load-more-c");
    loadMoreButton.addEventListener("click", () => {
        loadMoreButton.style.display = "none";
        loadForumComments(comicInfo.id, ++currentForumPage).then(() => {
            loadMoreButton.style.display = "block";
        });
    });
    loadForumComments(comicInfo.id, 1);
}

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounceFunction(func, delay) {
    let timerId;
    return function (...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            func.apply(this, ...args);
        }, delay);
    };
}
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
/**
 * 根据当前时间获取最大请求数量
 * @returns {number} 最大请求数量
 */
function getMaxRequestCount() {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    if (currentHour <= 3) {
        return 1;
    } else if (currentHour >= 21) {
        return 1;
    } else if (currentHour >= 18) {
        return 3;
    }
    return 5;
}

/**
 * 设置漫画图片
 * @param {string} comicId 漫画 ID
 * @param {Array<string>} images 图片列表
 */
function setComicImages(comicId, images) {
    const imagesContainer = document.querySelector(".comic-imgs");
    const imagesNumberEle = document.querySelector(".imgs-num");
    const imagesLoadNumberEle = document.querySelector(".imgs-loaded-num");
    const controlCanvas = document.querySelector(".control-inner canvas");
    const controlBar = document.querySelector(".control-bar");
    const controlIndex = controlBar.children[0];
    const ctx = controlCanvas.getContext("2d");
    const maxRequestCount = getMaxRequestCount();
    let loadingImgCount = 0;
    let loadedImgCount = 0;
    const waitingImgs = [];
    const maxWaitingCount = 3;
    const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            if (entry.target.height > 0) {
                resizeObserver.unobserve(entry.target);
                let imageElement = entry.target.parentNode;
                imageElement.style.height = entry.target.height + "px";
                imageElement.ontransitionend = () => {
                    imageElement.ontransitionend = null;
                    imageElement.style.height = null;
                };
            }
        }
    });
    const intersectionObserver = new IntersectionObserver(
        (entries) => {
            // console.log(entries);

            for (let entry of entries) {
                if (entry.isIntersecting) {
                    // intersectionObserver.unobserve(entry.target)
                    const index = +entry.target.dataset.index + 1;
                    controlBar.style.top = (index / DomCount) * 100 + "%";
                    controlIndex.textContent = index;
                    if (entry.target.dataset.isIntersected) continue;
                    entry.target.dataset.isIntersected = "true";
                    const imgDom = entry.target.children[1];
                    const imgBg = entry.target.children[0];
                    if (loadingImgCount >= maxRequestCount) {
                        imgBg.textContent += " 排队中...";
                        waitingImgs.unshift(entry.target);
                        if (waitingImgs.length > maxWaitingCount) {
                            const ele = waitingImgs.pop();
                            ele.dataset.isIntersected = "";
                        }
                    } else {
                        _loadImg(entry.target);
                    }

                    imgDom.onload = () => {
                        loadedImgCount++;
                        loadingImgCount--;
                        imagesLoadNumberEle.textContent = `${loadedImgCount}(${(
                            (loadedImgCount / DomCount) *
                            100
                        ).toFixed(2)}%)`;
                        // console.log(imgDom,comicId,
                        resizeObserver.unobserve(imgDom);
                        entry.target.style.height = imgDom.height + "px";
                        if (comicId >= 220980 && !/.gif/.test(images[index])) {
                            const page = images[index - 1].substring(0, 5);
                            entry.target.append(
                                cutImage(imgDom, comicId, page)
                            );
                            imgDom.remove();
                        }

                        imgBg.remove();
                        _drawImgLoadEnd(index - 1);
                        const waitingImg = waitingImgs.pop();
                        if (!waitingImg) return;
                        _loadImg(waitingImg);
                    };
                    imgDom.onerror = () => {
                        loadingImgCount--;
                        entry.target.classList.add("error-img");
                        _drawImgLoadError(index - 1);
                        entry.target.addEventListener(
                            "click",
                            () => {
                                imgDom.src = entry.target.dataset.src;
                                imgBg.textContent = "加载中...";
                                entry.target.classList.remove("error-img");
                            },
                            {
                                once: true,
                            }
                        );
                        imgBg.textContent = "错误(点击重试)";
                    };
                }
            }
        },
        {
            rootMargin: "50px",
        }
    );
    const DomCount = images.length;
    const oneFrame = 10;
    let curCount = 0;

    imagesNumberEle.textContent = DomCount;
    function _loadImg(imgContainer) {
        const imgDom = imgContainer.children[1];
        const imgBg = imgContainer.children[0];
        imgBg.textContent = "加载中...";
        resizeObserver.observe(imgDom);
        imgDom.src = imgContainer.dataset.src;
        loadingImgCount++;
    }
    function _set() {
        for (let i = 0; i < oneFrame; i++) {
            const imgContainer = document.createElement("div");
            const imgBg = document.createElement("div");
            const imgDom = new Image();
            imgContainer.className = "image";
            imgContainer.style.height = "500px";
            imgContainer.dataset.src = `https://${serverInfo.imgServer[0]}/media/photos/${comicId}/${images[curCount]}`;
            imgContainer.dataset.index = curCount;
            intersectionObserver.observe(imgContainer);
            imgBg.className = "image-bg";
            imgBg.textContent = curCount + 1;
            imgContainer.append(imgBg, imgDom);
            imagesContainer.append(imgContainer);
            // _drawDomLoadEnd(curCount)
            curCount++;

            if (curCount === DomCount) return;
        }
        // ctx.fill()
        if (curCount < DomCount) requestAnimationFrame(_set);
    }
    const chunkHeight = controlCanvas.height / DomCount;
    // console.log(chunkHeight);

    function _drawImgLoadEnd(index) {
        ctx.fillStyle = "#db547c";
        ctx.fillRect(
            0,
            Math.floor(index * chunkHeight),
            controlCanvas.width,
            Math.ceil(chunkHeight)
        );
    }
    function _drawImgLoadError(index) {
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(
            0,
            Math.floor(index * chunkHeight),
            controlCanvas.width,
            Math.ceil(chunkHeight)
        );
    }
    let elementTop = 0;
    let touchY = 0;
    function dragStart(y) {
        // console.log('start',y);
        controlIndex.classList.add("draging");
        let progress = y / controlCanvas.offsetHeight;
        controlIndex.textContent = Math.ceil(progress * (DomCount - 1)) + 1;
        controlBar.style.top = progress * 100 + "%";
    }
    function draging(y) {
        if (y < 0) y = 0;
        else if (y > controlCanvas.offsetHeight) y = controlCanvas.offsetHeight;
        let progress = y / controlCanvas.offsetHeight;
        controlIndex.textContent = Math.ceil(progress * (DomCount - 1)) + 1;
        controlBar.style.top = progress * 100 + "%";
    }
    function dragEnd(y) {
        controlIndex.classList.remove("draging");
        if (y < 0) y = 0;
        else if (y > controlCanvas.offsetHeight) y = controlCanvas.offsetHeight;
        let progress = y / controlCanvas.offsetHeight;
        const ele =
            imagesContainer.children[Math.ceil(progress * (DomCount - 1))];
        if (ele) ele.scrollIntoView();
    }
    function onMouseMove(e) {
        draging(e.clientY - elementTop);
    }
    function onMouseUp(e) {
        dragEnd(e.clientY - elementTop);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    }
    controlCanvas.addEventListener("mousedown", (e) => {
        elementTop = controlCanvas.getBoundingClientRect().top;
        dragStart(e.layerY);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    });
    controlCanvas.addEventListener(
        "touchstart",
        (e) => {
            elementTop = controlCanvas.getBoundingClientRect().top;
            touchY = e.touches[0].clientY - elementTop;
            dragStart(touchY);
            e.preventDefault();
        },
        {
            passive: false,
        }
    );
    controlCanvas.addEventListener(
        "touchmove",
        (e) => {
            touchY = e.touches[0].clientY - elementTop;
            draging(touchY);
        },
        {
            passive: false,
        }
    );
    controlCanvas.addEventListener("touchend", (e) => {
        dragEnd(touchY);
    });
    _set();
}
/**
 * 裁剪图片
 * @param {HTMLImageElement} image 图片元素
 * @param {string} comicId 漫画 ID
 * @param {string} page 页码
 * @returns {HTMLCanvasElement} 裁剪后的画布元素
 */
function cutImage(image, comicId, page) {
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

/**
 * 将数字转换为英文格式（千位加 k）
 * @param {number} num 输入的数字
 * @returns {string} 转换后的字符串
 */
function convertToEnglishNumber(num) {
    if (!num) return 0;
    return num >= 1000 ? (num / 1000).toFixed(2) + "k" : num;
}

/**
 * 加载论坛评论
 * @param {string} albumId 专辑 ID
 * @param {number} page 页码
 */
const chapterEle = document.querySelector(".chapter");
function setChapterTop() {
    let top = -chapterEle.offsetHeight + innerHeight - 200;
    chapterEle.style.top = (top < 50 ? top : 50) + "px";
}
async function loadForumComments(albumId, page) {
    const forumResponse = await retryFetch(
        `https://${serverInfo.Server[0]}/forum?page=${page}&mode=manhua&aid=${albumId}`,
        {
            headers: {
                token: accessToken.token,
                tokenParam: accessToken.tokenParam,
            },
            redirect: "follow",
        },
        3
    );
    const forumData = await forumResponse.json();
    const commentList = decryptData(currentKey, forumData.data).list;
    document.querySelector(".forum-inner").innerHTML += commentList
        .map((comment) => {
            if (comment.photo === "nopic-Male.gif") {
                comment.photo = "./images/default.jpeg";
            } else {
                comment.photo = `https://${serverInfo.Server[0]}/media/users/${comment.photo}`;
            }
            return `
        <div class="f-item">
            <div class="user-msg">
                <div class="user-img">
                    <img src="${comment.photo}" alt="">
                </div>
                <div class="user-name">${comment.username}</div>
            </div>
            <div class="f-text">${comment.content}</div>
        </div>
        `;
        })
        .join("");
    setChapterTop();
}

/**
 * 创建书籍项 HTML
 * @param {Array<Object>} content 书籍内容列表
 * @returns {string} HTML 字符串
 */
function createBookItemsHTML(content) {
    return content
        .map((bookData) => {
            return `
        <div class="book-item b-waiting" data-cid="${bookData.id}">
            <div class="b-cover" data-src="https://${serverInfo.Server[0]}/media/albums/${bookData.id}_3x4.jpg">
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

/**
 * 创建漫画推广 HTML
 * @param {Object} promotion 推广内容
 * @returns {string} HTML 字符串
 */
function createComicPromotionHTML(promotion) {
    const bookItemsHTML = createBookItemsHTML(promotion.content);
    let promotionHTML = `
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
    return promotionHTML;
}

/**
 * 为推广元素添加事件监听器
 * @param {HTMLElement} element 推广元素
 */
function addPromotionEvent(element, observer) {
    let currentLeft = 0;
    let itemCount = 15;
    const scrollBarInner = element.querySelector(".bar-inner");
    const nextButton = element.querySelector(".next-btn");
    const innerElement = element.querySelector(".inner");
    for (let item of innerElement.children) {
        observer.observe(item);
    }
    nextButton.addEventListener("click", () => {
        if (currentLeft === itemCount - 1) return;
        currentLeft++;
        innerElement.style.transform = `translateX(-${currentLeft * 300}px)`;
        scrollBarInner.style.marginLeft =
            currentLeft * ((1 / itemCount) * 100) + "%";
    });
    scrollBarInner.style.width = (1 / itemCount) * 100 + "%";
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let isMouseDown = false;
    let isHorizontalDrag = false;
    let clickStartTime = 0;

    /**
     * 鼠标按下事件处理函数
     * @param {MouseEvent} event 鼠标事件
     */
    function onMouseDown(event) {
        startX = event.pageX;
        innerElement.style.transition = "none";
        scrollBarInner.style.transition = "none";
        isMouseDown = true;
        event.preventDefault();
        clickStartTime = Date.now();
    }

    /**
     * 鼠标移动事件处理函数
     * @param {MouseEvent} event 鼠标事件
     */
    function onMouseMove(event) {
        if (!isMouseDown) return;
        event.preventDefault();
        deltaX = event.pageX - startX;
        innerElement.style.transform = `translateX(-${
            currentLeft * 300 - deltaX
        }px)`;
        scrollBarInner.style.marginLeft =
            (currentLeft - deltaX / 300) * ((1 / itemCount) * 100) + "%";
    }

    /**
     * 鼠标抬起事件处理函数
     * @param {MouseEvent} event 鼠标事件
     */
    function onMouseUp(event) {
        if (!isMouseDown) return;
        isMouseDown = false;
        innerElement.style.transition = null;
        scrollBarInner.style.transition = null;
        if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                currentLeft -= Math.ceil(deltaX / 300);
            } else {
                currentLeft -= Math.floor(deltaX / 300);
            }
            if (currentLeft > itemCount - 1) currentLeft = itemCount - 1;
            else if (currentLeft < 0) currentLeft = 0;
        }
        if (Math.abs(deltaX) < 5 && Date.now() - clickStartTime < 200) {
            let targetElement = event.target;
            if (targetElement.className !== "inner") {
                while (
                    (targetElement = targetElement.parentNode).className !==
                    "book-item"
                ) {}
                open("./chapter.html?cid=" + targetElement.dataset.cid);
            }
        }
        innerElement.style.transform = `translateX(-${currentLeft * 300}px)`;
        scrollBarInner.style.marginLeft =
            currentLeft * ((1 / itemCount) * 100) + "%";
        deltaX = 0;
        startX = 0;
    }

    /**
     * 触摸开始事件处理函数
     * @param {TouchEvent} event 触摸事件
     */
    function onTouchDown(event) {
        startX = event.touches[0].pageX;
        startY = event.touches[0].pageY;
        innerElement.style.transition = "none";
        scrollBarInner.style.transition = "none";
        isMouseDown = true;
        innerElement.addEventListener(
            "touchmove",
            (e) => {
                if (
                    Math.abs(e.touches[0].pageX - startX) >
                    Math.abs(e.touches[0].pageY - startY)
                ) {
                    isHorizontalDrag = true;
                } else {
                    isMouseDown = false;
                    innerElement.style.transition = null;
                    scrollBarInner.style.transition = null;
                }
            },
            { once: true, passive: true }
        );
        clickStartTime = Date.now();
    }

    /**
     * 触摸移动事件处理函数
     * @param {TouchEvent} event 触摸事件
     */
    function onTouchMove(event) {
        if (!isMouseDown) return;
        if (isHorizontalDrag) {
            event.preventDefault();
        }
        deltaX = event.touches[0].pageX - startX;
        innerElement.style.transform = `translateX(-${
            currentLeft * 300 - deltaX
        }px)`;
        scrollBarInner.style.marginLeft =
            (currentLeft - deltaX / 300) * ((1 / itemCount) * 100) + "%";
    }

    /**
     * 触摸结束事件处理函数
     * @param {TouchEvent} event 触摸事件
     */
    function onTouchUp(event) {
        if (!isMouseDown) return;
        isMouseDown = false;
        innerElement.style.transition = null;
        scrollBarInner.style.transition = null;
        if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                currentLeft -= Math.ceil(deltaX / 300);
            } else {
                currentLeft -= Math.floor(deltaX / 300);
            }
            if (currentLeft > itemCount - 1) currentLeft = itemCount - 1;
            else if (currentLeft < 0) currentLeft = 0;
        }
        if (Math.abs(deltaX) < 5 && Date.now() - clickStartTime < 200) {
            let targetElement = event.target;
            if (targetElement.className !== "inner") {
                while (
                    (targetElement = targetElement.parentNode).className !==
                    "book-item"
                ) {}
                open("./chapter.html?cid=" + targetElement.dataset.cid);
            }
        }
        innerElement.style.transform = `translateX(-${currentLeft * 300}px)`;
        scrollBarInner.style.marginLeft =
            currentLeft * ((1 / itemCount) * 100) + "%";
        deltaX = 0;
        startX = 0;
    }

    innerElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    innerElement.addEventListener("touchstart", onTouchDown, {
        passive: true,
    });
    innerElement.addEventListener("touchmove", onTouchMove, {
        cancelable: false,
    });
    innerElement.addEventListener("touchend", onTouchUp, {
        passive: true,
    });
}

/**
 * 添加事件监听器
 */
function addEventListeners() {
    const promotionElements = document.querySelectorAll(".comic-promote");
    const observer = new IntersectionObserver((entries) => {
        for (let entry of entries) {
            if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                entry.target.classList.remove("b-waiting");
                const cover = entry.target.children[0];
                const coverImg = cover.children[0];
                coverImg.src = cover.dataset.src;
            }
        }
    });
    promotionElements.forEach((element) => {
        addPromotionEvent(element, observer);
    });
}

/**
 * 获取漫画专辑信息
 * @param {string} comicId 漫画 ID
 * @returns {Promise<Object>} 漫画专辑信息
 */
async function getComicAlbum(comicId) {
    const albumResponse = await retryFetch(
        `https://${serverInfo.Server[0]}/album?id=${comicId}`,
        {
            headers: {
                token: accessToken.token,
                tokenParam: accessToken.tokenParam,
            },
            redirect: "follow",
        },
        3
    );
    const albumData = await albumResponse.json();
    return decryptData(currentKey, albumData.data);
}

/**
 * 获取漫画章节信息
 * @param {string} comicId 漫画 ID
 * @returns {Promise<Object>} 漫画章节信息
 */
async function getComicChapter(comicId) {
    const chapterResponse = await retryFetch(
        `https://${serverInfo.Server[1]}/chapter?id=${comicId}`,
        {
            headers: {
                token: accessToken.token,
                tokenParam: accessToken.tokenParam,
            },
            redirect: "follow",
        },
        3
    );
    const chapterData = await chapterResponse.json();
    return decryptData(currentKey, chapterData.data);
}

const searchButton = document.querySelector(".search");
searchButton.addEventListener("click", () => {
    searchButton.style.display = "none";
    searchInput.parentNode.parentNode.style.display = "block";
    searchInput.focus();
    searchInput.parentNode.parentNode.classList.add("search-box-ani");
});
const searchInput = document.querySelector(".search-box input");
searchInput.parentNode.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchQuery = searchInput.value;
    if (searchQuery === "") return;
    location.href = "./search.html?wd=" + searchQuery.replace(" ", "");
    if (Number.isInteger(+searchQuery) && searchQuery >= 10) {
        location.href = "./chapter.html?cid=" + searchQuery;
    }
});
document.querySelector(".p-title").addEventListener("click", () => {
    scrollTo({
        top: 0,
        behavior: "smooth",
    });
});
