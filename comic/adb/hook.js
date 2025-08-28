Java.perform(function () {
    Java.scheduleOnMainThread(function () {
        try {
            var WV = Java.use('android.webkit.WebView');
            WV.setWebContentsDebuggingEnabled(true);
            console.log('[WV] debugging enabled on UI thread');
        } catch (e) {
            console.log('[WV] enable debug failed: ' + e);
        }
    });
});
