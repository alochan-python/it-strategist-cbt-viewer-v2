# THIRD_PARTY_NOTICES.md

このアプリは、以下の第三者ソフトウェアをプロジェクト内へ同梱しています（CDNは使用していません）。

## PDF.js

- 提供元: Mozilla Foundation
- リポジトリ: https://github.com/mozilla/pdf.js
- ライセンス: Apache License 2.0（`vendor/pdfjs/LICENSE` に全文を同梱）
- 同梱ファイル: `vendor/pdfjs/pdf.min.mjs`, `pdf.worker.min.mjs`, `pdf_viewer.mjs`, `pdf_viewer.css`,
  `cmaps/`（CJK文字表示用）, `standard_fonts/`（非埋め込みフォント用）
- 取得方法: npm パッケージ `pdfjs-dist`（バージョン 6.2.108）から `scripts/copy-pdfjs-vendor.mjs` で
  必要なファイルのみを抽出し、`vendor/pdfjs/` へ配置しています。アプリの実行時に外部（CDN等）へは一切アクセスしません。

## 過去問PDF自体について

`assets/pdfs/` 内のPDFファイルはIPA（独立行政法人情報処理推進機構）が公表している著作物です。
ライブラリではありませんが、出典・利用条件の詳細は [SOURCES.md](SOURCES.md) に記載しています。
