

/categories
你可以看下img.png,顶部有三列
第一列是分类 就是api里面的categories的的name
然后第二列是排序 - 固定死的 - 这个第二列的query value是用在下面这个api

/categories/filter?page=1&o={参考下面}&c={category里面的slug，比如短篇就是short}

最新 - o=
最多爱心 - o=tf
总排名 - o=mv
月排名 - o=mv_m
周排名 - o=mp_w

然后第三列是category下面的sub_categories
/categories/filter?page=1&o={参考下面}&c={category里面的slug，比如短篇就是short}_{sub categories的slug}
比如用户选择同人 日语，那么就是c=doujin_japanese


###json
{
"categories": [
{
"id": 0,
"name": "最新A漫",
"slug": "",
"total_albums": 0
},
{
"id": "1",
"name": "同人",
"slug": "doujin",
"type": "slug",
"total_albums": "295455",
"sub_categories": [
{
"CID": "1",
"name": "汉化",
"slug": "chinese"
},
{
"CID": "2",
"name": "日语",
"slug": "japanese"
},
{
"CID": "3",
"name": "CG图集",
"slug": "CG"
},
{
"CID": "20",
"name": "禁漫去码",
"slug": "no_mosaic"
},
{
"CID": "23",
"name": "禁漫上色",
"slug": "coloring"
}
]
},
{
"id": "2",
"name": "单本",
"slug": "single",
"type": "slug",
"total_albums": "38206",
"sub_categories": [
{
"CID": "5",
"name": "汉化",
"slug": "chinese"
},
{
"CID": "6",
"name": "日语",
"slug": "japanese"
},
{
"CID": "12",
"name": "青年漫",
"slug": "youth"
},
{
"CID": "21",
"name": "禁漫去码",
"slug": "no_mosaic"
},
{
"CID": "24",
"name": "禁漫上色",
"slug": "coloring"
}
]
},
{
"id": "3",
"name": "短篇",
"slug": "short",
"type": "slug",
"total_albums": "100566",
"sub_categories": [
{
"CID": "7",
"name": "汉化",
"slug": "chinese"
},
{
"CID": "8",
"name": "日语",
"slug": "japanese"
},
{
"CID": "22",
"name": "禁漫去码",
"slug": "no_mosaic"
},
{
"CID": "25",
"name": "禁漫上色",
"slug": "coloring"
}
]
},
{
"id": "4",
"name": "其他类",
"slug": "another",
"type": "slug",
"total_albums": "46516",
"sub_categories": [
{
"CID": "9",
"name": "其他漫画",
"slug": "other"
},
{
"CID": "10",
"name": "3D",
"slug": "3d"
},
{
"CID": "11",
"name": "角色扮演",
"slug": "cosplay"
}
]
},
{
"id": "5",
"name": "韩漫",
"slug": "hanman",
"type": "slug",
"total_albums": "114478",
"sub_categories": [
{
"CID": "19",
"name": "汉化",
"slug": "chinese"
}
]
},
{
"id": "6",
"name": "English Manga",
"slug": "meiman",
"type": "slug",
"total_albums": "397026",
"sub_categories": [
{
"CID": "13",
"name": "IRODORI",
"slug": "irodori"
},
{
"CID": "14",
"name": "FAKKU",
"slug": "fakku"
},
{
"CID": "15",
"name": "18scan",
"slug": "18scan"
},
{
"CID": "16",
"name": "Manhwa",
"slug": "manhwa"
},
{
"CID": "17",
"name": "Comic",
"slug": "comic"
},
{
"CID": "18",
"name": "Other",
"slug": "other"
}
]
},
{
"id": "7",
"name": "Cosplay",
"slug": "another_cosplay",
"type": "search",
"total_albums": 0
},
{
"id": "8",
"name": "3D",
"type": "search",
"slug": "3D",
"total_albums": 0
},
{
"id": "9",
"name": "禁漫汉化组",
"type": "search",
"slug": "禁漫汉化组",
"total_albums": 0
}
],
"blocks": [
{
"title": "主题A漫",
"content": [
"剧情向",
"校园",
"纯爱",
"人妻",
"师生",
"近亲",
"百合",
"YAOI",
"性转",
"NTR",
"伪娘",
"痴女",
"全彩",
"女性向"
]
},
{
"title": "角色 / 扮演",
"content": [
"萝莉",
"御姐",
"熟女",
"正太",
"巨乳",
"贫乳",
"女王",
"教师",
"女僕",
"护士",
"泳装",
"眼镜",
"连裤袜",
"其他制服",
"兔女郎"
]
},
{
"title": "特殊PLAY",
"content": [
"群交",
"足交",
"SM",
"肛交",
"阿黑颜",
"药物",
"扶他",
"调教",
"野外露出",
"催眠",
"自慰",
"触手",
"兽交"
]
},
{
"title": "其他",
"content": [
"CG集",
"重口",
"猎奇",
"非H",
"血腥暴力"
]
}
]
}
###


####json
下面是/categories/filter?page=1&o=&c=doujin_japanese

{
"search_query": "",
"total": "20413",
"content": [
{
"id": "1209558",
"author": "海山そぜ",
"name": "(C106) [お解りいただけただろうか (海山そぜ)] 夏空の秘密の茶会 (ブルーアーカイブ) [DL版]",
"image": "",
"category": {
"id": "1",
"title": "同人"
},
"category_sub": {
"id": "2",
"title": "单本"
},
"liked": false,
"is_favorite": false,
"update_at": 1756268787
},
{
"id": "1209556",
"author": "海山そぜ",
"name": "(C106) [お解りいただけただろうか (海山そぜ)] 远きを忧い近きを虑る (ブルーアーカイブ) [Dl版]",
"image": "",
"category": {
"id": "1",
"title": "同人"
},
"category_sub": {
"id": "2",
"title": "单本"
},
"liked": false,
"is_favorite": false,
"update_at": 1756268709
},
...}
####
