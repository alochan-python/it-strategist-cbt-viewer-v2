// memo.js - 公式CBT操作説明PDF 110-136ページの「メモ」機能を再現する
// フローティング・半透明対応・検索・マーカー・カット/コピー/ペースト付きのメモ帳。
// メモは試験全体で1つ（公式仕様どおり「問題（別画面）」とは独立した別パネル）。
import { loadMemo, saveMemo, clearMemo } from './storage.js';

const MAX_CHARS = 10000;
const HILITE_COLORS = { red: '#e53935', blue: '#1e88e5', yellow: '#fdd835' };

export class MemoPanel {
  constructor({
    win, header, translucentToggle, closeBtn, closeBtnBottom,
    searchToggleBtn, searchBar, searchInput, searchCount, searchPrev, searchNext, searchClose,
    colorButtons, cutBtn, copyBtn, pasteBtn,
    content, charCount, resizeHandle,
    docKey, announce,
  }) {
    this.win = win;
    this.content = content;
    this.charCount = charCount;
    this.docKey = docKey;
    this.announce = announce || (() => {});
    this.searchBar = searchBar;
    this.searchInput = searchInput;
    this.searchCount = searchCount;
    this.savedRange = null; // ツールバー操作で選択範囲が失われないよう保持しておく

    content.innerHTML = loadMemo(docKey);
    this._updateCharCount();

    // ---------- ドラッグ移動・リサイズ（「問題（別画面）」と同じ方式） ----------
    let dragState = null;
    header.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, label, input')) return;
      this._switchToExplicitPosition();
      const rect = win.getBoundingClientRect();
      dragState = { startX: e.clientX, startY: e.clientY, startLeft: rect.left, startTop: rect.top };
      header.setPointerCapture(e.pointerId);
    });
    header.addEventListener('pointermove', (e) => {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const maxLeft = window.innerWidth - 80;
      const maxTop = window.innerHeight - 40;
      win.style.left = `${Math.min(Math.max(-40, dragState.startLeft + dx), maxLeft)}px`;
      win.style.top = `${Math.min(Math.max(0, dragState.startTop + dy), maxTop)}px`;
    });
    ['pointerup', 'pointercancel'].forEach((type) => {
      header.addEventListener(type, () => { dragState = null; });
    });

    let resizeState = null;
    resizeHandle.addEventListener('pointerdown', (e) => {
      this._switchToExplicitPosition();
      const rect = win.getBoundingClientRect();
      resizeState = { startX: e.clientX, startY: e.clientY, startW: rect.width, startH: rect.height };
      resizeHandle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    resizeHandle.addEventListener('pointermove', (e) => {
      if (!resizeState) return;
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;
      win.style.width = `${Math.max(280, resizeState.startW + dx)}px`;
      win.style.height = `${Math.max(240, resizeState.startH + dy)}px`;
    });
    ['pointerup', 'pointercancel'].forEach((type) => {
      resizeHandle.addEventListener(type, () => { resizeState = null; });
    });

    // ---------- 半透明 ----------
    translucentToggle.addEventListener('change', (e) => {
      win.classList.toggle('translucent', e.target.checked);
    });

    // ---------- 閉じる ----------
    const close = () => { win.hidden = true; this.announce('メモを閉じました。'); };
    closeBtn.addEventListener('click', close);
    closeBtnBottom.addEventListener('click', close);

    // ---------- 本文入力・文字数カウント・保存 ----------
    content.addEventListener('beforeinput', (e) => {
      const overLimit = content.textContent.length >= MAX_CHARS;
      if (overLimit && e.inputType && e.inputType.startsWith('insert')) {
        e.preventDefault();
      }
    });
    content.addEventListener('input', () => {
      this._clearSearchMarks();
      this._updateCharCount();
      this._persist();
    });

    // ---------- 選択範囲の保持（ツールバーボタン押下でフォーカスが外れても復元できるようにする） ----------
    content.addEventListener('mouseup', () => this._saveSelection());
    content.addEventListener('keyup', () => this._saveSelection());
    [searchToggleBtn, ...Object.values(colorButtons), cutBtn, copyBtn, pasteBtn].forEach((btn) => {
      btn.addEventListener('mousedown', (e) => e.preventDefault());
    });

    // ---------- 文字へのマーカー（赤・青・黄・消しゴム） ----------
    Object.entries(colorButtons).forEach(([key, btn]) => {
      btn.addEventListener('click', () => {
        this._restoreSelection();
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('hiliteColor', false, key === 'eraser' ? 'transparent' : HILITE_COLORS[key]);
        this._updateCharCount();
        this._persist();
      });
    });

    // ---------- カット・コピー・ペースト ----------
    cutBtn.addEventListener('click', () => this._cut());
    copyBtn.addEventListener('click', () => this._copy());
    pasteBtn.addEventListener('click', () => this._paste());

    // ---------- 検索 ----------
    searchToggleBtn.addEventListener('click', () => {
      const show = searchBar.hidden;
      searchBar.hidden = !show;
      if (show) {
        searchInput.value = '';
        searchInput.focus();
      } else {
        this._clearSearchMarks();
      }
    });
    searchClose.addEventListener('click', () => {
      searchBar.hidden = true;
      this._clearSearchMarks();
    });
    searchInput.addEventListener('input', () => this._runSearch());
    searchPrev.addEventListener('click', () => this._gotoMatch(-1));
    searchNext.addEventListener('click', () => this._gotoMatch(1));
  }

  open() {
    this.win.hidden = false;
    this.announce('メモを開きました。');
  }

  _switchToExplicitPosition() {
    if (this.win.dataset.positioned === 'true') return;
    const rect = this.win.getBoundingClientRect();
    this.win.style.left = `${rect.left}px`;
    this.win.style.top = `${rect.top}px`;
    this.win.style.transform = 'none';
    this.win.dataset.positioned = 'true';
  }

  _updateCharCount() {
    const len = this.content.textContent.length;
    this.charCount.textContent = `${len.toLocaleString('ja-JP')} / ${MAX_CHARS.toLocaleString('ja-JP')} 文字`;
  }

  _persist() {
    saveMemo(this.docKey, this.content.innerHTML);
  }

  clearAll() {
    this.content.innerHTML = '';
    clearMemo(this.docKey);
    this._updateCharCount();
    this.announce('メモを消去しました。');
  }

  // ---------- 選択範囲の保存・復元 ----------
  _saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && this.content.contains(sel.anchorNode)) {
      this.savedRange = sel.getRangeAt(0).cloneRange();
    }
  }

  _restoreSelection() {
    // ツールバーのボタンはmousedownでpreventDefault済みのため、通常は選択範囲が
    // 生きたまま残っている。その場合は触らず、失われていた場合のみ保存しておいた範囲を復元する。
    const sel = window.getSelection();
    const hasLiveSelection = sel.rangeCount > 0 && !sel.isCollapsed && this.content.contains(sel.anchorNode);
    if (!hasLiveSelection) {
      if (this.savedRange) {
        sel.removeAllRanges();
        sel.addRange(this.savedRange);
      } else {
        this.content.focus();
        return;
      }
    }
    this.content.focus();
  }

  // ---------- カット・コピー・ペースト ----------
  async _copy() {
    this._restoreSelection();
    const sel = window.getSelection();
    const text = sel.toString();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this.announce('メモの選択範囲をコピーしました。');
    } catch {
      document.execCommand('copy');
      this.announce('メモの選択範囲をコピーしました。');
    }
  }

  async _cut() {
    this._restoreSelection();
    const sel = window.getSelection();
    const text = sel.toString();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      document.execCommand('copy');
    }
    document.execCommand('delete');
    this._updateCharCount();
    this._persist();
    this.announce('メモの選択範囲をカットしました。');
  }

  async _paste() {
    this._restoreSelection();
    let text = '';
    try {
      text = await navigator.clipboard.readText();
    } catch {
      this.announce('クリップボードの読み取りが許可されていません。');
      return;
    }
    if (!text) return;
    const remaining = MAX_CHARS - this.content.textContent.length;
    if (remaining <= 0) return;
    document.execCommand('insertText', false, text.slice(0, remaining));
    this._updateCharCount();
    this._persist();
    this.announce('メモへ貼り付けました。');
  }

  // ---------- 検索 ----------
  _clearSearchMarks() {
    this.content.querySelectorAll('mark.memo-search-hit').forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
    this.content.normalize();
    this.matches = [];
    this.activeMatch = -1;
    this.searchCount.textContent = '';
  }

  _runSearch() {
    this._clearSearchMarks();
    const query = this.searchInput.value;
    if (!query) return;
    const lowerQuery = query.toLowerCase();
    const walker = document.createTreeWalker(this.content, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    const marks = [];
    textNodes.forEach((textNode) => {
      const lower = textNode.data.toLowerCase();
      let from = 0;
      let idx;
      const offsets = [];
      while ((idx = lower.indexOf(lowerQuery, from)) !== -1) {
        offsets.push(idx);
        from = idx + lowerQuery.length;
      }
      // 後ろから処理してオフセットのズレを防ぐ
      for (let i = offsets.length - 1; i >= 0; i -= 1) {
        const start = offsets[i];
        const end = start + query.length;
        const after = textNode.splitText(start);
        after.splitText(end - start);
        const mark = document.createElement('mark');
        mark.className = 'memo-search-hit';
        after.parentNode.insertBefore(mark, after);
        mark.appendChild(after);
        marks.unshift(mark);
      }
    });

    this.matches = marks;
    this.activeMatch = marks.length ? 0 : -1;
    this._refreshSearchUi();
  }

  _gotoMatch(delta) {
    if (!this.matches || this.matches.length === 0) return;
    this.activeMatch = (this.activeMatch + delta + this.matches.length) % this.matches.length;
    this._refreshSearchUi();
  }

  _refreshSearchUi() {
    this.matches.forEach((m, i) => m.classList.toggle('active', i === this.activeMatch));
    if (this.activeMatch >= 0) {
      this.matches[this.activeMatch].scrollIntoView({ block: 'center' });
      this.searchCount.textContent = `${this.activeMatch + 1}/${this.matches.length}`;
    } else {
      this.searchCount.textContent = this.searchInput.value ? '0/0' : '';
    }
  }
}
