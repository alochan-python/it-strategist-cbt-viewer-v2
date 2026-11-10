// exam-data.js - 取り込んだ過去問（ITストラテジスト試験 午後I）のメタデータ
// 実データはIPA公式サイトで公開されているPDFをそのまま利用しています（教育目的の再配布はIPAの利用条件で許諾されています）。
// 出典URLはSOURCES.mdにも記載しています。
//
// 平成21年度(2009)〜平成31/令和元年度(2019)は秋期、令和2年度(2020)は新型コロナのため中止、
// 令和3年度(2021)以降は春期での実施に変わっている（IPA公式サイトの掲載内容に基づく）。

export const EXAM_SUBJECT = 'IT ストラテジスト試験 午後I（新CBT制度では「科目B-1」に相当）';

export const EXAM_SESSIONS = [
  {
    id: 'st-2025r07-pm1',
    title: '令和7年度（2025年度）春期',
    fiscalYearLabel: '令和7年度',
    qsFile: 'assets/pdfs/2025r07h_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2025r07h_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/nl10bi0000009lh8-att/2025r07h_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/nl10bi0000009lh8-att/2025r07h_st_pm1_ans.pdf',
  },
  {
    id: 'st-2024r06-pm1',
    title: '令和6年度（2024年度）春期',
    fiscalYearLabel: '令和6年度',
    qsFile: 'assets/pdfs/2024r06h_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2024r06h_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06h_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06h_st_pm1_ans.pdf',
  },
  {
    id: 'st-2023r05-pm1',
    title: '令和5年度（2023年度）春期',
    fiscalYearLabel: '令和5年度',
    qsFile: 'assets/pdfs/2023r05h_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2023r05h_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05h_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05h_st_pm1_ans.pdf',
  },
  {
    id: 'st-2022r04-pm1',
    title: '令和4年度（2022年度）春期',
    fiscalYearLabel: '令和4年度',
    qsFile: 'assets/pdfs/2022r04h_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2022r04h_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000009sgk-att/2022r04h_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000009sgk-att/2022r04h_st_pm1_ans.pdf',
  },
  {
    id: 'st-2021r03-pm1',
    title: '令和3年度（2021年度）春期',
    fiscalYearLabel: '令和3年度',
    qsFile: 'assets/pdfs/2021r03h_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2021r03h_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d5ru-att/2021r03h_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d5ru-att/2021r03h_st_pm1_ans.pdf',
  },
  // 令和2年度（2020年度）春期試験は新型コロナウイルス感染症拡大防止のため中止となり、
  // IPAによる過去問題の公開自体が存在しない（SOURCES.md参照）。
  {
    id: 'st-2019r01-pm1',
    title: '令和元年度（2019年度）秋期',
    fiscalYearLabel: '令和元年度',
    qsFile: 'assets/pdfs/2019r01a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2019r01a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_st_pm1_ans.pdf',
  },
  {
    id: 'st-2018h30-pm1',
    title: '平成30年度（2018年度）秋期',
    fiscalYearLabel: '平成30年度',
    qsFile: 'assets/pdfs/2018h30a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2018h30a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_st_pm1_ans.pdf',
  },
  {
    id: 'st-2017h29-pm1',
    title: '平成29年度（2017年度）秋期',
    fiscalYearLabel: '平成29年度',
    qsFile: 'assets/pdfs/2017h29a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2017h29a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_st_pm1_ans.pdf',
  },
  {
    id: 'st-2016h28-pm1',
    title: '平成28年度（2016年度）秋期',
    fiscalYearLabel: '平成28年度',
    qsFile: 'assets/pdfs/2016h28a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2016h28a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_st_pm1_ans.pdf',
  },
  {
    id: 'st-2015h27-pm1',
    title: '平成27年度（2015年度）秋期',
    fiscalYearLabel: '平成27年度',
    qsFile: 'assets/pdfs/2015h27a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2015h27a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gxj0-att/2015h27a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gxj0-att/2015h27a_st_pm1_ans.pdf',
  },
  {
    id: 'st-2014h26-pm1',
    title: '平成26年度（2014年度）秋期',
    fiscalYearLabel: '平成26年度',
    qsFile: 'assets/pdfs/2014h26a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2014h26a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000ye5-att/2014h26a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000ye5-att/2014h26a_st_pm1_ans.pdf',
  },
  {
    id: 'st-2013h25-pm1',
    title: '平成25年度（2013年度）秋期',
    fiscalYearLabel: '平成25年度',
    qsFile: 'assets/pdfs/2013h25a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2013h25a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p900000027za-att/2013h25a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p900000027za-att/2013h25a_st_pm1_ans.pdf',
  },
  {
    id: 'st-2012h24-pm1',
    title: '平成24年度（2012年度）秋期',
    fiscalYearLabel: '平成24年度',
    qsFile: 'assets/pdfs/2012h24a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2012h24a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002h5m-att/2012h24a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002h5m-att/2012h24a_st_pm1_ans.pdf',
  },
  {
    id: 'st-2011h23-pm1',
    title: '平成23年度（2011年度）秋期',
    fiscalYearLabel: '平成23年度',
    qsFile: 'assets/pdfs/2011h23a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2011h23a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000003ojp-att/2011h23a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000003ojp-att/2011h23a_st_pm1_ans.pdf',
  },
  {
    id: 'st-2010h22-pm1',
    title: '平成22年度（2010年度）秋期',
    fiscalYearLabel: '平成22年度',
    qsFile: 'assets/pdfs/2010h22a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2010h22a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000004d6f-att/2010h22a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000004d6f-att/2010h22a_st_pm1_ans.pdf',
  },
  {
    id: 'st-2009h21-pm1',
    title: '平成21年度（2009年度）秋期',
    fiscalYearLabel: '平成21年度',
    qsFile: 'assets/pdfs/2009h21a_st_pm1_qs.pdf',
    ansFile: 'assets/pdfs/2009h21a_st_pm1_ans.pdf',
    sourceQsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f3yi-att/2009h21a_st_pm1_qs.pdf',
    sourceAnsUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f3yi-att/2009h21a_st_pm1_ans.pdf',
  },
];

export function findSession(id) {
  return EXAM_SESSIONS.find((s) => s.id === id) || null;
}
