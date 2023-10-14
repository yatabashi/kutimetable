# KUTimetable

## 説明
この拡張機能は、京都大学教務情報システム KULASIS 内の時間割ページにダウンロードボタンを設置し、これを押下することで科目名・ KULASIS 上の授業サポートへのリンク・PandA上の授業サイトへのリンクをまとめた時間割を HTML ファイルとして生成・ダウンロードできます。

## 目的
従来、（それらを個別にブックマークしない限り）KULASISの授業連絡メールやPandAの授業サイトにアクセスするためにはいくつかのページを経由する必要がありました。これを面倒と感じ、それらのリンクを一箇所にまとめたファイルを作ることができれば便利だろうと思い、それをボタン一つで実現するようなプログラムを実装しました。

## 導入方法
Firefox で利用する場合、このディレクトリ「kutimetable」をダウンロードしたのち、`about:debugging#/runtime/this-firefox`を表示し「一時的なアドオンを読み込む…」から kutimetable 直下のいずれかのファイルを選択することで有効化できます。なお、公式サイトには公開していません。
また、`saveHTML.js`のコードをコンソールから実行することでも同じ動作が実現できます。

## 利用可能なページ
全学共通科目の時間割ページ（[前期の場合](https://www.k.kyoto-u.ac.jp/student/la/entry/zenki)あるいは[後期の場合](https://www.k.kyoto-u.ac.jp/student/la/entry/kouki)）と、それと同様の形式で時間割を表示するページ*にダウンロードボタンが表示されます。例えば、医学部人間健康科学科の時間割ページ（[前](https://www.k.kyoto-u.ac.jp/student/u/medh/entry/zenki)/[後](https://www.k.kyoto-u.ac.jp/student/u/medh/entry/kouki)）には対応していません。  
\* 次の正規表現に当てはまる URL で表されるページが該当するはずです：`https://www.k.kyoto-u.ac.jp/student/(la|u/(let|ed|l|ec|s|p|t|a|h)|g/(let|ed|lp|ls|ec|s|med|medh|p|t|a|h|ene|aa|i|bio|gov|is))/entry/(zenki|kouki)`

## 生成例
![example](./example.png)