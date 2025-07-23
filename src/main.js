import appState from "./store/appState.js";
import { generateToken } from "./api/crypto.js";
import { updateIndexPage } from "./views/index.js";
import { updateLatestPage } from "./views/latest.js";
import { updateSearchInput, updateSearchPage } from "./views/search.js";
import { updateChapterPage } from "./views/chapter.js";
import { updateCollectPage } from "./views/collect.js";
import { checkInternet } from "./api/request.js";

checkInternet();

appState.serverInfo = {
    Server: ['www.cdnmhwscc.vip', 'www.cdnmhws.cc', 'www.cdnblackmyth.club', 'www.cdnuc.vip'],
    imgServer: ["cdn-msp.jm18c-twie.club", "cdn-msp.jmapiproxy1.cc", "cdn-msp.jmapiproxy2.cc"]
};
appState.currentKey = Math.floor(Date.now() / 1000);
appState.accessToken = generateToken(appState.currentKey);

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
} else if (location.pathname.includes("/collect.html")) {
    updateCollectPage();
}
updateSearchInput()

