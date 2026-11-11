// viewer-app.js (v2) - CBT準拠マーカー＋「問題（別画面）」フローティングパネルを備えた過去問ビューア
import * as pdfjsLib from '../vendor/pdfjs/pdf.min.mjs';
import { findSession } from './exam-data.js';
import { PdfPanel } from './pdf-panel.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.mjs';

const CMAP_URL = 'vendor/pdfjs/cmaps/';
const STANDARD_FONT_URL = 'vendor/pdfjs/standard_fonts/';
// JBIG2/JPEG2000デコード用WASM（未指定だと一部年度のPDFで2ページ目以降が白紙になるバグがあった）。
// 相対パスのままだとWASM読み込み処理がページのURLとは別の基準で解決しようとして
// 見つからなくなることがあるため、あらかじめ絶対URLへ解決しておく。
const WASM_URL = new URL('vendor/pdfjs/wasm/', document.baseURI).href;

const $ = (id) => document.getElementById(id);

const els = {
  docTitle: $('doc-title'),
  otherDocLink: $('link-other-doc'),
  otherDocLabel: $('other-doc-label'),
  liveRegion: $('live-region'),
  viewerContainer: $('viewerContainer'),
  viewerInner: $('viewer'),

  // メイン画面コントロール
  zoomIn: $('btn-zoom-in'),
  zoomOut: $('btn-zoom-out'),
  zoomLevel: $('zoom-level'),
  zoomSlider: $('zoom-slider'),
  pointerBtn: $('btn-pointer'),
  eraserBtn: $('btn-eraser'),
  colorRed: $('btn-color-red'),
  colorBlue: $('btn-color-blue'),
  colorYellow: $('btn-color-yellow'),
  sizeSlider: $('size-slider'),
  sizeLabel: $('size-label'),
  clearBtn: $('btn-clear-all'),
  statusLine: $('status-line'),

  // 「問題（別画面）」
  btnOpenPopup: $('btn-open-popup'),
  popupWindow: $('popup-window'),
  popupHeader: $('popup-header'),
  popupTranslucentToggle: $('popup-translucent-toggle'),
  popupClose: $('popup-close'),
  popupSizeStandard: $('popup-size-standard'),
  popupSizeLarge: $('popup-size-large'),
  popupResizeHandle: $('popup-resize-handle'),
  popupViewerContainer: $('popup-viewerContainer'),
  popupViewerInner: $('popup-viewer'),
  popupZoomIn: $('popup-zoom-in'),
  popupZoomOut: $('popup-zoom-out'),
  popupZoomLevel: $('popup-zoom-level'),
  popupZoomSlider: $('popup-zoom-slider'),
  popupPointerBtn: $('popup-btn-pointer'),
  popupEraserBtn: $('popup-btn-eraser'),
  popupColorRed: $('popup-btn-color-red'),
  popupColorBlue: $('popup-btn-color-blue'),
  popupColorYellow: $('popup-btn-color-yellow'),
  popupSizeSlider: $('popup-size-slider'),
  popupSizeLabel: $('popup-size-label'),
  popupClearBtn: $('popup-btn-clear-all'),
  popupStatusLine: $('popup-status-line'),
};

function announce(message) {
  els.liveRegion.textContent = message;
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return { id: params.get('id'), doc: params.get('doc') === 'ans' ? 'ans' : 'qs' };
}

function showFatalError(message) {
  els.docTitle.textContent = 'エラー';
  els.statusLine.textContent = message;
  els.viewerContainer.innerHTML = `<p style="color:#fff;padding:16px;">${message}</p>`;
}

// ---------- 「問題（別画面）」フローティングパネルのドラッグ・リサイズ ----------
function initPopupDragAndResize() {
  const win = els.popupWindow;

  function switchToExplicitPosition() {
    if (win.dataset.positioned === 'true') return;
    const rect = win.getBoundingClientRect();
    win.style.left = `${rect.left}px`;
    win.style.top = `${rect.top}px`;
    win.style.transform = 'none';
    win.dataset.positioned = 'true';
  }

  // ドラッグ移動（ヘッダーをつかむ。ボタン操作は除外）
  let dragState = null;
  els.popupHeader.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, label, input')) return;
    switchToExplicitPosition();
    const rect = win.getBoundingClientRect();
    dragState = { startX: e.clientX, startY: e.clientY, startLeft: rect.left, startTop: rect.top };
    els.popupHeader.setPointerCapture(e.pointerId);
  });
  els.popupHeader.addEventListener('pointermove', (e) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const maxLeft = window.innerWidth - 80;
    const maxTop = window.innerHeight - 40;
    win.style.left = `${Math.min(Math.max(-40, dragState.startLeft + dx), maxLeft)}px`;
    win.style.top = `${Math.min(Math.max(0, dragState.startTop + dy), maxTop)}px`;
  });
  ['pointerup', 'pointercancel'].forEach((type) => {
    els.popupHeader.addEventListener(type, () => { dragState = null; });
  });

  // リサイズ（右下ハンドル）
  let resizeState = null;
  els.popupResizeHandle.addEventListener('pointerdown', (e) => {
    switchToExplicitPosition();
    const rect = win.getBoundingClientRect();
    resizeState = { startX: e.clientX, startY: e.clientY, startW: rect.width, startH: rect.height };
    els.popupResizeHandle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  els.popupResizeHandle.addEventListener('pointermove', (e) => {
    if (!resizeState) return;
    const dx = e.clientX - resizeState.startX;
    const dy = e.clientY - resizeState.startY;
    win.style.width = `${Math.max(320, resizeState.startW + dx)}px`;
    win.style.height = `${Math.max(320, resizeState.startH + dy)}px`;
  });
  ['pointerup', 'pointercancel'].forEach((type) => {
    els.popupResizeHandle.addEventListener(type, () => { resizeState = null; });
  });

  // 標準／大サイズ切替（公式CBTの「問題（別画面）」にある「大」「標準」ボタンを再現）
  els.popupSizeStandard.addEventListener('click', () => {
    win.dataset.positioned = 'false';
    win.style.left = '50%';
    win.style.top = '8vh';
    win.style.transform = 'translateX(-50%)';
    win.style.width = 'min(640px, 92vw)';
    win.style.height = '70vh';
  });
  els.popupSizeLarge.addEventListener('click', () => {
    win.dataset.positioned = 'false';
    win.style.left = '50%';
    win.style.top = '3vh';
    win.style.transform = 'translateX(-50%)';
    win.style.width = '94vw';
    win.style.height = '92vh';
  });

  // 「半透明」チェック: 公式CBTの「メモ」ウィンドウと同様に、別画面だけを透かして
  // 後ろのメイン画面が見えるようにする（メイン画面側には適用しない）。
  els.popupTranslucentToggle.addEventListener('change', (e) => {
    win.classList.toggle('translucent', e.target.checked);
  });
}

async function init() {
  const { id, doc } = getQueryParams();
  const session = findSession(id);
  if (!session) {
    showFatalError('指定された過去問セッションが見つかりませんでした。一覧画面からやり直してください。');
    return;
  }

  const isAnswer = doc === 'ans';
  const fileUrl = isAnswer ? session.ansFile : session.qsFile;
  els.docTitle.textContent = `${session.title}${isAnswer ? ' 解答例' : ' 問題'}`;
  els.otherDocLabel.textContent = isAnswer ? '問題を読む' : '解答例を見る';
  els.otherDocLink.href = `viewer.html?id=${encodeURIComponent(session.id)}&doc=${isAnswer ? 'qs' : 'ans'}`;

  const baseDocKey = `${session.id}:${doc}`;

  const mainPanel = new PdfPanel({
    container: els.viewerContainer,
    viewerEl: els.viewerInner,
    docKey: baseDocKey,
    announce,
    controls: {
      zoomIn: els.zoomIn,
      zoomOut: els.zoomOut,
      zoomLevel: els.zoomLevel,
      zoomSlider: els.zoomSlider,
      pointerBtn: els.pointerBtn,
      eraserBtn: els.eraserBtn,
      colorButtons: { red: els.colorRed, blue: els.colorBlue, yellow: els.colorYellow },
      sizeSlider: els.sizeSlider,
      sizeLabel: els.sizeLabel,
      clearBtn: els.clearBtn,
      statusLine: els.statusLine,
    },
  });

  let pdfDocument;
  try {
    pdfDocument = await mainPanel.loadDocument(fileUrl, { cMapUrl: CMAP_URL, standardFontDataUrl: STANDARD_FONT_URL, wasmUrl: WASM_URL });
  } catch (err) {
    showFatalError('PDFの読み込みに失敗しました。ネットワークを介さずローカルサーバー経由で開いているかご確認ください。');
    return;
  }

  // ---------- 「問題（別画面）」: 初回クリック時に遅延生成し、以降は表示/非表示のみ切り替える ----------
  // （DOM・PDFViewer・Highlighterを破棄しないことで、閉じて再度開いてもマーカーと表示状態が保持される）
  let popupPanel = null;
  initPopupDragAndResize();

  els.btnOpenPopup.addEventListener('click', () => {
    // 先に表示してからPDFViewerを構築・読込する。
    // hidden(display:none)のままだとコンテナ幅が0になり、'page-width'倍率の計算が崩れるため。
    els.popupWindow.hidden = false;
    if (!popupPanel) {
      popupPanel = new PdfPanel({
        container: els.popupViewerContainer,
        viewerEl: els.popupViewerInner,
        // メインとは別のdocKey ＝ 公式CBT仕様どおりマーカーを同期させない
        docKey: `${baseDocKey}:popup`,
        announce,
        controls: {
          zoomIn: els.popupZoomIn,
          zoomOut: els.popupZoomOut,
          zoomLevel: els.popupZoomLevel,
          zoomSlider: els.popupZoomSlider,
          pointerBtn: els.popupPointerBtn,
          eraserBtn: els.popupEraserBtn,
          colorButtons: { red: els.popupColorRed, blue: els.popupColorBlue, yellow: els.popupColorYellow },
          sizeSlider: els.popupSizeSlider,
          sizeLabel: els.popupSizeLabel,
          clearBtn: els.popupClearBtn,
          statusLine: els.popupStatusLine,
        },
      });
      popupPanel.setDocument(pdfDocument); // メインと同じPDFDocumentProxyを再利用（再取得しない）
    }
    announce('問題を別画面で開きました。');
  });

  els.popupClose.addEventListener('click', () => {
    els.popupWindow.hidden = true;
    announce('別画面を閉じました。');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
