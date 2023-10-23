/* TODO:
    * showSaveFilePicker
        * 未対応のブラウザあり
*/

const isEntryPage = location.href.match(/entry/);
if (!isEntryPage && !location.href.match(/timeslot/)) {
    throw new Error("This addon is unavailable on this page.");
}

const selectedClasses = isEntryPage ? ".entry_other, .entry_interest, .entry_null" : ".timetable_reserved, .timetable_filled, .timetable_null";
const nullClassName = isEntryPage ? "entry_null" : "timetable_null";
const table = (() => {
    if (isEntryPage) {
        return document.getElementsByClassName("entry_table")[0]
    } else {
        return Array.from(document.getElementsByTagName("table")).filter((elem) => {
            return elem.width == "660" && elem.innerHTML.match(/th_normal x80/);
        })[0];
    }
})();
const widthOfTable = isEntryPage ? table.style.width : table.width;

// 要素の埋め込み
let insertion = document.createElement("div");
insertion.style.width = widthOfTable;
table.before(insertion);

let insBody = document.createElement("div");
insBody.style.display = "flex";
insBody.style.alignItems = "center";
insBody.style.margin = "5px";
insertion.appendChild(insBody);

let insButton = document.createElement("button");
insButton.textContent = "Download";
insButton.type = "button";
insButton.onclick = saveHTML;
insButton.style.padding = "0px 2px";
insBody.appendChild(insButton);

let progress = document.createElement("div");
progress.textContent = "";
progress.style.marginLeft = "10px";
insBody.appendChild(progress);

let description = document.createElement("p");
description.innerText = "\"Download\"を押下すると、データの読み込みが終わり次第自動的にHTMLファイルがダウンロードされます。\nダウンロードされたファイルを開いたのち、必要に応じてブックマークに追加してください。";
if (!isEntryPage) {
    description.innerText = description.innerText+"\n履修登録画面で実行する場合、複数の科目が選択されているコマからは一番上の科目が抽出されます。"
};
description.style.margin = "5px";
insertion.appendChild(description);

// ボタンの挙動
async function saveHTML() {
    /* fetchData */
    insButton.disabled = true;
    progress.textContent = "loading...";

    let timetable = new Array();
    const decoder = new TextDecoder("Shift_JIS");
    const stringToDOM = text => new DOMParser().parseFromString(text, "text/html");

    // 収集
    const periods = document.querySelectorAll(selectedClasses);

    let n = 1;
    for (const period of periods) {
        if (period.className == nullClassName) {
            timetable.push(null);
        } else {
            const atag = period.getElementsByTagName("a")[0];

            const coursename = (() => {
                if (atag.hasAttribute("title")) {
                    return atag.title.trim()
                } else {
                    const text = atag.text
                    return text.substring(text.indexOf(":") + 1).trim()
                }
            })();
            
            const kulasislink = atag.href.replace(/&from=.*/, "");
            
            const response = await fetch(kulasislink);
            const binary = await response.arrayBuffer();
            const text = decoder.decode(binary);
            const atags = stringToDOM(text).getElementsByTagName("a");
            const pandalinktag = Array.from(atags).filter((elem) => {
                return elem.textContent == "授業支援システム - PandA（情報環境機構）";
            })[0];
            const pandalink = pandalinktag.href;

            timetable.push([coursename, kulasislink, pandalink]);
        }

        progress.textContent = `loading... ${n}/25`;
        n++;
    }
    
    /* generateHTML */
    progress.textContent = "generating...";

    const selfURL = (() => {
        if (location.href == "https://www.k.kyoto-u.ac.jp/student/la/timeslot/timeslot_list") {
            const entryURL = "https://www.k.kyoto-u.ac.jp/student/la/entry/";
            const currentMonth = new Date().getMonth() + 1;
            return (3 <= currentMonth && currentMonth < 9) ? entryURL+"zenki" : entryURL+"kouki";
        } else {
            return location.href.replace(/\?.*/, "");
        }
    })();

    function generateTdTag(periodNumber) {
        const periodData = timetable[periodNumber];
        if (periodData == null) {
            return `<td class="null"></td>`;
        } else {
            const [coursename, kulasislink, pandalink] = periodData;
            const content = `${coursename}<br><a href="${kulasislink}">KULASIS</a><br><a href="${pandalink}">PandA</a>`;

            return `<td>${content}</td>`
        }
    }

    const timetable_html = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title></title>
        <style>
            table {
                border-collapse: collapse;
            }
            th, td {
                padding: 5px;
                border: solid 1px #000;
            }
            th:not(.num), td {
                width: 12.5em;
                vertical-align: top;
            }
            th.num {
                max-width: 0.5em;
                min-width: 0.5em;
            }
            td.null {
                background-color: #CCC;
            }
    </style>
    </head>
    <body>
        <h1>ローカル時間割（${selfURL.endsWith("zenki") ? "前期" : "後期"}）</h1>
        <p><a href="${selfURL}">KULASIS</a></p>
        <table>
            <thead>
                <tr>
                    <th class="num"></th>
                    <th>月</th>
                    <th>火</th>
                    <th>水</th>
                    <th>木</th>
                    <th>金</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th class="num">1</th>
                    ${generateTdTag(0)}
                    ${generateTdTag(5)}
                    ${generateTdTag(10)}
                    ${generateTdTag(15)}
                    ${generateTdTag(20)}
                </tr>
                <tr>
                    <th class="num">2</th>
                    ${generateTdTag(1)}
                    ${generateTdTag(6)}
                    ${generateTdTag(11)}
                    ${generateTdTag(16)}
                    ${generateTdTag(21)}
                </tr>
                <tr>
                    <th class="num">3</th>
                    ${generateTdTag(2)}
                    ${generateTdTag(7)}
                    ${generateTdTag(12)}
                    ${generateTdTag(17)}
                    ${generateTdTag(22)}
                </tr>
                <tr>
                    <th class="num">4</th>
                    ${generateTdTag(3)}
                    ${generateTdTag(8)}
                    ${generateTdTag(13)}
                    ${generateTdTag(18)}
                    ${generateTdTag(23)}
                </tr>
                <tr>
                    <th class="num">5</th>
                    ${generateTdTag(4)}
                    ${generateTdTag(9)}
                    ${generateTdTag(14)}
                    ${generateTdTag(19)}
                    ${generateTdTag(24)}
                </tr>
            </tbody>
        </table>
    </body>
</html>
`;
    
    /* downloadHTML */
    progress.textContent = "downloading...";
    
    const blob = new Blob([timetable_html], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.download = "timetable.html";
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    
    // 完了
    progress.textContent = "downloaded";
}
