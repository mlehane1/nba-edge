import { useState, useEffect, useCallback } from "react";

function useIsMobile() {
  const [mob, setMob] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ─── TEAM MAPS ────────────────────────────────────────────────────────────────
const FULL_TO_ABBR = {
  "Atlanta Hawks":"ATL","Boston Celtics":"BOS","Brooklyn Nets":"BKN",
  "Charlotte Hornets":"CHA","Chicago Bulls":"CHI","Cleveland Cavaliers":"CLE",
  "Dallas Mavericks":"DAL","Denver Nuggets":"DEN","Detroit Pistons":"DET",
  "Golden State Warriors":"GSW","Houston Rockets":"HOU","Indiana Pacers":"IND",
  "LA Clippers":"LAC","Los Angeles Lakers":"LAL","Memphis Grizzlies":"MEM",
  "Miami Heat":"MIA","Milwaukee Bucks":"MIL","Minnesota Timberwolves":"MIN",
  "New Orleans Pelicans":"NOP","New York Knicks":"NYK","Oklahoma City Thunder":"OKC",
  "Orlando Magic":"ORL","Philadelphia 76ers":"PHI","Phoenix Suns":"PHX",
  "Portland Trail Blazers":"POR","Sacramento Kings":"SAC","San Antonio Spurs":"SAS",
  "Toronto Raptors":"TOR","Utah Jazz":"UTA","Washington Wizards":"WAS",
};
const toAbbr = (name) => FULL_TO_ABBR[name] || name.slice(0,3).toUpperCase();

const TEAM_INFO = {
  ATL:{name:"Atlanta Hawks",color:"#E03A3E"},BKN:{name:"Brooklyn Nets",color:"#9CA3AF"},
  BOS:{name:"Boston Celtics",color:"#007A33"},CHA:{name:"Charlotte Hornets",color:"#00788C"},
  CHI:{name:"Chicago Bulls",color:"#CE1141"},CLE:{name:"Cleveland Cavaliers",color:"#6F263D"},
  DAL:{name:"Dallas Mavericks",color:"#00538C"},DEN:{name:"Denver Nuggets",color:"#4FA3E0"},
  DET:{name:"Detroit Pistons",color:"#C8102E"},GSW:{name:"Golden State Warriors",color:"#FFC72C"},
  HOU:{name:"Houston Rockets",color:"#CE1141"},IND:{name:"Indiana Pacers",color:"#FDBB30"},
  LAC:{name:"LA Clippers",color:"#C8102E"},LAL:{name:"Los Angeles Lakers",color:"#FDB927"},
  MEM:{name:"Memphis Grizzlies",color:"#5D76A9"},MIA:{name:"Miami Heat",color:"#F9A01B"},
  MIL:{name:"Milwaukee Bucks",color:"#00471B"},MIN:{name:"Minnesota Timberwolves",color:"#78BE20"},
  NOP:{name:"New Orleans Pelicans",color:"#85714D"},NYK:{name:"New York Knicks",color:"#006BB6"},
  OKC:{name:"OKC Thunder",color:"#007AC1"},ORL:{name:"Orlando Magic",color:"#0077C0"},
  PHI:{name:"Philadelphia 76ers",color:"#006BB6"},PHX:{name:"Phoenix Suns",color:"#E56020"},
  POR:{name:"Portland Trail Blazers",color:"#E03A3E"},SAC:{name:"Sacramento Kings",color:"#5A2D81"},
  SAS:{name:"San Antonio Spurs",color:"#C4CED4"},TOR:{name:"Toronto Raptors",color:"#CE1141"},
  UTA:{name:"Utah Jazz",color:"#002B5C"},WAS:{name:"Washington Wizards",color:"#E31837"},
};

// Default BPI values (points above/below average) – refreshable via AI
const BPI_DEFAULT = {
  OKC:9.8,SAS:9.1,DET:8.4,BOS:7.6,NYK:7.0,MIN:6.8,HOU:6.5,CLE:6.1,
  LAL:5.7,DEN:5.4,TOR:5.0,PHX:4.7,ORL:4.2,MIA:4.0,PHI:3.6,
  ATL:3.0,GSW:2.7,CHA:2.2,LAC:1.9,POR:1.6,MIL:0.6,CHI:0.1,
  MEM:-1.4,DAL:-2.4,NOP:-2.9,UTA:-3.8,WAS:-5.3,BKN:-5.9,IND:-6.8,SAC:-7.4,
};

const STANDINGS = {
  OKC:{w:50,l:15,pct:.769,hw:27,hl:6,aw:23,al:9},
  SAS:{w:47,l:17,pct:.734,hw:26,hl:7,aw:21,al:10},
  DET:{w:45,l:18,pct:.714,hw:25,hl:7,aw:20,al:11},
  BOS:{w:43,l:21,pct:.672,hw:24,hl:9,aw:19,al:12},
  NYK:{w:41,l:24,pct:.631,hw:23,hl:10,aw:18,al:14},
  MIN:{w:40,l:24,pct:.625,hw:22,hl:10,aw:18,al:14},
  HOU:{w:39,l:24,pct:.619,hw:22,hl:9,aw:17,al:15},
  CLE:{w:39,l:25,pct:.609,hw:22,hl:11,aw:17,al:14},
  LAL:{w:39,l:25,pct:.609,hw:22,hl:11,aw:17,al:14},
  DEN:{w:39,l:25,pct:.609,hw:21,hl:11,aw:18,al:14},
  TOR:{w:36,l:27,pct:.571,hw:21,hl:11,aw:15,al:16},
  PHX:{w:37,l:27,pct:.578,hw:21,hl:12,aw:16,al:15},
  ORL:{w:35,l:28,pct:.556,hw:20,hl:12,aw:15,al:16},
  MIA:{w:36,l:29,pct:.554,hw:21,hl:12,aw:15,al:17},
  PHI:{w:34,l:29,pct:.540,hw:19,hl:13,aw:15,al:16},
  ATL:{w:33,l:31,pct:.516,hw:19,hl:13,aw:14,al:18},
  GSW:{w:32,l:31,pct:.508,hw:19,hl:13,aw:13,al:18},
  CHA:{w:32,l:33,pct:.492,hw:19,hl:13,aw:13,al:20},
  LAC:{w:31,l:32,pct:.492,hw:18,hl:14,aw:13,al:18},
  POR:{w:31,l:34,pct:.477,hw:18,hl:14,aw:13,al:20},
  MIL:{w:27,l:36,pct:.429,hw:16,hl:16,aw:11,al:20},
  CHI:{w:26,l:38,pct:.406,hw:15,hl:17,aw:11,al:21},
  MEM:{w:23,l:39,pct:.371,hw:14,hl:18,aw:9,al:21},
  DAL:{w:21,l:43,pct:.328,hw:12,hl:20,aw:9,al:23},
  NOP:{w:21,l:45,pct:.318,hw:12,hl:21,aw:9,al:24},
  UTA:{w:19,l:45,pct:.297,hw:11,hl:21,aw:8,al:24},
  WAS:{w:16,l:47,pct:.254,hw:9,hl:23,aw:7,al:24},
  BKN:{w:16,l:47,pct:.254,hw:9,hl:23,aw:7,al:24},
  IND:{w:15,l:49,pct:.234,hw:8,hl:24,aw:7,al:25},
  SAC:{w:15,l:50,pct:.231,hw:9,hl:24,aw:6,al:26},
};

const HOME_COURT = 2.5;

// ─── STORAGE ─────────────────────────────────────────────────────────────────
async function storeGet(key, fallback = null) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function storeSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ─── ODDS PARSING ─────────────────────────────────────────────────────────────
function parseOddsResponse(games) {
  return games.map(g => {
    const home = toAbbr(g.home_team), away = toAbbr(g.away_team);
    const books = (g.bookmakers || []).map(bk => {
      const sp  = bk.markets?.find(m => m.key === "spreads");
      const ml  = bk.markets?.find(m => m.key === "h2h");
      const tot = bk.markets?.find(m => m.key === "totals");
      const hSp = sp?.outcomes?.find(o => toAbbr(o.name) === home);
      const aSp = sp?.outcomes?.find(o => toAbbr(o.name) === away);
      const over = tot?.outcomes?.find(o => o.name === "Over");
      const hMl  = ml?.outcomes?.find(o => toAbbr(o.name) === home);
      const aMl  = ml?.outcomes?.find(o => toAbbr(o.name) === away);
      return {
        key: bk.key, title: bk.title,
        homeSpread: hSp?.point ?? null, homeJuice: hSp?.price ?? null,
        awaySpread: aSp?.point ?? null, awayJuice: aSp?.price ?? null,
        total: over?.point ?? null,
        homeML: hMl?.price ?? null, awayML: aMl?.price ?? null,
        updated: sp?.last_update || bk.last_update,
      };
    }).filter(b => b.homeSpread !== null);

    const spreads = books.map(b => b.homeSpread).filter(n => n !== null);
    const totals  = books.map(b => b.total).filter(n => n !== null);
    const consensus    = spreads.length ? +(spreads.reduce((a,b)=>a+b,0)/spreads.length).toFixed(1) : null;
    const consensusTot = totals.length  ? +(totals.reduce((a,b)=>a+b,0)/totals.length).toFixed(1)  : null;
    return { id:g.id, home, away, startTime:g.commence_time, books, consensus, consensusTot, raw:g };
  });
}

function getBpiSpread(home, away, bpi) {
  const h = bpi[home], a = bpi[away];
  if (h == null || a == null) return null;
  // Negative = home favored (matching sportsbook convention)
  return +(-(h - a + HOME_COURT)).toFixed(1);
}

// ─── LOCAL GAME HISTORY (fatigue/form data) ───────────────────────────────────
const LOCAL_GAMES = [
  {d:"2026-03-08",home:"CLE",away:"BOS",hs:98,as:109},{d:"2026-03-08",home:"LAL",away:"NYK",hs:110,as:97},
  {d:"2026-03-08",home:"TOR",away:"DAL",hs:122,as:92},{d:"2026-03-08",home:"MIA",away:"DET",hs:121,as:110},
  {d:"2026-03-08",home:"NOP",away:"WAS",hs:138,as:118},{d:"2026-03-08",home:"SAS",away:"HOU",hs:145,as:120},
  {d:"2026-03-08",home:"MIL",away:"ORL",hs:91,as:130},{d:"2026-03-08",home:"POR",away:"IND",hs:131,as:111},
  {d:"2026-03-08",home:"SAC",away:"CHI",hs:126,as:110},{d:"2026-03-08",home:"PHX",away:"CHA",hs:111,as:99},
  {d:"2026-03-07",home:"MIN",away:"ORL",hs:92,as:119},{d:"2026-03-07",home:"DET",away:"BKN",hs:105,as:107},
  {d:"2026-03-07",home:"ATL",away:"PHI",hs:125,as:116},{d:"2026-03-07",home:"MIL",away:"UTA",hs:113,as:99},
  {d:"2026-03-07",home:"MEM",away:"LAC",hs:120,as:123},{d:"2026-03-07",home:"OKC",away:"GSW",hs:104,as:97},
  {d:"2026-03-06",home:"DEN",away:"NYK",hs:103,as:142},{d:"2026-03-06",home:"PHX",away:"NOP",hs:118,as:116},
  {d:"2026-03-06",home:"SAS",away:"LAC",hs:116,as:112},{d:"2026-03-06",home:"LAL",away:"IND",hs:128,as:117},
  {d:"2026-03-05",home:"HOU",away:"PHX",hs:112,as:104},{d:"2026-03-05",home:"GSW",away:"CHA",hs:118,as:108},
  {d:"2026-03-05",home:"TOR",away:"MIN",hs:105,as:111},{d:"2026-03-05",home:"BOS",away:"OKC",hs:114,as:108},
  {d:"2026-03-04",home:"DET",away:"MIL",hs:118,as:104},{d:"2026-03-04",home:"CLE",away:"ATL",hs:122,as:108},
  {d:"2026-03-04",home:"LAL",away:"MEM",hs:115,as:108},{d:"2026-03-03",home:"OKC",away:"NOP",hs:121,as:98},
  {d:"2026-03-03",home:"DEN",away:"SAC",hs:112,as:101},{d:"2026-03-02",home:"SAS",away:"WAS",hs:133,as:105},
];

function getForm(abbr, beforeDate) {
  const bd = new Date(beforeDate);
  return LOCAL_GAMES
    .filter(g=>(g.home===abbr||g.away===abbr)&&new Date(g.d)<bd)
    .sort((a,b)=>new Date(b.d)-new Date(a.d))
    .slice(0,5)
    .map(g=>{
      const ih=g.home===abbr, ts=ih?g.hs:g.as, os=ih?g.as:g.hs;
      return {result:ts>os?"W":"L",score:`${ts}-${os}`,opp:ih?g.away:g.home,date:g.d};
    });
}

function getFatigue(abbr, gameDate) {
  const gd=new Date(gameDate), cut=new Date(gd); cut.setDate(cut.getDate()-5);
  const prev=LOCAL_GAMES
    .filter(g=>(g.home===abbr||g.away===abbr)&&new Date(g.d)>=cut&&new Date(g.d)<gd)
    .sort((a,b)=>new Date(b.d)-new Date(a.d));
  const last=prev[0];
  const daysRest=last?Math.round((gd-new Date(last.d))/864e5):null;
  return {count:prev.length,daysRest,b2b:daysRest===1,
    sched:prev.slice(0,3).map(g=>({date:g.d.slice(5),label:g.home===abbr?`vs ${g.away}`:`@ ${g.home}`,
      result:g.home===abbr?(g.hs>g.as?"W":"L"):(g.as>g.hs?"W":"L")}))};
}

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg:"#060A14",panel:"#0C1322",card:"#111827",border:"#1A2640",
  gold:"#F59E0B",purple:"#A78BFA",blue:"#60A5FA",green:"#4ADE80",red:"#F87171",
  text:"#E2E8F0",muted:"#4B5A72",sub:"#94A3B8",
};
const I = {background:"#0B1120",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,
  padding:"10px 14px",fontSize:14,fontWeight:600,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"};
const Btn = (bg,clr="#fff",extra={})=>({background:bg,border:"none",borderRadius:8,color:clr,
  padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.05em",fontFamily:"inherit",...extra});
const Pill = (bg,clr)=>({display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:4,
  fontSize:10,fontWeight:700,letterSpacing:"0.08em",background:bg,color:clr});


// ─── LINE MOVEMENT CHART ──────────────────────────────────────────────────────
function LineMov({ history }) {
  if (!history || history.length < 2) {
    return (
      <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:12,fontStyle:"italic"}}>
        Refresh odds several times over the coming hours/days to track line movement
      </div>
    );
  }
  const data = history.map(h => ({
    t: new Date(h.ts).toLocaleString([],{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}),
    v: h.consensus,
  }));
  const open = history[0].consensus, now = history[history.length-1].consensus;
  const delta = +(now - open).toFixed(1);
  const col = delta > 0 ? C.red : delta < 0 ? C.green : C.muted;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>
          Line movement · {history.length} snapshots
        </span>
        <span style={{fontSize:13,fontWeight:700,color:col}}>
          {delta===0?"No movement":`${delta>0?"▲":"▼"} ${Math.abs(delta)} pts from open`}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data} margin={{top:4,right:8,left:-24,bottom:0}}>
          <XAxis dataKey="t" tick={{fill:C.muted,fontSize:9}} tickLine={false} axisLine={false} />
          <YAxis tick={{fill:C.muted,fontSize:10}} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}} labelStyle={{color:C.sub}} itemStyle={{color:C.gold}} formatter={v=>[`${v>0?"+":""}${v}`,"Spread"]} />
          <ReferenceLine y={open} stroke={C.border} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="v" stroke={C.gold} strokeWidth={2.5} dot={{r:3,fill:C.gold,strokeWidth:0}} activeDot={{r:5}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── ODDS TABLE ───────────────────────────────────────────────────────────────
function OddsTable({ game }) {
  const { home, away, books, consensus, consensusTot } = game;
  if (!books.length) return <p style={{color:C.muted,fontSize:13}}>No bookmaker data — fetch odds to populate this tab.</p>;

  const spreads = books.map(b => b.homeSpread).filter(n=>n!==null).sort((a,b)=>a-b);
  const lo = spreads[0], hi = spreads[spreads.length-1];

  return (
    <div>
      {/* Consensus banner */}
      <div style={{background:"linear-gradient(135deg,#1A2B10,#132240)",border:`1px solid #2A4020`,borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Consensus Line ({books.length} books)</div>
          <div style={{display:"flex",gap:24,alignItems:"baseline",flexWrap:"wrap"}}>
            <div>
              <span style={{fontSize:12,color:C.muted}}>{home} </span>
              <span style={{fontFamily:"'Bebas Neue',serif",fontSize:40,color:C.gold,letterSpacing:"0.04em",lineHeight:1}}>
                {consensus > 0 ? `+${consensus}` : consensus}
              </span>
            </div>
            {consensusTot && (
              <div>
                <span style={{fontSize:12,color:C.muted}}>O/U </span>
                <span style={{fontFamily:"'Bebas Neue',serif",fontSize:32,color:C.blue,letterSpacing:"0.04em",lineHeight:1}}>{consensusTot}</span>
              </div>
            )}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Range</div>
          <div style={{fontSize:16,fontWeight:700,color:C.sub}}>{lo===hi?lo:`${lo} to ${hi}`}</div>
          {lo!==hi && <div style={{fontSize:11,color:C.muted,marginTop:2}}>Half-point difference — shop lines</div>}
        </div>
      </div>

      {/* Book rows */}
      <div className="odds-table-wrap">
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:480}}>
        <thead>
          <tr style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em"}}>
            <th style={{textAlign:"left",padding:"6px 10px",borderBottom:`1px solid ${C.border}`}}>Sportsbook</th>
            <th style={{textAlign:"center",padding:"6px 10px",borderBottom:`1px solid ${C.border}`}}>{away} ATS</th>
            <th style={{textAlign:"center",padding:"6px 10px",borderBottom:`1px solid ${C.border}`}}>{home} ATS</th>
            <th style={{textAlign:"center",padding:"6px 10px",borderBottom:`1px solid ${C.border}`}}>O/U</th>
            <th style={{textAlign:"center",padding:"6px 10px",borderBottom:`1px solid ${C.border}`}}>ML ({home})</th>
            <th style={{textAlign:"center",padding:"6px 10px",borderBottom:`1px solid ${C.border}`}}>ML ({away})</th>
          </tr>
        </thead>
        <tbody>
          {books.map(b => {
            const isBest = b.homeSpread === lo || b.homeSpread === hi;
            return (
              <tr key={b.key} style={{borderBottom:`1px solid ${C.border}22`}}>
                <td style={{padding:"8px 10px",fontWeight:600,color:C.text}}>{b.title}</td>
                <td style={{padding:"8px 10px",textAlign:"center",color:C.sub}}>
                  {b.awaySpread!=null?`${b.awaySpread>0?"+":""}${b.awaySpread}`:"—"}
                  {b.awayJuice!=null&&<span style={{fontSize:10,color:C.muted}}> ({b.awayJuice})</span>}
                </td>
                <td style={{padding:"8px 10px",textAlign:"center",fontWeight:700,color:isBest?C.gold:C.text}}>
                  {b.homeSpread!=null?`${b.homeSpread>0?"+":""}${b.homeSpread}`:"—"}
                  {b.homeJuice!=null&&<span style={{fontSize:10,color:C.muted,fontWeight:400}}> ({b.homeJuice})</span>}
                </td>
                <td style={{padding:"8px 10px",textAlign:"center",color:C.sub}}>{b.total??"—"}</td>
                <td style={{padding:"8px 10px",textAlign:"center",fontWeight:600,color:b.homeML>0?C.green:C.red}}>
                  {b.homeML!=null?`${b.homeML>0?"+":""}${b.homeML}`:"—"}
                </td>
                <td style={{padding:"8px 10px",textAlign:"center",fontWeight:600,color:b.awayML>0?C.green:C.red}}>
                  {b.awayML!=null?`${b.awayML>0?"+":""}${b.awayML}`:"—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ─── BPI ANALYSIS ─────────────────────────────────────────────────────────────
function BPIAnalysis({ game, bpi, onRefresh, loading }) {
  const { home, away, consensus } = game;
  const hBpi=bpi[home], aBpi=bpi[away];
  const bpiSpread=getBpiSpread(home,away,bpi);
  const disc=consensus!=null&&bpiSpread!=null?+(consensus-bpiSpread).toFixed(1):null;
  const absDisc=disc!=null?Math.abs(disc):0;
  const discCol=absDisc>3?C.gold:absDisc>1.5?C.purple:C.muted;
  const hS=STANDINGS[home], aS=STANDINGS[away];

  return (
    <div>
      {/* BPI cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:12,marginBottom:16,alignItems:"center",gridTemplateRows:"auto"}} className="bpi-grid">
        {[{abbr:away,bpv:aBpi,stand:aS,side:"AWAY"},{abbr:home,bpv:hBpi,stand:hS,side:"HOME"}].map((t,i)=>(
          <div key={t.abbr} style={{background:C.card,borderRadius:10,padding:16,textAlign:i===0?"left":"right"}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{t.abbr} · {t.side}</div>
            <div style={{fontFamily:"'Bebas Neue',serif",fontSize:36,color:t.bpv>4?C.green:t.bpv>0?C.gold:t.bpv<-4?C.red:"#F97316",lineHeight:1}}>
              {t.bpv!=null?(t.bpv>0?"+":"")+t.bpv.toFixed(1):"N/A"}
            </div>
            <div style={{fontSize:10,color:C.muted,marginBottom:8}}>ESPN BPI</div>
            {t.stand&&(
              <div style={{fontSize:11,color:C.muted}}>
                <div>Home {t.stand.hw}-{t.stand.hl} · Away {t.stand.aw}-{t.stand.al}</div>
              </div>
            )}
          </div>
        ))}
        <div style={{textAlign:"center",padding:"0 8px"}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:6}}>BPI Spread</div>
          <div style={{fontFamily:"'Bebas Neue',serif",fontSize:30,color:C.blue,letterSpacing:"0.04em"}}>
            {bpiSpread!=null?`${bpiSpread>0?"+":""}${bpiSpread}`:"N/A"}
          </div>
          <div style={{fontSize:9,color:C.muted,marginTop:2}}>+{HOME_COURT} home adj.</div>
        </div>
      </div>

      {/* Discrepancy alert */}
      {disc!==null&&(
        <div style={{borderRadius:12,padding:"16px 20px",marginBottom:16,
          background:absDisc>3?"#1C1A08":absDisc>1.5?"#18102A":C.card,
          border:`1px solid ${discCol}55`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Market vs BPI Discrepancy</div>
              <div style={{fontFamily:"'Bebas Neue',serif",fontSize:32,color:discCol,letterSpacing:"0.04em",lineHeight:1}}>
                {absDisc.toFixed(1)} pt gap
              </div>
              <div style={{fontSize:13,color:C.sub,marginTop:6}}>
                Market: <strong style={{color:C.text}}>{home} {consensus>0?`+${consensus}`:consensus}</strong>
                <span style={{color:C.muted}}>{" · "}</span>
                BPI implied: <strong style={{color:C.text}}>{home} {bpiSpread>0?`+${bpiSpread}`:bpiSpread}</strong>
              </div>
              <div style={{fontSize:12,color:C.muted,marginTop:4}}>
                {disc>0
                  ?`BPI says ${home} is a stronger favorite than the market implies — possible value on ${home}`
                  :`BPI says ${away} is stronger than the market implies — possible value on ${away}`}
              </div>
            </div>
            {absDisc>2&&(
              <div style={{...Pill(discCol+"22",discCol),fontSize:13,padding:"6px 14px",borderRadius:8,border:`1px solid ${discCol}44`}}>
                {absDisc>3?"🔥 SHARP EDGE":"⚡ EDGE"}
              </div>
            )}
          </div>
        </div>
      )}

      <button onClick={onRefresh} disabled={loading} style={{...Btn("linear-gradient(135deg,#4338CA,#7C3AED)"),opacity:loading?0.7:1}}>
        {loading?"⟳ Fetching BPI...":"🔄 Refresh BPI from ESPN"}
      </button>
      <span style={{fontSize:11,color:C.muted,marginLeft:10}}>AI searches ESPN BPI &amp; updates all 30 teams</span>
    </div>
  );
}

// ─── TEAM CARDS ───────────────────────────────────────────────────────────────
function TeamCard({ abbr, gameDate }) {
  const info=TEAM_INFO[abbr]||{name:abbr,color:"#888"};
  const stand=STANDINGS[abbr];
  const form=getForm(abbr,gameDate||"2026-03-10");
  const fat=getFatigue(abbr,gameDate||"2026-03-10");
  const fi=fat.b2b?{l:"Back-to-Back",c:C.red}:fat.count>=3?{l:"Heavy Load",c:"#F97316"}:fat.count===2?{l:"Moderate",c:C.gold}:{l:"Well Rested",c:C.green};

  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,flex:1,minWidth:240}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{width:42,height:42,borderRadius:"50%",background:info.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff",flexShrink:0,boxShadow:`0 0 18px ${info.color}44`}}>{abbr}</div>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:C.text}}>{info.name}</div>
          {stand&&<div style={{fontSize:11,color:C.sub}}>{stand.w}–{stand.l} · {(stand.pct*100).toFixed(1)}%</div>}
        </div>
      </div>

      {stand&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
          {[["Home",stand.hw,stand.hl],["Away",stand.aw,stand.al]].map(([lbl,w,l])=>{
            const p=w/(w+l);
            return (
              <div key={lbl} style={{background:C.panel,borderRadius:8,padding:"8px 10px"}}>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{lbl}</div>
                <div style={{fontSize:16,fontWeight:800,color:p>=0.6?C.green:p>=0.5?C.gold:C.red}}>{w}-{l}</div>
                <div style={{height:3,background:C.border,borderRadius:2,marginTop:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(p*100,100)}%`,background:p>=0.6?C.green:p>=0.5?C.gold:C.red}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Last 5 Results</div>
        <div style={{display:"flex",gap:4}}>
          {form.length===0
            ?<span style={{fontSize:11,color:C.muted}}>No recent data</span>
            :form.map((g,i)=>(
              <div key={i} title={`${g.date.slice(5)} vs ${g.opp}: ${g.score}`} style={{width:30,height:30,borderRadius:6,background:g.result==="W"?"#166534":"#7F1D1D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:g.result==="W"?C.green:C.red,border:`1px solid ${g.result==="W"?"#16A34A":"#DC2626"}`}}>
                {g.result}
              </div>
            ))
          }
        </div>
        {form.length>0&&<div style={{marginTop:5,display:"flex",flexWrap:"wrap",gap:4}}>
          {form.map((g,i)=><span key={i} style={{fontSize:10,color:C.muted}}>{g.date.slice(5)} {g.opp} {g.score}</span>)}
        </div>}
      </div>

      <div style={{background:C.panel,borderRadius:8,padding:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,color:C.sub}}>Schedule Fatigue</span>
          <span style={{...Pill(fi.c+"22",fi.c)}}>{fi.l}</span>
        </div>
        <div style={{display:"flex",gap:16,fontSize:11,color:C.muted}}>
          <span>Games in 5d: <strong style={{color:fat.count>=3?C.red:fat.count===2?C.gold:C.sub}}>{fat.count}</strong></span>
          <span>Rest: <strong style={{color:fat.daysRest===1?C.red:fat.daysRest===2?C.gold:C.sub}}>{fat.daysRest===null?"—":fat.daysRest===1?"B2B":`${fat.daysRest}d`}</strong></span>
        </div>
        {fat.sched.length>0&&(
          <div style={{marginTop:6,paddingTop:6,borderTop:`1px solid ${C.border}`}}>
            {fat.sched.map((g,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:2}}>
                <span>{g.date} {g.label}</span>
                <span style={{color:g.result==="W"?C.green:C.red,fontWeight:700}}>{g.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SCORE PREDICTOR ─────────────────────────────────────────────────────────
function Predictor({ game, bpi }) {
  const [ha,setHa]=useState(""), [aa,setAa]=useState(""), [notes,setNotes]=useState("");
  const {home,away,consensus}=game;
  const h=parseFloat(ha), a=parseFloat(aa);
  const ready=!isNaN(h)&&!isNaN(a)&&consensus!=null;
  const margin=h-a;
  const spreadVal=-consensus; // spread stored as home perspective; negate to get pts home must win by
  const homeCovers=margin>spreadVal;
  const gap=ready?Math.abs(margin-spreadVal).toFixed(1):null;
  const conf=gap>5?"HIGH":gap>2?"MEDIUM":"LEAN";

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 40px 1fr",gap:8,alignItems:"end",marginBottom:14}}>
        {[{lbl:`${away} (Away)`,val:aa,set:setAa},{lbl:`${home} (Home)`,val:ha,set:setHa}].map(({lbl,val,set},i)=>(
          <div key={lbl} style={i===1?{gridColumn:"3"}:{}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{lbl}</div>
            <input type="number" placeholder="—" value={val} onChange={e=>set(e.target.value)}
              style={{...I,fontSize:28,fontWeight:900,textAlign:"center",padding:14}} />
          </div>
        ))}
        <div style={{display:"flex",alignItems:"flex-end",paddingBottom:18,justifyContent:"center",color:C.border,fontSize:20,fontWeight:900}}>–</div>
      </div>

      {consensus!=null&&(
        <div style={{fontSize:12,color:C.muted,marginBottom:14}}>
          Consensus spread: <strong style={{color:C.gold}}>{home} {consensus>0?`+${consensus}`:consensus}</strong>
          {" · "}
          BPI implied: <strong style={{color:C.purple}}>{home} {getBpiSpread(home,away,bpi)!=null?(getBpiSpread(home,away,bpi)>0?`+${getBpiSpread(home,away,bpi)}`:getBpiSpread(home,away,bpi)):"N/A"}</strong>
        </div>
      )}

      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Notes</div>
        <textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)}
          placeholder="Injuries, pace, revenge game, public money fade..."
          style={{...I,resize:"vertical",fontSize:13,fontWeight:400}} />
      </div>

      {ready&&(
        <div style={{borderRadius:12,padding:"16px 20px",background:homeCovers?"#0C2418":"#200E0E",border:`1px solid ${homeCovers?"#166534":"#7F1D1D"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:20,fontWeight:900,color:homeCovers?C.green:C.red}}>
              {homeCovers?`✓ ${home} COVERS`:`✗ ${away} COVERS`}
            </div>
            <span style={{...Pill("#1E2A40",conf==="HIGH"?C.gold:conf==="MEDIUM"?C.purple:C.blue),fontSize:11,padding:"4px 12px",borderRadius:6}}>
              {conf} CONFIDENCE
            </span>
          </div>
          <div style={{fontSize:13,color:C.sub}}>
            Your line: <strong style={{color:C.text}}>{away} {aa} – {home} {ha}</strong>
            {" · "}Covers by <strong style={{color:C.text}}>{gap} pts</strong>
            {" · "}Spread: <strong style={{color:C.gold}}>{home} {consensus>0?`+${consensus}`:consensus}</strong>
          </div>
          {notes&&<div style={{marginTop:8,fontSize:12,color:C.muted,fontStyle:"italic"}}>📝 {notes}</div>}
        </div>
      )}
    </div>
  );
}

// ─── AI DEEP DIVE ─────────────────────────────────────────────────────────────
function AIDeepDive({ game, bpi }) {
  const [res,setRes]=useState(null), [loading,setLoading]=useState(false), [err,setErr]=useState(null);
  const {home,away,consensus,consensusTot}=game;
  const gameDate=game.startTime?.slice(0,10)||"2026-03-10";
  const hFat=getFatigue(home,gameDate), aFat=getFatigue(away,gameDate);
  const hForm=getForm(home,gameDate),  aForm=getForm(away,gameDate);
  const hS=STANDINGS[home],aS=STANDINGS[away];
  const bpiSprd=getBpiSpread(home,away,bpi);
  const disc=consensus!=null&&bpiSprd!=null?Math.abs(+(consensus-bpiSprd).toFixed(1)):null;

  const run=useCallback(async()=>{
    setLoading(true); setErr(null); setRes(null);
    const fmtForm=(abbr,form)=>form.length?form.map(g=>`${g.result}(${g.opp} ${g.score})`).join(", "):"Limited";
    const prompt=`You are an elite NBA spread betting analyst. Give a sharp, actionable breakdown for wagering.

MATCHUP: ${away} @ ${home} · ${game.startTime?new Date(game.startTime).toLocaleDateString():"Tonight"}
MARKET SPREAD: ${home} ${consensus!=null?(consensus>0?`+${consensus}`:consensus):"N/A"}${consensusTot?` · O/U ${consensusTot}`:""}
ESPN BPI SPREAD: ${bpiSprd!=null?(bpiSprd>0?`+${bpiSprd}`:bpiSprd):"N/A"}${disc!=null?` · ${disc}pt discrepancy vs market`:""}

${home} (HOME): ${hS?.w}-${hS?.l} (Home ${hS?.hw}-${hS?.hl}) · BPI ${bpi[home]!=null?(bpi[home]>0?"+":"")+bpi[home].toFixed(1):"N/A"} · ${hFat.count} games in 5d${hFat.b2b?" ⚠️ B2B":""} · Form: ${fmtForm(home,hForm)}
${away} (AWAY): ${aS?.w}-${aS?.l} (Away ${aS?.aw}-${aS?.al}) · BPI ${bpi[away]!=null?(bpi[away]>0?"+":"")+bpi[away].toFixed(1):"N/A"} · ${aFat.count} games in 5d${aFat.b2b?" ⚠️ B2B":""} · Form: ${fmtForm(away,aForm)}

Use web search to find: 1) current injury/availability reports for both teams, 2) recent game trends or coaching notes, 3) any betting line movement or sharp action signals.

Respond in this exact format:
🏥 INJURY REPORT
• [key player statuses for both teams]

📈 MOMENTUM
• [form trends, recent performances]

⚡ SCHEDULE EDGE
• [fatigue/rest advantage — quantify impact]

📊 BPI vs MARKET
• [explain the ${disc!=null?disc+"pt ":""}discrepancy and which side has statistical value]

🎯 RECOMMENDATION
• [concrete side to bet and why — be direct]

Keep total response under 220 words. Be sharp and specific.`;

    try {
      const r=await fetch("/api/ai",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:900,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:prompt}],
        }),
      });
      if(!r.ok){
        const e=await r.json().catch(()=>({error:{message:`HTTP ${r.status}`}}));
        throw new Error(e.error?.message||`HTTP ${r.status}`);
      }
      const data=await r.json();
      const txt=data.content?.filter(b=>b.type==="text").map(b=>b.text).join("\n").trim();
      if(!txt||txt.length<20) throw new Error("Model returned empty response — try again");
      setRes(txt);
    } catch(e){ setErr(`${e.message}`); }
    setLoading(false);
  },[game,bpi]);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <p style={{fontSize:12,color:C.muted,margin:0}}>Searches live injury reports, line movement &amp; sharp signals using web search</p>
        <button onClick={run} disabled={loading} style={{...Btn("linear-gradient(135deg,#7C3AED,#4F46E5)"),opacity:loading?0.7:1}}>
          {loading?"⟳ Searching...":res?"Refresh Analysis":"▶ Run AI Analysis"}
        </button>
      </div>

      {loading&&(
        <div style={{background:C.card,borderRadius:12,padding:28,textAlign:"center"}}>
          <div style={{fontSize:32,color:C.purple,display:"inline-block",animation:"spin 1.5s linear infinite",marginBottom:10}}>⟳</div>
          <div style={{fontSize:13,color:C.purple}}>Searching injury reports, betting lines &amp; sharp signals…</div>
        </div>
      )}

      {err&&!loading&&(
        <div style={{background:"#1A0808",border:`1px solid #7F1D1D`,borderRadius:10,padding:16,color:C.red,fontSize:13}}>
          <strong>Error:</strong> {err}
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>Check your internet connection or try refreshing. The AI analysis requires a working Anthropic API connection.</div>
        </div>
      )}

      {res&&!loading&&(
        <div style={{background:C.card,borderRadius:12,padding:20,fontSize:13,color:C.sub,lineHeight:1.8,whiteSpace:"pre-wrap"}}>
          {res}
        </div>
      )}

      {!res&&!loading&&!err&&(
        <div style={{background:C.card,borderRadius:12,padding:28,textAlign:"center",color:C.muted,fontSize:12}}>
          <div style={{fontSize:28,marginBottom:8}}>🤖</div>
          Click Run AI Analysis for a live breakdown with current injury news, line movement context, and a direct spread recommendation
        </div>
      )}
    </div>
  );
}

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO = parseOddsResponse([
  {id:"d1",commence_time:"2026-03-10T02:00:00Z",home_team:"Oklahoma City Thunder",away_team:"Denver Nuggets",bookmakers:[
    {key:"draftkings",title:"DraftKings",markets:[
      {key:"spreads",outcomes:[{name:"Oklahoma City Thunder",price:-110,point:-7},{name:"Denver Nuggets",price:-110,point:7}]},
      {key:"totals",outcomes:[{name:"Over",price:-110,point:224},{name:"Under",price:-110,point:224}]},
      {key:"h2h",outcomes:[{name:"Oklahoma City Thunder",price:-310},{name:"Denver Nuggets",price:250}]},
    ]},
    {key:"fanduel",title:"FanDuel",markets:[
      {key:"spreads",outcomes:[{name:"Oklahoma City Thunder",price:-112,point:-7.5},{name:"Denver Nuggets",price:-108,point:7.5}]},
      {key:"totals",outcomes:[{name:"Over",price:-108,point:224.5},{name:"Under",price:-112,point:224.5}]},
      {key:"h2h",outcomes:[{name:"Oklahoma City Thunder",price:-320},{name:"Denver Nuggets",price:265}]},
    ]},
    {key:"betmgm",title:"BetMGM",markets:[
      {key:"spreads",outcomes:[{name:"Oklahoma City Thunder",price:-110,point:-6.5},{name:"Denver Nuggets",price:-110,point:6.5}]},
      {key:"totals",outcomes:[{name:"Over",price:-115,point:223},{name:"Under",price:-105,point:223}]},
      {key:"h2h",outcomes:[{name:"Oklahoma City Thunder",price:-290},{name:"Denver Nuggets",price:235}]},
    ]},
    {key:"caesars",title:"Caesars",markets:[
      {key:"spreads",outcomes:[{name:"Oklahoma City Thunder",price:-110,point:-7},{name:"Denver Nuggets",price:-110,point:7}]},
      {key:"totals",outcomes:[{name:"Over",price:-110,point:224},{name:"Under",price:-110,point:224}]},
      {key:"h2h",outcomes:[{name:"Oklahoma City Thunder",price:-305},{name:"Denver Nuggets",price:248}]},
    ]},
  ]},
  {id:"d2",commence_time:"2026-03-10T00:30:00Z",home_team:"San Antonio Spurs",away_team:"Boston Celtics",bookmakers:[
    {key:"draftkings",title:"DraftKings",markets:[
      {key:"spreads",outcomes:[{name:"San Antonio Spurs",price:-110,point:-3.5},{name:"Boston Celtics",price:-110,point:3.5}]},
      {key:"totals",outcomes:[{name:"Over",price:-110,point:219},{name:"Under",price:-110,point:219}]},
      {key:"h2h",outcomes:[{name:"San Antonio Spurs",price:-168},{name:"Boston Celtics",price:142}]},
    ]},
    {key:"fanduel",title:"FanDuel",markets:[
      {key:"spreads",outcomes:[{name:"San Antonio Spurs",price:-108,point:-4},{name:"Boston Celtics",price:-112,point:4}]},
      {key:"totals",outcomes:[{name:"Over",price:-112,point:219.5},{name:"Under",price:-108,point:219.5}]},
      {key:"h2h",outcomes:[{name:"San Antonio Spurs",price:-175},{name:"Boston Celtics",price:148}]},
    ]},
    {key:"betmgm",title:"BetMGM",markets:[
      {key:"spreads",outcomes:[{name:"San Antonio Spurs",price:-110,point:-3.5},{name:"Boston Celtics",price:-110,point:3.5}]},
      {key:"totals",outcomes:[{name:"Over",price:-105,point:218.5},{name:"Under",price:-115,point:218.5}]},
      {key:"h2h",outcomes:[{name:"San Antonio Spurs",price:-165},{name:"Boston Celtics",price:138}]},
    ]},
  ]},
  {id:"d3",commence_time:"2026-03-10T23:30:00Z",home_team:"Miami Heat",away_team:"Washington Wizards",bookmakers:[
    {key:"draftkings",title:"DraftKings",markets:[
      {key:"spreads",outcomes:[{name:"Miami Heat",price:-110,point:-13},{name:"Washington Wizards",price:-110,point:13}]},
      {key:"totals",outcomes:[{name:"Over",price:-110,point:212},{name:"Under",price:-110,point:212}]},
      {key:"h2h",outcomes:[{name:"Miami Heat",price:-900},{name:"Washington Wizards",price:620}]},
    ]},
    {key:"fanduel",title:"FanDuel",markets:[
      {key:"spreads",outcomes:[{name:"Miami Heat",price:-110,point:-12.5},{name:"Washington Wizards",price:-110,point:12.5}]},
      {key:"totals",outcomes:[{name:"Over",price:-110,point:212.5},{name:"Under",price:-110,point:212.5}]},
      {key:"h2h",outcomes:[{name:"Miami Heat",price:-950},{name:"Washington Wizards",price:650}]},
    ]},
  ]},
]);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {

  const [odds,setOdds]           = useState([]);
  const [sel,setSel]             = useState(null);
  const [hist,setHist]           = useState({});
  const [bpi,setBpi]             = useState(BPI_DEFAULT);
  const [loading,setLoading]     = useState(false);
  const [bpiLoading,setBpiLoad]  = useState(false);
  const [fetchErr,setFetchErr]   = useState(null);
  const [usage,setUsage]         = useState({used:null,remain:null});

  const [gameTab,setGameTab]     = useState("odds");
  const isMobile = useIsMobile();

  useEffect(()=>{
    (async()=>{
      const b=await storeGet("nba:bpi",null);
      if(b) setBpi({...BPI_DEFAULT,...b});
    })();
  },[]);

  // Auto-fetch odds on first load
  useEffect(()=>{ fetchOdds(); },[]);

  useEffect(()=>{
    if(!sel) return;
    storeGet("nba:hist:"+sel.id,[]).then(h=>setHist(p=>({...p,[sel.id]:h})));
  },[sel?.id]);

  const fetchOdds = useCallback(async()=>{
    setLoading(true); setFetchErr(null);
    try {
      const r=await fetch("/api/odds");
      setUsage({used:r.headers.get("x-requests-used"),remain:r.headers.get("x-requests-remaining")});
      if(!r.ok){ const e=await r.json(); throw new Error(e.error||"Server error"); }
      const raw=await r.json();
      const parsed=parseOddsResponse(raw);
      setOdds(parsed);
      // Snapshot history
      const ts=new Date().toISOString();
      for(const g of parsed){
        if(g.consensus===null) continue;
        const prev=await storeGet("nba:hist:"+g.id,[]);
        const last=prev[prev.length-1];
        if(last&&Math.abs(last.consensus-g.consensus)<0.05) continue;
        const updated=[...prev,{ts,consensus:g.consensus,bookCount:g.books.length}].slice(-60);
        await storeSet("nba:hist:"+g.id,updated);
        setHist(p=>({...p,[g.id]:updated}));
      }
    } catch(e){ setFetchErr(e.message); }
    setLoading(false);
  },[]);



  const refreshBPI=async()=>{
    setBpiLoad(true);
    try {
      const r=await fetch("/api/ai",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",max_tokens:600,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:`Search for current ESPN NBA BPI (Basketball Power Index) 2025-26 season at espn.com/nba/bpi. Return ONLY a raw JSON object with team abbreviations as keys and BPI numeric values as values. Use exactly these 30 keys: ATL,BOS,BKN,CHA,CHI,CLE,DAL,DEN,DET,GSW,HOU,IND,LAC,LAL,MEM,MIA,MIL,MIN,NOP,NYK,OKC,ORL,PHI,PHX,POR,SAC,SAS,TOR,UTA,WAS. BPI is a number like 9.8 or -3.2. Output only the JSON object, no other text.`}],
        }),
      });
      const d=await r.json();
      const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("").trim();
      const match=txt.match(/\{[\s\S]*\}/);
      if(match){
        const parsed=JSON.parse(match[0]);
        const merged={...BPI_DEFAULT,...parsed};
        setBpi(merged); await storeSet("nba:bpi",merged);
      }
    } catch(e){ console.error("BPI error",e); }
    setBpiLoad(false);
  };

  const now=new Date();
  const gameList=[...odds].sort((a,b)=>new Date(a.startTime)-new Date(b.startTime));
  const selHist=sel?hist[sel.id]||[]:[];

  const TABS=[["odds","📊 Odds"],["bpi","🧠 BPI"],["teams","🏀 Teams"],["predict","🎯 Predict"],["ai","🤖 AI"]];



  // Game list panel (shared between mobile+desktop)
  const GameList = () => (
    <>
      <div style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:6}}>
        <button onClick={()=>fetchOdds()} disabled={loading} style={{...Btn("linear-gradient(135deg,#166534,#22C55E)"),flex:1,padding:"11px 0",fontSize:12,opacity:loading?0.7:1}}>
          {loading?"⟳ Fetching…":"↻ Refresh Odds"}
        </button>
      </div>
      {(usage.used||usage.remain)&&(
        <div style={{padding:"5px 12px",background:"#080F1A",fontSize:10,color:C.muted,display:"flex",justifyContent:"space-between"}}>
          <span>Used: {usage.used}</span><span>Remaining: {usage.remain}</span>
        </div>
      )}
      {fetchErr&&<div style={{padding:"7px 12px",background:"#180808",color:C.red,fontSize:11}}>{fetchErr.slice(0,120)}</div>}
      <div style={{flex:1,overflowY:"auto"}}>
        {gameList.length===0&&!loading&&(
          <div style={{padding:32,textAlign:"center",color:C.muted,fontSize:13}}>Loading games…</div>
        )}
        {loading&&gameList.length===0&&(
          <div style={{padding:32,textAlign:"center",color:C.muted,fontSize:13}}>⟳ Fetching odds…</div>
        )}
        {gameList.map(g=>{
          const isLive=new Date(g.startTime)<=now;
          const isSel=sel?.id===g.id;
          const hI=TEAM_INFO[g.home]||{color:"#888"}, aI=TEAM_INFO[g.away]||{color:"#888"};
          const hFat=getFatigue(g.home,g.startTime?.slice(0,10)||""), aFat=getFatigue(g.away,g.startTime?.slice(0,10)||"");
          const bpiSprd=getBpiSpread(g.home,g.away,bpi);
          const disc=g.consensus!=null&&bpiSprd!=null?Math.abs(+(g.consensus-bpiSprd).toFixed(1)):0;
          const gHist=hist[g.id]||[];
          const lineMove=gHist.length>=2?+(gHist[gHist.length-1].consensus-gHist[0].consensus).toFixed(1):null;
          const startT=g.startTime?new Date(g.startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"TBD";
          return (
            <div key={g.id} onClick={()=>{setSel(g);setGameTab("odds");}} style={{
              padding:"12px 14px",borderBottom:`1px solid ${C.border}22`,cursor:"pointer",
              background:isSel?"#0E1C32":"transparent",
              borderLeft:`3px solid ${isSel?C.gold:"transparent"}`,
              transition:"background 0.12s", minHeight:64,
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  {isLive&&<span style={{...Pill("#7F1D1D","#FCA5A5"),animation:"pulse 2s infinite",fontSize:9}}>● LIVE</span>}
                  <span style={{fontSize:11,color:C.muted}}>{startT}</span>
                </div>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  {disc>2.5&&<span style={{...Pill("#1C1A08",C.gold),fontSize:9}}>🔥 EDGE</span>}
                  {lineMove!==null&&lineMove!==0&&<span style={{fontSize:11,fontWeight:700,color:lineMove>0?C.red:C.green}}>{lineMove>0?"▲":"▼"}{Math.abs(lineMove)}</span>}
                  {(hFat.b2b||aFat.b2b)&&<span style={{fontSize:9,color:C.red,fontWeight:700}}>B2B</span>}
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  {[{abbr:g.away,i:aI},{abbr:g.home,i:hI}].map(({abbr,i})=>(
                    <div key={abbr} style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:i.color,flexShrink:0}}/>
                      <span style={{fontSize:14,fontWeight:700}}>{abbr}</span>
                    </div>
                  ))}
                </div>
                {g.consensus!=null&&(
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.gold}}>{g.home} {g.consensus>0?`+${g.consensus}`:g.consensus}</div>
                    {g.consensusTot&&<div style={{fontSize:11,color:C.muted}}>O/U {g.consensusTot}</div>}
                  </div>
                )}
              </div>
              {g.consensus!=null&&bpiSprd!=null&&disc>1&&(
                <div style={{marginTop:6,height:2,background:C.border,borderRadius:1,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min((disc/8)*100,100)}%`,background:disc>3?C.gold:C.purple}}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  // Detail panel content
  const DetailPanel = () => sel ? (
    <div style={{padding:isMobile?"12px":"22px",maxWidth:940,margin:"0 auto"}}>
      {/* Mobile back button */}
      {isMobile&&(
        <button onClick={()=>setSel(null)} style={{...Btn("transparent",C.sub),padding:"0 0 12px 0",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
          ← Back to games
        </button>
      )}
      {/* Matchup header */}
      <div style={{background:`linear-gradient(135deg,${C.panel},#0A1525)`,border:`1px solid ${C.border}`,borderRadius:14,padding:isMobile?"14px":"20px 24px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>
              {sel.startTime?new Date(sel.startTime).toLocaleDateString([],{weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"Upcoming"}
              {new Date(sel.startTime)<=now&&" · 🔴 LIVE"}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Bebas Neue',serif",fontSize:isMobile?38:52,letterSpacing:"0.04em",color:TEAM_INFO[sel.away]?.color||C.text,lineHeight:1}}>{sel.away}</span>
              <span style={{fontSize:16,color:C.border,fontWeight:900}}>@</span>
              <span style={{fontFamily:"'Bebas Neue',serif",fontSize:isMobile?38:52,letterSpacing:"0.04em",color:TEAM_INFO[sel.home]?.color||C.text,lineHeight:1}}>{sel.home}</span>
            </div>
            <div style={{fontSize:12,color:C.sub,marginTop:3}}>{TEAM_INFO[sel.away]?.name} at {TEAM_INFO[sel.home]?.name}</div>
          </div>
          {sel.consensus!=null&&(
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>Consensus</div>
              <div style={{fontFamily:"'Bebas Neue',serif",fontSize:isMobile?30:42,color:C.gold,lineHeight:1}}>
                {sel.home} {sel.consensus>0?`+${sel.consensus}`:sel.consensus}
              </div>
              {sel.consensusTot&&<div style={{fontSize:13,color:C.blue,marginTop:2}}>O/U {sel.consensusTot}</div>}
              <div style={{fontSize:10,color:C.muted,marginTop:3}}>{sel.books.length} books</div>
            </div>
          )}
        </div>
        {selHist.length>=2&&(
          <div style={{marginTop:14,borderTop:`1px solid ${C.border}`,paddingTop:14}}>
            <LineMov history={selHist}/>
          </div>
        )}
        {selHist.length<2&&sel.consensus!=null&&(
          <div style={{marginTop:8,fontSize:11,color:C.muted,fontStyle:"italic",borderTop:`1px solid ${C.border}22`,paddingTop:8}}>
            ⟳ Refresh odds over time to build line movement history
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,marginBottom:16}}>
        {TABS.map(([k,l])=>(
          <button key={k} onClick={()=>setGameTab(k)} style={{
            padding:isMobile?"10px 14px":"10px 20px",border:"none",background:"none",cursor:"pointer",fontFamily:"inherit",
            fontSize:isMobile?11:12,fontWeight:700,letterSpacing:"0.04em",
            color:gameTab===k?C.gold:C.muted,
            borderBottom:`2px solid ${gameTab===k?C.gold:"transparent"}`,
            transition:"color 0.15s",whiteSpace:"nowrap",minHeight:44,
          }}>{l}</button>
        ))}
      </div>

      <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:14,padding:isMobile?14:24}}>
        {gameTab==="odds"   &&<OddsTable game={sel}/>}
        {gameTab==="bpi"    &&<BPIAnalysis game={sel} bpi={bpi} onRefresh={refreshBPI} loading={bpiLoading}/>}
        {gameTab==="teams"  &&<div style={{display:"flex",gap:16,flexDirection:isMobile?"column":"row",flexWrap:"wrap"}}><TeamCard abbr={sel.away} gameDate={sel.startTime?.slice(0,10)||"2026-03-10"}/><TeamCard abbr={sel.home} gameDate={sel.startTime?.slice(0,10)||"2026-03-10"}/></div>}
        {gameTab==="predict"&&<Predictor game={sel} bpi={bpi}/>}
        {gameTab==="ai"     &&<AIDeepDive game={sel} bpi={bpi}/>}
      </div>
    </div>
  ) : (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:14,textAlign:"center",padding:24}}>
      <div style={{fontSize:52}}>🏀</div>
      <div style={{fontFamily:"'Bebas Neue',serif",fontSize:36,color:C.border,letterSpacing:"0.1em"}}>SELECT A GAME</div>
      <div style={{fontSize:13,color:C.muted,maxWidth:340,lineHeight:1.6}}>
        Pick a matchup from the sidebar. Line movement is tracked every refresh and BPI discrepancies are flagged as edges.
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100dvh",background:C.bg,color:C.text,fontFamily:"'Space Grotesk',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:${C.bg};} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        button:hover{filter:brightness(1.08);}
        .tab-bar{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
        .tab-bar::-webkit-scrollbar{display:none;}
        .odds-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
      `}</style>

      {isMobile ? (
        /* ── MOBILE: full-screen stack ── */
        <div style={{display:"flex",flexDirection:"column",height:"100dvh",overflow:"hidden"}}>
          {/* Header bar */}
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:C.panel,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{fontFamily:"'Bebas Neue',serif",fontSize:24,color:C.gold,letterSpacing:"0.06em",lineHeight:1}}>NBA EDGE</div>
            {sel&&<div style={{fontSize:12,fontWeight:700,color:C.sub}}>{sel.away} @ {sel.home}</div>}
          </div>
          {/* Content: show list OR detail */}
          {!sel ? (
            <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",background:C.panel}}>
              <GameList/>
            </div>
          ) : (
            <div style={{flex:1,overflowY:"auto",background:C.bg}}>
              <DetailPanel/>
            </div>
          )}
        </div>
      ) : (
        /* ── DESKTOP: sidebar + main ── */
        <div style={{display:"flex",flex:1,overflow:"hidden"}}>
          <aside style={{width:288,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",background:C.panel,flexShrink:0}}>
            <div style={{padding:"16px 14px 10px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontFamily:"'Bebas Neue',serif",fontSize:28,color:C.gold,letterSpacing:"0.06em",lineHeight:1}}>NBA EDGE</div>
              <div style={{fontSize:10,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:2}}>Spread Intelligence Platform</div>
            </div>
            <GameList/>
          </aside>
          <main style={{flex:1,overflowY:"auto"}}>
            <DetailPanel/>
          </main>
        </div>
      )}
    </div>
  );
}
