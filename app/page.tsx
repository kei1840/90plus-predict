"use client";

import { useEffect, useMemo, useState } from "react";

type Pick = { id: number; name: string; finalSpain: number; finalArgentina: number; bronzeFrance: number; bronzeEngland: number; champion: string; bonus: string; createdAt: string };
type Results = { finalSpain: number | null; finalArgentina: number | null; bronzeFrance: number | null; bronzeEngland: number | null; champion: string; bonus: string };
type State = { picks: Pick[]; results: Results; official?: { bronze:string; final:string } };

const initialResults: Results = { finalSpain: null, finalArgentina: null, bronzeFrance: null, bronzeEngland: null, champion: "", bonus: "" };
const emptyForm = { name: "", finalSpain: 2, finalArgentina: 1, bronzeFrance: 2, bronzeEngland: 1, champion: "スペイン", bonus: "" };

function winner(a: number, b: number, left: string, right: string) { return a === b ? "draw" : a > b ? left : right; }
function scorePick(p: Pick, r: Results) {
  let score = 0; const details: string[] = [];
  if (r.finalSpain !== null && r.finalArgentina !== null) {
    if (p.finalSpain === r.finalSpain && p.finalArgentina === r.finalArgentina) { score += 10; details.push("決勝スコア +10"); }
    else if (winner(p.finalSpain,p.finalArgentina,"スペイン","アルゼンチン") === winner(r.finalSpain,r.finalArgentina,"スペイン","アルゼンチン")) { score += 5; details.push("決勝勝敗 +5"); }
  }
  if (r.bronzeFrance !== null && r.bronzeEngland !== null) {
    if (p.bronzeFrance === r.bronzeFrance && p.bronzeEngland === r.bronzeEngland) { score += 8; details.push("3位戦スコア +8"); }
    else if (winner(p.bronzeFrance,p.bronzeEngland,"フランス","イングランド") === winner(r.bronzeFrance,r.bronzeEngland,"フランス","イングランド")) { score += 4; details.push("3位戦勝敗 +4"); }
  }
  if (r.champion && p.champion === r.champion) { score += 5; details.push("優勝国 +5"); }
  if (r.bonus && p.bonus.trim() && p.bonus.trim().toLowerCase() === r.bonus.trim().toLowerCase()) { score += 3; details.push("ボーナス +3"); }
  return { score, details };
}

function MatchInput({ title, date, left, right, flagL, flagR, a, b, onA, onB }: { title:string; date:string; left:string; right:string; flagL:string; flagR:string; a:number; b:number; onA:(n:number)=>void; onB:(n:number)=>void }) {
  return <section className="match-card">
    <div className="match-head"><span>{title}</span><small>{date}</small></div>
    <div className="score-row">
      <label><span className="flag">{flagL}</span><b>{left}</b><input aria-label={`${left}の得点`} type="number" min="0" max="20" value={a} onChange={e=>onA(Number(e.target.value))}/></label>
      <i>—</i>
      <label className="reverse"><input aria-label={`${right}の得点`} type="number" min="0" max="20" value={b} onChange={e=>onB(Number(e.target.value))}/><b>{right}</b><span className="flag">{flagR}</span></label>
    </div>
  </section>;
}

export default function Home() {
  const [data,setData] = useState<State>({picks:[],results:initialResults});
  const [form,setForm] = useState(emptyForm); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  const load = async () => { const res=await fetch("/api/game",{cache:"no-store"}); if(res.ok) setData(await res.json()); };
  useEffect(()=>{ load(); const t=setInterval(load,30000); return()=>clearInterval(t); },[]);
  const ranked=useMemo(()=>data.picks.map(p=>({...p,...scorePick(p,data.results)})).sort((a,b)=>b.score-a.score||a.createdAt.localeCompare(b.createdAt)),[data]);
  const savePick=async(e:React.FormEvent)=>{e.preventDefault(); if(!form.name.trim()) return; setBusy(true); const res=await fetch("/api/game",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({type:"pick",...form})}); setBusy(false); if(res.ok){setMessage("予想を登録しました！"); setForm({...emptyForm,name:""}); load();} else setMessage("登録できませんでした。もう一度お試しください。");};
  return <main>
    <nav><a className="brand" href="#top"><span>90+</span> PREDICT</a><div><a href="#ranking">ランキング</a><a href="#rules">ルール</a><span className="auto-result">● 結果は自動取得</span></div></nav>
    <header id="top"><div className="eyebrow"><span></span> FIFA WORLD CUP 2026 · FINAL WEEKEND</div><h1>ラスト2試合を、<br/><em>みんなで予想しよう。</em></h1><p>決勝と3位決定戦のスコアを当てて、仲間とランキング勝負。<br/>名前だけで参加できます。</p><div className="live"><i></i> 参加者 <b>{data.picks.length}人</b><span>自動更新</span></div></header>

    <div className="layout">
      <section className="panel prediction-panel">
        <div className="section-title"><span>01</span><div><h2>あなたの予想</h2><p>90分＋延長終了時点のスコアを入力</p></div></div>
        <form onSubmit={savePick} className="form-stack">
          <MatchInput title="3位決定戦" date="7/18 SAT · MIAMI" left="フランス" right="イングランド" flagL="🇫🇷" flagR="🏴" a={form.bronzeFrance} b={form.bronzeEngland} onA={n=>setForm({...form,bronzeFrance:n})} onB={n=>setForm({...form,bronzeEngland:n})}/>
          <MatchInput title="決勝" date="7/19 SUN · NEW YORK" left="スペイン" right="アルゼンチン" flagL="🇪🇸" flagR="🇦🇷" a={form.finalSpain} b={form.finalArgentina} onA={n=>setForm({...form,finalSpain:n})} onB={n=>setForm({...form,finalArgentina:n})}/>
          <div className="two"><label className="field"><span>優勝国</span><select value={form.champion} onChange={e=>setForm({...form,champion:e.target.value})}><option>スペイン</option><option>アルゼンチン</option></select></label><label className="field"><span>決勝の先制選手 <small>+3</small></span><input value={form.bonus} onChange={e=>setForm({...form,bonus:e.target.value})} placeholder="例：ヤマル"/></label></div>
          <label className="field name"><span>あなたの名前</span><input required maxLength={30} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="ニックネームでもOK"/></label>
          <button className="primary" disabled={busy}>{busy?"登録中…":"この予想でエントリー"} <b>→</b></button>{message&&<p className="message">{message}</p>}
        </form>
      </section>

      <aside className="panel ranking" id="ranking"><div className="section-title"><span>02</span><div><h2>ライブランキング</h2><p>試合終了後、公式データから自動採点</p></div></div>
        <div className="official-status"><span>3位戦：{data.official?.bronze||"確認中"}</span><span>決勝：{data.official?.final||"確認中"}</span></div>
        <div className="score-guide"><b>配点</b><span>決勝スコア <strong>10</strong></span><span>決勝勝敗 <strong>5</strong></span><span>3位戦スコア <strong>8</strong></span><span>3位戦勝敗 <strong>4</strong></span><span>優勝国 <strong>5</strong></span><span>先制選手 <strong>3</strong></span></div>
        <div className="rank-list">{ranked.length===0?<div className="empty"><b>一番乗りしよう</b><p>予想を登録すると、ここにランキングが表示されます。</p></div>:ranked.map((p,i)=><article key={p.id} className={i<3?`top top-${i+1}`:""}>
          <div className="rank-head"><div className="place">{i+1}</div><div className="avatar">{p.name.slice(0,1)}</div><div className="person"><b>{p.name}</b><small>{i===0?"現在トップ":"エントリー済み"}</small></div><strong>{p.score}<small> pts</small></strong></div>
          <div className="pick-grid"><div><small>決勝 · スコア予想</small><b>🇪🇸 {p.finalSpain} — {p.finalArgentina} 🇦🇷</b></div><div><small>3位決定戦 · スコア予想</small><b>🇫🇷 {p.bronzeFrance} — {p.bronzeEngland} 🏴</b></div><div><small>決勝 · 優勝国予想</small><b>{p.champion||"未入力"}</b></div><div><small>決勝 · 先制選手予想</small><b>{p.bonus||"予想なし"}</b></div></div>
          <div className="point-detail">{p.details.length?p.details.map(d=><span key={d}>✓ {d}</span>):<span>試合結果の入力後にポイントが入ります</span>}</div>
        </article>)}</div>
        <p className="refresh"><i></i> 30秒ごとに自動更新</p>
      </aside>
    </div>

    <section className="rules" id="rules"><div><span className="eyebrow"><i></i> SCORING</span><h2>当てるほど、<br/>気持ちいい。</h2><p>勝敗だけでもポイント。スコアまでピタリなら一気に逆転。</p></div><div className="rule-grid"><article><b>10</b><span>PTS</span><h3>決勝スコア的中</h3><p>勝敗的中なら 5 pts</p></article><article><b>8</b><span>PTS</span><h3>3位戦スコア的中</h3><p>勝敗的中なら 4 pts</p></article><article><b>5</b><span>PTS</span><h3>優勝国的中</h3><p>最後の一押し</p></article><article><b>3</b><span>PTS</span><h3>先制選手的中</h3><p>ボーナス予想</p></article></div></section>
    <footer><a className="brand" href="#top"><span>90+</span> PREDICT</a><p>Built for the final weekend · 2026</p></footer>
  </main>;
}
