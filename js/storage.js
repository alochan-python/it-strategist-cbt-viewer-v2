// storage.js - マーカー（ハイライト）情報のlocalStorage保存ラッパー
// 保存されるのは「どこを何色でマークしたか」という座標情報のみで、PDF本文そのものは保存しません。

// v1(ipa-kakomon-marker)とは別名前空間にして、ブラウザストレージを完全に分離する
const PREFIX = 'it-strategist-cbt-viewer-v2:highlights:';

function isStorageAvailable() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * docKey 例: "st-2025r07-pm1:qs" のように「セッションID:qs|ans」で管理する
 */
export function loadHighlights(docKey) {
  if (!isStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(PREFIX + docKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHighlights(docKey, highlights) {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(PREFIX + docKey, JSON.stringify(highlights));
  } catch {
    /* 保存容量オーバー等は無視し、マーカー機能自体は継続させる */
  }
}

export function clearHighlights(docKey) {
  if (!isStorageAvailable()) return;
  localStorage.removeItem(PREFIX + docKey);
}
