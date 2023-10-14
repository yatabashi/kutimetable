/* TODO:
    * showSaveFilePicker
        * 未対応のブラウザあり
*/

// 要素の埋め込み
let entryTable = document.getElementsByClassName("entry_table")[0];

let outer_insertion = document.createElement("div");
outer_insertion.style.width = entryTable.style.width;
entryTable.before(outer_insertion);

// 時間割の中身が entry_table から 2px 内側に入っている（原因不明）のに合わせるためのハードコーディング
outer_insertion.style.boxSizing = "border-box";
outer_insertion.style.padding = "2px";

let inner_insertion = document.createElement("div");
inner_insertion.style.border = "1px solid #000";
outer_insertion.appendChild(inner_insertion);

let insBody = document.createElement("div");
insBody.style.display = "flex";
insBody.style.alignItems = "center";
insBody.style.margin = "5px";
inner_insertion.appendChild(insBody);

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
description.innerText = "\"Download\"を押下すると、データの読み込みが終わり次第自動的にHTMLファイルがダウンロードされます。\nダウンロードされたファイルを開いたのち、必要に応じてブックマークに追加してください。"
description.style.margin = "5px";
inner_insertion.appendChild(description);

// ボタンの挙動
async function saveHTML() {
    /* fetchData */
    insButton.disabled = true;
    progress.textContent = "loading...";

    let timetable = new Array();
    const decoder = new TextDecoder("Shift_JIS");
    const stringToDOM = text => new DOMParser().parseFromString(text, "text/html");

    // 収集
    const periods = document.querySelectorAll(".entry_other, .entry_interest, .entry_null");

    let n = 1;
    for (const period of periods) {
        if (period.className == "entry_null") {
            timetable.push(null);
        } else {
            const atag = period.getElementsByTagName("a")[0];
            const coursename = atag.text.trim();
            const kulasislink = atag.href.replace(/&from=.*/, "");
            
            const response = await fetch(kulasislink);
            const binary = await response.arrayBuffer();
            const text = decoder.decode(binary);
            const atags = stringToDOM(text).getElementsByTagName("a");
            const pandalinktag = Array.from(atags).filter((elem) => {
                return elem.textContent == "授業支援システム - PandA（情報環境機構）"
            })[0];
            const pandalink = pandalinktag.href;

            timetable.push([coursename, kulasislink, pandalink]);
        }

        progress.textContent = `loading... ${n}/25`;
        n++;
    }
    
    /* generateHTML */
    progress.textContent = "generating...";
    
    function td_content(period_number) {
        const perioddata = timetable[period_number];
        if (perioddata == null) {
            return "";
        } else {
            const [coursename, kulasislink, pandalink] = perioddata;
            
            return `${coursename}<br><a href="${kulasislink}">KULASIS</a><br><a href="${pandalink}">PANDA</a>`;
        }
    }

    const selfURL = location.href.replace(/\?.*/, "");
    const timetable_html = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title></title>
        <style>
            td:not(.num) {
                min-width: 125px;
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
                    <td>${td_content(0)}</td>
                    <td>${td_content(5)}</td>
                    <td>${td_content(10)}</td>
                    <td>${td_content(15)}</td>
                    <td>${td_content(20)}</td>
                </tr>
                <tr>
                    <th class="num">2</th>
                    <td>${td_content(1)}</td>
                    <td>${td_content(6)}</td>
                    <td>${td_content(11)}</td>
                    <td>${td_content(16)}</td>
                    <td>${td_content(21)}</td>
                </tr>
                <tr>
                    <th class="num">3</th>
                    <td>${td_content(2)}</td>
                    <td>${td_content(7)}</td>
                    <td>${td_content(12)}</td>
                    <td>${td_content(17)}</td>
                    <td>${td_content(22)}</td>
                </tr>
                <tr>
                    <th class="num">4</th>
                    <td>${td_content(3)}</td>
                    <td>${td_content(8)}</td>
                    <td>${td_content(13)}</td>
                    <td>${td_content(18)}</td>
                    <td>${td_content(23)}</td>
                </tr>
                <tr>
                    <th class="num">5</th>
                    <td>${td_content(4)}</td>
                    <td>${td_content(9)}</td>
                    <td>${td_content(14)}</td>
                    <td>${td_content(19)}</td>
                    <td>${td_content(24)}</td>
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
