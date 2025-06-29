/**
 * 从指定 URL 获取服务器信息并解密
 * @returns {Promise<Object>} 解密后的服务器信息
 */
async function getServers() {
    // 从指定 URL 获取服务器信息文本
    const serverDataResponse = await fetch(
        "http://jmappc01-1308024008.cos.ap-guangzhou.myqcloud.com/server-2024.txt"
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
    const promotionResponse = await fetch(`https://${serverInfo.Server[0]}/promote?page=1`, {
        headers: {
            token: accessToken.token,
            tokenParam: accessToken.tokenParam,
        },
        redirect: "follow",
    });
    const promotionData = await promotionResponse.json();
    return decryptData(currentKey, promotionData.data);
}

/**
 * 获取最新内容
 * @param {number} page 页码
 * @returns {Promise<Object>} 最新内容
 */
async function getLatestContent(page) {
    const latestResponse = await fetch(`https://${serverInfo.Server[0]}/latest?page=${page}`, {
        headers: {
            token: accessToken.token,
            tokenParam: accessToken.tokenParam,
        },
        redirect: "follow",
    });
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
    const searchResponse = await fetch(
        `https://${serverInfo.Server[0]}/search?search_query=${searchQuery}&o=mv&page=${page}`,
        {
            headers: {
                token: accessToken.token,
                tokenParam: accessToken.tokenParam,
            },
            redirect: "follow",
        }
    );
    const searchData = await searchResponse.json();
    return decryptData(currentKey, searchData.data);
}

/**
 * 更新主页面内容
 */
async function updateMainPage() {
    if (location.pathname.includes("/index.html") || location.pathname === "/") {
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
    } else if (location.pathname.includes("/latest.html")) {
        // 获取第一页最新内容
        const latestContent = await getLatestContent(1);
        const latestComicsElement = document.querySelector(".comics-latest");
        latestComicsElement.innerHTML = createBookItemsHTML(latestContent);
        latestComicsElement.addEventListener("click", (event) => {
            if (event.target.className !== "comics-latest") {
                let targetElement = event.target;
                while ((targetElement = targetElement.parentNode).className !== "book-item") {}
                location.href = "./chapter.html?cid=" + targetElement.dataset.cid;
            }
        });
        let isLoadingComplete = true;
        let currentPage = 1;
        window.addEventListener('scroll', () => {
            if (
                Math.ceil(document.documentElement.scrollTop + innerHeight) >=
                document.body.offsetHeight &&
                isLoadingComplete
            ) {
                isLoadingComplete = false;
                getLatestContent(++currentPage).then((newLatestContent) => {
                    latestComicsElement.innerHTML += createBookItemsHTML(newLatestContent);
                    isLoadingComplete = true;
                });
            }
        });
    } else if (location.pathname.includes("/search.html")) {
        const searchQuery = new URLSearchParams(location.search).get("wd");
        if (!searchQuery) {
            return alert("不能搜索空气！！！");
        }
        if (Number.isInteger(+searchQuery) && searchQuery > 10000) {
            location.href = "./chapter.html?cid=" + searchQuery;
        }
        // 获取第一页搜索结果
        const searchResults = await getSearchResults(searchQuery, 1);
        const searchResultsElement = document.querySelector(".comics-result");
        searchResultsElement.innerHTML = createBookItemsHTML(searchResults.content);
        searchResultsElement.addEventListener("click", (event) => {
            if (event.target.className !== "comics-result") {
                let targetElement = event.target;
                while ((targetElement = targetElement.parentNode).className !== "book-item") {}
                location.href = "./chapter.html?cid=" + targetElement.dataset.cid;
            }
        });
        if (searchResults.content.length < 80) {
            return;
        }
        let isLoadingComplete = true;
        let currentPage = 1;
        window.addEventListener('scroll', () => {
            if (
                Math.ceil(document.documentElement.scrollTop + innerHeight) >=
                document.body.offsetHeight &&
                isLoadingComplete
            ) {
                isLoadingComplete = false;
                getSearchResults(searchQuery, ++currentPage).then((newSearchResults) => {
                    searchResultsElement.innerHTML += createBookItemsHTML(newSearchResults.content);
                    if (newSearchResults.content.length < 80) {
                        return;
                    }
                    isLoadingComplete = true;
                });
            }
        });
    } else if (location.pathname.includes("/chapter.html")) {
        const comicId = new URLSearchParams(location.search).get("cid");
        if (!Number.isInteger(+comicId)) {
            return alert("comic-id格式错误！！！");
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
    const coverImageElement = document.querySelector(
        ".cover img"
    );
    coverImageElement.src = `https://${serverInfo.Server[0]}/media/albums/${comicInfo.id}_3x4.jpg`;
    coverImageElement.title = comicInfo.description;
    document.querySelector(".title").innerHTML = comicInfo.name;
    document.querySelector(".like span").innerText = `${convertToEnglishNumber(
        comicInfo.likes
    )}`;
    document.querySelector(".like i").innerText = `(${
        Math.floor(
            (comicInfo.likes ? comicInfo.likes : 0) /
            (+comicInfo.total_views ? comicInfo.total_views : 1) * 100
        )
    }%)`;
    document.querySelector(".view span").innerText = convertToEnglishNumber(
        comicInfo.total_views
    );
    document.querySelector(".author").textContent =
        comicInfo.author.join(" & ");
    document.querySelector(".tags").innerHTML = comicInfo.tags.concat(comicInfo.actors)
        .map((tag) => (tag ? `<div class='tag'>${tag}</div>` : ""))
        .join("");
    document.querySelector(".forum h2").textContent = `评论(${convertToEnglishNumber(
        comicInfo.comment_total
    )})`;
    let currentForumPage = 1;
    const loadMoreButton = document.querySelector('.load-more-c');
    loadMoreButton.addEventListener('click', () => {
        loadMoreButton.style.display = 'none';
        loadForumComments(comicInfo.id, ++currentForumPage).then(() => {
            loadMoreButton.style.display = 'block';
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

/**
 * 根据当前时间获取最大请求数量
 * @returns {number} 最大请求数量
 */
function getMaxRequestCount() {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    if (currentHour <= 3) {
        return 3;
    } else if (currentHour >= 21) {
        return 1;
    } else if (currentHour >= 18) {
        return 5;
    }
    return 10;
}

/**
 * 设置漫画图片
 * @param {string} comicId 漫画 ID
 * @param {Array<string>} images 图片列表
 */
function setComicImages(comicId, images) {
    let currentPage = 0;
    let maxRequestCount = getMaxRequestCount();
    const imageContainer = document.querySelector(".comic-imgs");
    const totalImagesElement = document.querySelector('.imgs-num');
    const loadedImagesElement = document.querySelector('.imgs-loaded-num');
    const controlBar = document.querySelector('.control-bar');
    const imageIndexElement = controlBar.children[0];
    const loadedBar = document.querySelector('.loaded-bar');
    totalImagesElement.textContent = images.length;

    let totalLoadedImages = 0;
    let loadedCount = 0;
    const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            if (entry.target.height > 0) {
                resizeObserver.unobserve(entry.target);
                let imageElement = entry.target.parentNode;
                imageElement.children[0].textContent += ' loading...';
                imageElement.style.height = entry.target.height + 'px';
                imageElement.ontransitionend = () => {
                    imageElement.ontransitionend = null;
                    imageElement.style.height = null;
                };
            }
        }
    });

    /**
     * 加载图片
     */
    function loadImages() {
        if (currentPage === images.length) {
            return;
        }
        let nextPage = currentPage + maxRequestCount;
        if (nextPage > images.length) {
            nextPage = images.length;
        }
        const slicedImages = images.slice(currentPage, nextPage);
        currentPage = nextPage;
        slicedImages.forEach((imageName) => {
            const imageDiv = document.createElement("div");
            imageDiv.className = "image";
            imageDiv.style.height = '500px';
            const imageBg = document.createElement('div');
            imageBg.className = 'image-bg';
            imageBg.textContent = imageName;
            imageDiv.append(imageBg);
            const image = new Image();
            image.src = `https://${serverInfo.imgServer[0]}/media/photos/${comicId}/${imageName}`;
            imageDiv.append(image);
            imageContainer.append(imageDiv);

            image.onerror = () => {
                loadedCount++;
                image.onerror = null;
                imageDiv.classList.add('errer-img');
                imageBg.textContent = 'img errer';
            };
            image.onload = () => {
                loadedCount++;
                totalLoadedImages++;
                loadedImagesElement.textContent = `${totalLoadedImages}(${Math.floor(totalLoadedImages / images.length * 100)}%)`;
                loadedBar.style.height = `${Math.floor(totalLoadedImages / images.length * 100)}%`;
                image.onload = null;
                imageBg.remove();
                resizeObserver.unobserve(image);
                imageDiv.style.height = null;
                if (comicId < 220980 || /.gif/.test(imageName)) return;
                image.parentNode.append(cutImage(image, comicId, imageName.slice(0, 5)));
                image.remove();
            };
            resizeObserver.observe(image);
        });
    }

    loadImages();

    /**
     * 滚动事件处理函数
     */
    function onScrollEvent() {
        let currentIndex = 0;
        for (let i = 0; i < imageContainer.children.length; i++) {
            let rect = imageContainer.children[i].getBoundingClientRect();
            if (rect.top + rect.height > 0) {
                currentIndex = i;
                break;
            }
        }
        currentIndex++;
        controlBar.style.height = currentIndex / images.length * 100 + '%';
        imageIndexElement.textContent = currentIndex;
        if (
            Math.ceil(document.documentElement.scrollTop + innerHeight) >=
            document.body.offsetHeight &&
            loadedCount === maxRequestCount
        ) {
            loadedCount = 0;
            loadImages();
        }
    }

    window.addEventListener("scroll", debounceFunction(onScrollEvent, 100));
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
async function loadForumComments(albumId, page) {
    const forumResponse = await fetch(
        `https://${serverInfo.Server[0]}/forum?page=${page}&mode=manhua&aid=${albumId}`,
        {
            headers: {
                token: accessToken.token,
                tokenParam: accessToken.tokenParam,
            },
            redirect: "follow",
        }
    );
    const forumData = await forumResponse.json();
    const commentList = decryptData(currentKey, forumData.data).list;
    document.querySelector(".forum-inner").innerHTML += commentList
        .map((comment) => {
            return `
        <div class="f-item">
            <div class="user-msg">
                <div class="user-img">
                    <img src="https://${serverInfo.Server[0]}/media/users/${comment.photo}" alt="">
                </div>
                <div class="user-name">${comment.username}</div>
            </div>
            <div class="f-text">${comment.content}</div>
        </div>
        `;
        })
        .join("");
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
        <div class="book-item" data-cid="${bookData.id}">
            <div class="b-cover">
                <img
                    src="https://${serverInfo.Server[0]}/media/albums/${bookData.id}_3x4.jpg"
                    alt=""
                />
            </div>
            <div class="b-right">
                <div class="b-title">
                    <span>${bookData.name}</span>
                </div>
                <div class="b-anchor">
                    <span>${bookData.author}</span>
                </div>
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
function addPromotionEvent(element) {
    let currentLeft = 0;
    let itemCount = 15;
    const scrollBarInner = element.querySelector(".bar-inner");
    const nextButton = element.querySelector(".next-btn");
    const innerElement = element.querySelector(".inner");
    nextButton.addEventListener("click", () => {
        if (currentLeft === itemCount - 1) return;
        currentLeft++;
        innerElement.style.transform = `translateX(-${currentLeft * 300}px)`;
        scrollBarInner.style.marginLeft = currentLeft * ((1 / itemCount) * 100) + "%";
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
        innerElement.style.transform = `translateX(-${currentLeft * 300 - deltaX}px)`;
        scrollBarInner.style.marginLeft = (currentLeft - deltaX / 300) * ((1 / itemCount) * 100) + "%";
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
            currentLeft -= Math.round(deltaX / 300);
            if (currentLeft > itemCount) currentLeft = itemCount - 1;
            else if (currentLeft < 0) currentLeft = 0;
        }
        if (Math.abs(deltaX) < 5 && Date.now() - clickStartTime < 200) {
            let targetElement = event.target;
            if (targetElement.className !== "inner") {
                while ((targetElement = targetElement.parentNode).className !== "book-item") {}
                location.href = "./chapter.html?cid=" + targetElement.dataset.cid;
            }
        }
        innerElement.style.transform = `translateX(-${currentLeft * 300}px)`;
        scrollBarInner.style.marginLeft = currentLeft * ((1 / itemCount) * 100) + "%";
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
        innerElement.style.transform = `translateX(-${currentLeft * 300 - deltaX}px)`;
        scrollBarInner.style.marginLeft = (currentLeft - deltaX / 300) * ((1 / itemCount) * 100) + "%";
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
            currentLeft -= Math.round(deltaX / 300);
            if (currentLeft > itemCount) currentLeft = itemCount - 1;
            else if (currentLeft < 0) currentLeft = 0;
        }
        if (Math.abs(deltaX) < 5 && Date.now() - clickStartTime < 200) {
            let targetElement = event.target;
            if (targetElement.className !== "inner") {
                while ((targetElement = targetElement.parentNode).className !== "book-item") {}
                location.href = "./chapter.html?cid=" + targetElement.dataset.cid;
            }
        }
        innerElement.style.transform = `translateX(-${currentLeft * 300}px)`;
        scrollBarInner.style.marginLeft = currentLeft * ((1 / itemCount) * 100) + "%";
        deltaX = 0;
        startX = 0;
    }

    innerElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    innerElement.addEventListener("touchstart", onTouchDown, {
        passive: true,
    });
    innerElement.addEventListener("touchmove", onTouchMove);
    innerElement.addEventListener("touchend", onTouchUp, {
        passive: true,
    });
}

/**
 * 添加事件监听器
 */
function addEventListeners() {
    const promotionElements = document.querySelectorAll(".comic-promote");
    promotionElements.forEach((element) => {
        addPromotionEvent(element);
    });
}

/**
 * 获取漫画专辑信息
 * @param {string} comicId 漫画 ID
 * @returns {Promise<Object>} 漫画专辑信息
 */
async function getComicAlbum(comicId) {
    const albumResponse = await fetch(`https://${serverInfo.Server[0]}/album?id=${comicId}`, {
        headers: {
            token: accessToken.token,
            tokenParam: accessToken.tokenParam,
        },
        redirect: "follow",
    });
    const albumData = await albumResponse.json();
    return decryptData(currentKey, albumData.data);
}

/**
 * 获取漫画章节信息
 * @param {string} comicId 漫画 ID
 * @returns {Promise<Object>} 漫画章节信息
 */
async function getComicChapter(comicId) {
    const chapterResponse = await fetch(`https://${serverInfo.Server[0]}/chapter?id=${comicId}`, {
        headers: {
            token: accessToken.token,
            tokenParam: accessToken.tokenParam,
        },
        redirect: "follow",
    });
    const chapterData = await chapterResponse.json();
    return decryptData(currentKey, chapterData.data);
}

const searchButton = document.querySelector(".search");
searchButton.addEventListener("click", () => {
    searchButton.style.display = "none";
    searchInput.parentNode.parentNode.style.display = "block";
});
const searchInput = document.querySelector(".search-box input");
searchInput.parentNode.addEventListener("submit", (event) => {
    event.preventDefault();
    if (searchInput.value === "") return;
    location.href = "./search.html?wd=" + searchInput.value.replace(" ", "");
});
