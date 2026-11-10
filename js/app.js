// app.js - ホーム画面（過去問セッション一覧）の描画
import { EXAM_SESSIONS } from './exam-data.js';

function buildCard(session) {
  const li = document.createElement('li');
  li.className = 'session-card';

  const info = document.createElement('div');
  const h2 = document.createElement('h2');
  h2.textContent = session.title;
  const sub = document.createElement('p');
  sub.className = 'session-sub';
  sub.textContent = 'ITストラテジスト試験 午後I';
  info.appendChild(h2);
  info.appendChild(sub);

  const actions = document.createElement('div');
  actions.className = 'session-actions';

  const qsLink = document.createElement('a');
  qsLink.className = 'btn btn-primary';
  qsLink.href = `viewer.html?id=${encodeURIComponent(session.id)}&doc=qs`;
  qsLink.textContent = '問題を読む（マーカー可）';

  const ansLink = document.createElement('a');
  ansLink.className = 'btn';
  ansLink.href = `viewer.html?id=${encodeURIComponent(session.id)}&doc=ans`;
  ansLink.textContent = '解答例を見る';

  actions.appendChild(qsLink);
  actions.appendChild(ansLink);

  li.appendChild(info);
  li.appendChild(actions);
  return li;
}

function init() {
  const list = document.getElementById('session-list');
  EXAM_SESSIONS.forEach((session) => list.appendChild(buildCard(session)));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
