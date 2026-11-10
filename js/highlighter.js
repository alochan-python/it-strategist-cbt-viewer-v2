// highlighter.js - PDFページ画像の上を指/マウスでなぞって蛍光マーカーを引く（フリーハンド方式）
// 実際のIPA過去問「問題冊子」PDFはスキャン画像でテキスト層を持たないため、
// テキスト選択ではなく実物の蛍光ペンと同じ「なぞる」操作を採用している。
//
// v2: IPA公式CBT試験アプリの「マーカー」機能（操作説明PDF 32-34, 105-109ページ）に合わせて、
// 色を赤・青・黄の3色に変更し、マーカーの太さ（サイズ）を変更できるようにした。
import { loadHighlights, saveHighlights, clearHighlights } from './storage.js';

// 公式CBTの配色に近いマーカー色（赤・青・黄の3色。順序もCBTのボタン配列に合わせる）
export const HIGHLIGHT_COLORS = {
  red: '#e53935',
  blue: '#1e88e5',
  yellow: '#fdd835',
};
export const HIGHLIGHT_COLOR_ORDER = ['red', 'blue', 'yellow'];

// 公式CBT操作説明PDF 109ページの「問題（別画面）」スクリーンショットにある
// 細い下線マーカーの太さに合わせた値（PDF等倍(scale=1)・サイズ倍率1.0x基準）。
const BASE_STROKE_WIDTH = 4;
export const MIN_SIZE_MULTIPLIER = 0.5;
export const MAX_SIZE_MULTIPLIER = 3.0;
export const DEFAULT_SIZE_MULTIPLIER = 1.0;
const ERASE_HIT_RADIUS = 14;

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `hl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const nx = x1 + t * dx;
  const ny = y1 + t * dy;
  return Math.hypot(px - nx, py - ny);
}

export class Highlighter {
  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.container PDFViewerの描画コンテナ（.pdfViewer を含む要素）
   * @param {string} opts.docKey 保存キー（例: "st-2025r07-pm1:qs"）。メイン画面と別画面は
   *   異なるdocKeyを渡すことで、公式CBT仕様どおりマーカーを同期させずに独立管理する。
   * @param {() => number} opts.getScale 現在のPDF.js表示倍率(currentScale)を返す関数
   * @param {(msg:string) => void} [opts.announce] 状態変化の読み上げ用コールバック
   */
  constructor({ container, docKey, getScale, announce }) {
    this.container = container;
    this.docKey = docKey;
    this.getScale = getScale;
    this.announce = announce || (() => {});
    this.currentColor = 'red';
    this.sizeMultiplier = DEFAULT_SIZE_MULTIPLIER;
    this.mode = 'scroll'; // 'scroll'(通常ポインター) | 'mark' | 'erase'
    this.highlights = loadHighlights(docKey); // [{id, page, color, widthMultiplier, points:[{x,y}]}]
    this.activeStroke = null;
    this.activePageDiv = null;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this.container.addEventListener('pointerdown', this._onPointerDown);
    this.container.addEventListener('pointermove', this._onPointerMove);
    this.container.addEventListener('pointerup', this._onPointerUp);
    this.container.addEventListener('pointercancel', this._onPointerUp);
  }

  setColor(color) {
    if (HIGHLIGHT_COLORS[color]) this.currentColor = color;
  }

  setSizeMultiplier(value) {
    const v = Number(value);
    if (!Number.isFinite(v)) return;
    this.sizeMultiplier = Math.min(MAX_SIZE_MULTIPLIER, Math.max(MIN_SIZE_MULTIPLIER, v));
  }

  setMode(mode) {
    this.mode = ['scroll', 'mark', 'erase'].includes(mode) ? mode : 'scroll';
  }

  get total() {
    return this.highlights.length;
  }

  _findPageDiv(node) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el && el !== this.container) {
      if (el.classList && el.classList.contains('page') && el.dataset.pageNumber) return el;
      el = el.parentElement;
    }
    return null;
  }

  _pagePoint(pageDiv, clientX, clientY) {
    const rect = pageDiv.getBoundingClientRect();
    const scale = this.getScale() || 1;
    return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
  }

  _ensureCanvas(pageDiv) {
    let canvas = pageDiv.querySelector('.km-mark-canvas');
    const width = pageDiv.clientWidth;
    const height = pageDiv.clientHeight;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'km-mark-canvas';
      pageDiv.appendChild(canvas);
    }
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    return canvas;
  }

  _onPointerDown(event) {
    if (this.mode !== 'mark' || (event.button !== undefined && event.button > 0)) return;
    const pageDiv = this._findPageDiv(event.target);
    if (!pageDiv) return;
    event.preventDefault();
    this.activePageDiv = pageDiv;
    const pageNumber = Number(pageDiv.dataset.pageNumber);
    const p = this._pagePoint(pageDiv, event.clientX, event.clientY);
    this.activeStroke = {
      id: generateId(),
      page: pageNumber,
      color: this.currentColor,
      widthMultiplier: this.sizeMultiplier,
      points: [p],
    };
    pageDiv.setPointerCapture?.(event.pointerId);
  }

  _onPointerMove(event) {
    if (this.mode === 'erase') {
      if (event.buttons !== 1) return;
      this._eraseAt(event);
      return;
    }
    if (!this.activeStroke || !this.activePageDiv) return;
    const p = this._pagePoint(this.activePageDiv, event.clientX, event.clientY);
    this.activeStroke.points.push(p);
    this._drawLive();
  }

  _onPointerUp() {
    if (this.mode === 'erase') return;
    if (!this.activeStroke) return;
    if (this.activeStroke.points.length >= 2) {
      this.highlights.push(this.activeStroke);
      this._persist();
      this.announce(`${this._colorLabel(this.activeStroke.color)}のマーカーを引きました。`);
    }
    const pageDiv = this.activePageDiv;
    const pageNumber = this.activeStroke.page;
    this.activeStroke = null;
    this.activePageDiv = null;
    if (pageDiv) this._renderPage(pageDiv, pageNumber);
  }

  _eraseAt(event) {
    const pageDiv = this._findPageDiv(event.target);
    if (!pageDiv) return;
    const pageNumber = Number(pageDiv.dataset.pageNumber);
    const p = this._pagePoint(pageDiv, event.clientX, event.clientY);
    const before = this.highlights.length;
    this.highlights = this.highlights.filter((h) => {
      if (h.page !== pageNumber) return true;
      for (let i = 0; i < h.points.length - 1; i += 1) {
        const d = distanceToSegment(p.x, p.y, h.points[i].x, h.points[i].y, h.points[i + 1].x, h.points[i + 1].y);
        if (d <= ERASE_HIT_RADIUS) return false;
      }
      return true;
    });
    if (this.highlights.length !== before) {
      this._persist();
      this._renderPage(pageDiv, pageNumber);
      this.announce('マーカーを消しました。');
    }
  }

  _colorLabel(color) {
    const labels = { red: '赤', blue: '青', yellow: '黄' };
    return labels[color] || color;
  }

  _strokeStyle(ctx, color, widthMultiplier, scale) {
    ctx.strokeStyle = HIGHLIGHT_COLORS[color] || HIGHLIGHT_COLORS.red;
    ctx.lineWidth = BASE_STROKE_WIDTH * (widthMultiplier || DEFAULT_SIZE_MULTIPLIER) * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.4;
    ctx.globalCompositeOperation = 'multiply';
  }

  _paintStroke(ctx, points, scale) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x * scale, points[0].y * scale);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x * scale, points[i].y * scale);
    }
    ctx.stroke();
  }

  /** ドラッグ中のリアルタイム描画（現在のページのみ再描画） */
  _drawLive() {
    if (!this.activePageDiv || !this.activeStroke) return;
    const canvas = this._ensureCanvas(this.activePageDiv);
    const ctx = canvas.getContext('2d');
    const scale = this.getScale() || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pageHighlights = this.highlights.filter((h) => h.page === this.activeStroke.page);
    for (const h of pageHighlights) {
      this._strokeStyle(ctx, h.color, h.widthMultiplier, scale);
      this._paintStroke(ctx, h.points, scale);
    }
    this._strokeStyle(ctx, this.activeStroke.color, this.activeStroke.widthMultiplier, scale);
    this._paintStroke(ctx, this.activeStroke.points, scale);
  }

  /** PDFViewer の 'pagerendered' から呼び出し、そのページのマーカーを描き直す */
  renderPageByNumber(pageNumber) {
    const pageDiv = this.container.querySelector(`.page[data-page-number="${pageNumber}"]`);
    if (pageDiv) this._renderPage(pageDiv, pageNumber);
  }

  _renderPage(pageDiv, pageNumber) {
    const canvas = this._ensureCanvas(pageDiv);
    const ctx = canvas.getContext('2d');
    const scale = this.getScale() || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pageHighlights = this.highlights.filter((h) => h.page === pageNumber);
    for (const h of pageHighlights) {
      this._strokeStyle(ctx, h.color, h.widthMultiplier, scale);
      this._paintStroke(ctx, h.points, scale);
    }
  }

  /** ズーム変更などで全ページを再描画する（太さ・位置とも現在のscaleへ追従する） */
  redrawAllRenderedPages() {
    this.container.querySelectorAll('.page[data-page-number]').forEach((pageDiv) => {
      this._renderPage(pageDiv, Number(pageDiv.dataset.pageNumber));
    });
  }

  countForPage(pageNumber) {
    return this.highlights.filter((h) => h.page === pageNumber).length;
  }

  clearAll() {
    this.highlights = [];
    clearHighlights(this.docKey);
    this.redrawAllRenderedPages();
    this.announce('この文書のマーカーをすべて消去しました。');
  }

  _persist() {
    saveHighlights(this.docKey, this.highlights);
  }

  destroy() {
    this.container.removeEventListener('pointerdown', this._onPointerDown);
    this.container.removeEventListener('pointermove', this._onPointerMove);
    this.container.removeEventListener('pointerup', this._onPointerUp);
    this.container.removeEventListener('pointercancel', this._onPointerUp);
  }
}
