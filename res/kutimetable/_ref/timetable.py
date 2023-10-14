# 時間割ページから科目名とKULASISのURLを取得
import os
import re
from bs4 import BeautifulSoup

sourcepath = os.path.expanduser('~/Desktop/京都大学教務情報システム.html')
source = open(sourcepath, encoding='shift_jis')
pagesoup = BeautifulSoup(source.read(), 'html.parser')
source.close()
periods = pagesoup.find_all('td', attrs={'class': ['entry_other', 'entry_interest', 'entry_null']})

timetable = [[None]*5 for _ in range(5)]
i = 0

for period in periods:
    periodsoup = BeautifulSoup(str(period), 'html.parser')
    if atag := periodsoup.find('a'):
        name = atag.text.lstrip().replace('\xa0', '')
        href = re.sub('&from=.*', '', atag['href']) #no=の部分だけ保存しても良さそう
        timetable[i//5][i%5] = [name, href, None]
    i += 1

# print(timetable)


# PandAのURLを取得：当該ページを開いた状態で（＝ログインして）実行
# ブラウザ内で実行したら機能する
import requests

i = 0
for day in timetable:
    for period in day:
        if period is not None:
            res = requests.get(period[1])
            ressoup = BeautifulSoup(res.text, 'html.parser')
            pandalink = ressoup.find('a', text='授業支援システム - PandA（情報環境機構）')
            timetable[i//5][i%5][2] = pandalink
        i += 1
        print('\r'+str(i)+'/25',end="")

print('\n')
print(timetable)


# HTMLを生成:
# TODO: 年度・学期はどう決定するか - 読むHTMLからは取れない
# TODO: KULASISページのリンクは拡張機能を実行するページのURL
# TODO: widthの指定が機能していない？
def td_content(period_number: int):
    if perioddata := timetable[period_number//5][period_number%5]:
        name, kulasislink, pandalink = perioddata
        return f'{name}<br><a href=\"{kulasislink}\">KULASIS</a><br><a href=\"{pandalink if pandalink else ""}\">PANDA</a>'
    else:
        return ''

timetable_html = f'''<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title></title>
        <style>
            td:not(.num) {{
                min-width: 125;
            }}
        </style>
    </head>
    <body>
        <h1>2023年後期履修テーブル</h1>
        <p><a href="https://www.k.kyoto-u.ac.jp/student/la/entry/kouki">KULASIS</a></p>
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
                    <td>{td_content(0)}</td>
                    <td>{td_content(5)}</td>
                    <td>{td_content(10)}</td>
                    <td>{td_content(15)}</td>
                    <td>{td_content(20)}</td>
                </tr>
                <tr>
                    <th class="num">2</th>
                    <td>{td_content(1)}</td>
                    <td>{td_content(6)}</td>
                    <td>{td_content(11)}</td>
                    <td>{td_content(16)}</td>
                    <td>{td_content(21)}</td>
                </tr>
                <tr>
                    <th class="num">3</th>
                    <td>{td_content(2)}</td>
                    <td>{td_content(7)}</td>
                    <td>{td_content(12)}</td>
                    <td>{td_content(17)}</td>
                    <td>{td_content(22)}</td>
                </tr>
                <tr>
                    <th class="num">4</th>
                    <td>{td_content(3)}</td>
                    <td>{td_content(8)}</td>
                    <td>{td_content(13)}</td>
                    <td>{td_content(18)}</td>
                    <td>{td_content(23)}</td>
                </tr>
                <tr>
                    <th class="num">5</th>
                    <td>{td_content(4)}</td>
                    <td>{td_content(9)}</td>
                    <td>{td_content(14)}</td>
                    <td>{td_content(19)}</td>
                    <td>{td_content(24)}</td>
                </tr>
            </tbody>
        </table>
    </body>
</html>
'''

resultpath = os.path.expanduser('~/Desktop/timetable.html')
with open(resultpath, 'x') as timetable_html_file:
    timetable_html_file.write(timetable_html)
