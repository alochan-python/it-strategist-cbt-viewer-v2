// pdf-panel.js - PDF表示＋CBT準拠マーカーツールバーを1セットにまとめたパネル。
// メイン画面と「問題（別画面）」の両方で、このクラスをそれぞれ独立したdocKeyで
// インスタンス化することで、IPA公式CBT仕様どおりマーカーを同期させずに管理する。
import * as pdfjsLib from '../vendor/pdfjs/pdf.min.mjs';
import { EventBus, PDFLinkService, PDFViewer } from '../vendor/pdfjs/pdf_viewer.mjs';
import { Highlighter, HIGHLIGHT_COLOR_ORDER, MIN_SIZE_MULTIPLIER, MAX_SIZE_MULTIPLIER, DEFAULT_SIZE_MULTIPLIER } from './highlighter.js';

const MIN_SCALE = 0.3;
const MAX_SCALE = 5;

const STATUS_TEXT = {
  scroll: '「通常ポインター」です。スクロールしてページを読み進められます。',
  mark: '指やマウスで文章をなぞると、選んだ色でマーカーが引けます。',
  erase: '消しゴムモードです。引いたマーカーの上をなぞると、その部分だけ消せます。',
};

/**
 * @param {Object} opts
 * @param {HTMLElement} opts.container  #viewerContainer 相当（PDFViewerはposition:absoluteを要求する）
 * @param {HTMLElement} opts.viewerEl   .pdfViewer 相当（containerの直接の子）
 * @param {Object} opts.controls 各種コントロール要素（下記参照）
 * @param {string} opts.docKey マーカー保存キー
 * @param {(msg:string)=>void} [opts.announce]
 */
export class PdfPanel {
  constructor({ container, viewerEl, controls, docKey, announce }) {
    this.container = container;
    this.viewerEl = viewerEl;
    this.controls = controls;
    this.docKey = docKey;
    this.announce = announce || (() => {});

    this.eventBus = new EventBus();
    this.linkService = new PDFLinkService({ eventBus: this.eventBus });
    this.pdfViewer = new PDFViewer({
      container: this.container,
      viewer: this.viewerEl,
      eventBus: this.eventBus,
      linkService: this.linkService,
      textLayerMode: 2,
    });
    this.linkService.setViewer(this.pdfViewer);

    this.highlighter = new Highlighter({
      container: this.container,
      docKey,
      getScale: () => this.pdfViewer.currentScale,
      announce: this.announce,
    });

    this.eventBus.on('pagesinit', () => {
      this.pdfViewer.currentScaleValue = 'page-width';
    });
    this.eventBus.on('scalechanging', (e) => {
      this._updateZoomDisplay(e.scale);
      this.highlighter.redrawAllRenderedPages();
    });
    this.eventBus.on('pagerendered', (e) => {
      this.highlighter.renderPageByNumber(e.pageNumber);
    });

    this._bindControls();
  }

  async loadDocument(fileUrl, { cMapUrl, standardFontDataUrl, wasmUrl }) {
    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      cMapUrl,
      cMapPacked: true,
      standardFontDataUrl,
      // JBIG2/JPEG2000圧縮された走査画像PDF（例: 平成22年度など）のデコードに必要。
      // 未指定だとJBIG2画像のデコードに失敗し、該当ページが白紙のまま表示されるバグがあった。
      wasmUrl,
    });
    const pdfDocument = await loadingTask.promise;
    this.setDocument(pdfDocument);
    return pdfDocument;
  }

  /** 既に読み込み済みの PDFDocumentProxy を使い回す（別画面でメインと同じPDFを開く場合） */
  setDocument(pdfDocument) {
    this.pdfDocument = pdfDocument;
    this.pdfViewer.setDocument(pdfDocument);
    this.linkService.setDocument(pdfDocument, null);
  }

  _updateZoomDisplay(scale) {
    const percent = Math.round(scale * 100);
    const { zoomLevel, zoomSlider } = this.controls;
    if (zoomLevel) zoomLevel.textContent = `${percent}%`;
    if (zoomSlider && Number(zoomSlider.value) !== percent) zoomSlider.value = String(percent);
  }

  _bindControls() {
    const c = this.controls;

    c.zoomIn?.addEventListener('click', () => {
      this.pdfViewer.currentScale = Math.min(this.pdfViewer.currentScale * 1.1, MAX_SCALE);
    });
    c.zoomOut?.addEventListener('click', () => {
      this.pdfViewer.currentScale = Math.max(this.pdfViewer.currentScale / 1.1, MIN_SCALE);
    });
    c.zoomSlider?.addEventListener('input', (e) => {
      const percent = Number(e.target.value);
      this.pdfViewer.currentScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, percent / 100));
    });

    // --- CBT準拠マーカーツールバー: 通常ポインター / 赤 / 青 / 黄 / 消しゴム ---
    const setMode = (mode) => {
      this.highlighter.setMode(mode);
      c.pointerBtn?.setAttribute('aria-pressed', String(mode === 'scroll'));
      c.eraserBtn?.setAttribute('aria-pressed', String(mode === 'erase'));
      HIGHLIGHT_COLOR_ORDER.forEach((color) => {
        const btn = c.colorButtons?.[color];
        btn?.setAttribute('aria-pressed', String(mode === 'mark' && this.highlighter.currentColor === color));
      });
      this.container.classList.toggle('mode-mark', mode === 'mark');
      this.container.classList.toggle('mode-erase', mode === 'erase');
      if (c.statusLine) c.statusLine.textContent = STATUS_TEXT[mode];
    };
    this._setMode = setMode;

    c.pointerBtn?.addEventListener('click', () => setMode('scroll'));
    c.eraserBtn?.addEventListener('click', () => setMode('erase'));
    HIGHLIGHT_COLOR_ORDER.forEach((color) => {
      c.colorButtons?.[color]?.addEventListener('click', () => {
        this.highlighter.setColor(color);
        setMode('mark');
      });
    });
    setMode('scroll');

    // --- マーカーサイズ ---
    if (c.sizeSlider) {
      c.sizeSlider.min = String(MIN_SIZE_MULTIPLIER);
      c.sizeSlider.max = String(MAX_SIZE_MULTIPLIER);
      c.sizeSlider.step = '0.1';
      c.sizeSlider.value = String(DEFAULT_SIZE_MULTIPLIER);
      c.sizeSlider.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        this.highlighter.setSizeMultiplier(v);
        if (c.sizeLabel) c.sizeLabel.textContent = `${v.toFixed(1)}x`;
      });
    }

    // --- クリア（誤操作防止のため確認ダイアログを表示） ---
    c.clearBtn?.addEventListener('click', () => {
      if (!window.confirm('このマーカーをすべて消去します。よろしいですか？')) return;
      this.highlighter.clearAll();
    });
  }
}
