adb connect 127.0.0.1:62001
adb devices
$ adb shell # su # /data/local/tmp/frida-server &

adb shell "ps | grep -i example"
cd  /d/workspace/jmcomic-web_JMComic-Viewer/comic/adb
frida -U -p 3191 -l hook.js
chrome://inspect/#devices
