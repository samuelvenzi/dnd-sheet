import { useState, useCallback, useEffect } from "react";
import { Trash2, Plus, ChevronDown, ChevronUp, Download, Upload, RotateCcw, Skull, Heart, Sun, Moon } from "lucide-react";

const CLASSES = [{name:"Barbarian",hd:12},{name:"Bard",hd:8},{name:"Cleric",hd:8},{name:"Druid",hd:8},{name:"Fighter",hd:10},{name:"Monk",hd:8},{name:"Paladin",hd:10},{name:"Ranger",hd:10},{name:"Rogue",hd:8},{name:"Sorcerer",hd:6},{name:"Warlock",hd:8},{name:"Wizard",hd:6}];
const RACES = ["Dragonborn","Dwarf (Hill)","Dwarf (Mountain)","Elf (High)","Elf (Wood)","Elf (Dark/Drow)","Gnome (Forest)","Gnome (Rock)","Half-Elf","Half-Orc","Halfling (Lightfoot)","Halfling (Stout)","Human (Standard)","Human (Variant)","Tiefling"];
const BACKGROUNDS = ["Acolyte","Charlatan","Criminal","Entertainer","Folk Hero","Guild Artisan","Hermit","Noble","Outlander","Sage","Sailor","Soldier","Urchin"];
const ALIGNMENTS = ["Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","True Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil"];
const SKILLS = [{name:"Acrobatics",ab:"dex"},{name:"Animal Handling",ab:"wis"},{name:"Arcana",ab:"int"},{name:"Athletics",ab:"str"},{name:"Deception",ab:"cha"},{name:"History",ab:"int"},{name:"Insight",ab:"wis"},{name:"Intimidation",ab:"cha"},{name:"Investigation",ab:"int"},{name:"Medicine",ab:"wis"},{name:"Nature",ab:"int"},{name:"Perception",ab:"wis"},{name:"Performance",ab:"cha"},{name:"Persuasion",ab:"cha"},{name:"Religion",ab:"int"},{name:"Sleight of Hand",ab:"dex"},{name:"Stealth",ab:"dex"},{name:"Survival",ab:"wis"}];
const CONDITIONS = ["Blinded","Charmed","Deafened","Frightened","Grappled","Incapacitated","Invisible","Paralyzed","Petrified","Poisoned","Prone","Restrained","Stunned","Unconscious"];
const SCHOOLS = ["Abjuration","Conjuration","Divination","Enchantment","Evocation","Illusion","Necromancy","Transmutation"];
const XP_THRESHOLDS = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];

const defSkills = () => { const o={}; SKILLS.forEach(s=>{o[s.name]={proficient:false,expertise:false}}); return o; };
const defCond  = () => { const o={exhaustion:0}; CONDITIONS.forEach(c=>{o[c]=false}); return o; };
const defSpells= () => { const o={}; for(let i=0;i<=9;i++) o[i]=[]; return o; };
const defSlots = () => { const o={}; for(let i=1;i<=9;i++) o[i]={total:0,used:0}; return o; };

const DEFAULT = {
  identity:{name:"",cls:"",level:1,background:"",race:"",alignment:"",xp:0},
  abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10},
  saves:{str:false,dex:false,con:false,int:false,wis:false,cha:false},
  skills:defSkills(), inspiration:false,
  combat:{ac:10,initOverride:null,speed:30,maxHp:0,currentHp:0,tempHp:0,hdCurrent:1,dsSuc:[false,false,false],dsFail:[false,false,false]},
  conditions:defCond(), attacks:[], features:[],
  spellcasting:{cls:"",ability:"int",slots:defSlots()},
  spells:defSpells(),
  equipment:{cp:0,sp:0,ep:0,gp:0,pp:0,items:[]},
  notes:{backstory:"",allies:"",additional:"",treasure:"",appearance:{age:"",height:"",weight:"",eyes:"",skin:"",hair:""}},
  profLangs:"", personalityTraits:"", ideals:"", bonds:"", flaws:""
};

function deepSet(obj,path,val){
  const k=path.split(".");
  const r=JSON.parse(JSON.stringify(obj));
  let c=r; for(let i=0;i<k.length-1;i++) c=c[k[i]];
  c[k[k.length-1]]=val; return r;
}

const pb  = l => Math.ceil(l/4)+1;
const mod = s => Math.floor((s-10)/2);
const sgn = m => m>=0?`+${m}`:`${m}`;

// ── theme tokens ──────────────────────────────────────────────────────────
function mkTheme(dark) {
  return dark ? {
    bg:          '#0d0f14',
    surface:     '#13161e',
    card:        '#1a1d27',
    border:      '#252836',
    text:        '#e8eaf0',
    sub:         '#8b8fa8',
    muted:       '#4b4f68',
    accent:      '#7c6dfa',
    accentSoft:  'rgba(124,109,250,0.12)',
    accentHover: '#9585fc',
    inputBg:     '#0d0f14',
    inputBorder: '#252836',
    danger:      '#f87171',
    dangerSoft:  'rgba(248,113,113,0.12)',
    success:     '#4ade80',
    successSoft: 'rgba(74,222,128,0.12)',
    pip:         '#7c6dfa',
    pipEmpty:    '#252836',
    headerBg:    'rgba(13,15,20,0.92)',
    shadow:      '0 1px 3px rgba(0,0,0,0.4)',
    condOn:      'rgba(248,113,113,0.18)',
    condOnBorder:'#f87171',
  } : {
    bg:          '#f0f2f5',
    surface:     '#ffffff',
    card:        '#ffffff',
    border:      '#e2e6ed',
    text:        '#0f1219',
    sub:         '#6b7280',
    muted:       '#9ca3af',
    accent:      '#5b4ef8',
    accentSoft:  'rgba(91,78,248,0.08)',
    accentHover: '#4338e0',
    inputBg:     '#f7f8fa',
    inputBorder: '#d1d5db',
    danger:      '#dc2626',
    dangerSoft:  'rgba(220,38,38,0.08)',
    success:     '#16a34a',
    successSoft: 'rgba(22,163,74,0.08)',
    pip:         '#5b4ef8',
    pipEmpty:    '#e2e6ed',
    headerBg:    'rgba(240,242,245,0.92)',
    shadow:      '0 1px 3px rgba(0,0,0,0.08)',
    condOn:      'rgba(220,38,38,0.1)',
    condOnBorder:'#dc2626',
  };
}

const LS_KEY = "dnd-sheet-character";
const LS_THEME = "dnd-sheet-theme";

function loadCharacter() {
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

export default function Sheet() {
  const [C, setC]         = useState(() => ({ ...JSON.parse(JSON.stringify(DEFAULT)), ...(loadCharacter() ?? {}) }));
  const [tab, setTab]     = useState("core");
  const [dark, setDark]   = useState(() => localStorage.getItem(LS_THEME) !== "light");
  const [hpOpen, setHpOpen]     = useState(false);
  const [hpDelta, setHpDelta]   = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [spellOpen, setSpellOpen] = useState({0:true,1:true,2:false,3:false,4:false,5:false,6:false,7:false,8:false,9:false});
  const [spellDesc, setSpellDesc] = useState({});

  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(C)); } catch {} }, [C]);
  useEffect(() => { localStorage.setItem(LS_THEME, dark ? "dark" : "light"); }, [dark]);

  const T = mkTheme(dark);
  const upd = useCallback((path,val)=>setC(prev=>deepSet(prev,path,val)),[]);

  const mods   = {str:mod(C.abilities.str),dex:mod(C.abilities.dex),con:mod(C.abilities.con),int:mod(C.abilities.int),wis:mod(C.abilities.wis),cha:mod(C.abilities.cha)};
  const PB     = pb(C.identity.level);
  const jot    = C.identity.cls==="Bard" && C.identity.level>=2;
  const skillTotal = n => { const s=C.skills[n]; const sk=SKILLS.find(x=>x.name===n); const base=mods[sk.ab]; if(s.proficient) return base+PB+(s.expertise?PB:0); return base+(jot?Math.floor(PB/2):0); };
  const passPerc   = 10+skillTotal("Perception");
  const spAbMod    = mods[C.spellcasting.ability]||0;
  const spDC       = 8+PB+spAbMod;
  const spAtk      = PB+spAbMod;
  const clsInfo    = CLASSES.find(c=>c.name===C.identity.cls);
  const hd         = clsInfo?clsInfo.hd:"?";
  const lvl        = C.identity.level;
  const init       = C.combat.initOverride!==null?C.combat.initOverride:mods.dex;
  const totalWt    = C.equipment.items.reduce((s,i)=>s+(parseFloat(i.weight)||0)*(parseInt(i.qty)||1),0);
  const carrying   = C.abilities.str*15;
  const encSt      = totalWt>C.abilities.str*10?"Heavily Encumbered":totalWt>C.abilities.str*5?"Encumbered":"Normal";
  const totalGP    = C.equipment.cp/100+C.equipment.sp/10+C.equipment.ep/2+C.equipment.gp+C.equipment.pp*10;
  const nextXP     = XP_THRESHOLDS[Math.min(lvl,19)];
  const isDying    = C.combat.currentHp===0;

  const exportJSON = () => { const nm=C.identity.name||"character"; const b=new Blob([JSON.stringify(C,null,2)],{type:"application/json"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=`${nm.replace(/\s+/g,"_")}.json`; a.click(); URL.revokeObjectURL(u); };
  const importJSON = () => { const i=document.createElement("input"); i.type="file"; i.accept=".json"; i.onchange=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{try{setC({...JSON.parse(JSON.stringify(DEFAULT)),...JSON.parse(ev.target.result)});}catch{alert("Invalid JSON");}}; r.readAsText(f); }; i.click(); };
  const applyHp = dmg => { const d=parseInt(hpDelta)||0; const nv=dmg?Math.max(0,C.combat.currentHp-d):Math.min(C.combat.maxHp+(C.combat.tempHp||0),C.combat.currentHp+d); upd("combat.currentHp",nv); setHpOpen(false); setHpDelta(""); };

  // ── shared style helpers ──────────────────────────────────────────────
  const card  = { background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16, boxShadow:T.shadow };
  const label = { fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:T.sub, marginBottom:6 };
  const inp   = { background:T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:8, padding:'6px 10px', color:T.text, fontSize:13, width:'100%', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const };
  const numInp= { background:T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:8, padding:'4px 6px', color:T.text, fontSize:13, textAlign:'center' as const, outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const };
  const btn   = (variant='default') => ({
    display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:500,
    padding:'5px 10px', borderRadius:7, cursor:'pointer', border:'none', fontFamily:'inherit',
    ...(variant==='primary'  ? {background:T.accent,      color:'#fff'} :
        variant==='danger'   ? {background:T.dangerSoft,  color:T.danger,  border:`1px solid ${T.danger}`} :
        variant==='success'  ? {background:T.successSoft, color:T.success, border:`1px solid ${T.success}`} :
                               {background:T.accentSoft,  color:T.accent,  border:`1px solid ${T.border}`})
  });
  const tag = (active) => ({
    fontSize:11, padding:'3px 10px', borderRadius:20, cursor:'pointer', border:`1px solid`,
    background: active ? T.condOn     : T.surface,
    borderColor: active? T.condOnBorder : T.border,
    color: active ? T.danger : T.sub,
    fontWeight: active ? 600 : 400,
    transition:'all 0.15s',
  });

  // ── stat box ─────────────────────────────────────────────────────────
  const StatBox = ({label:l, value, children, accent}) => (
    <div style={{...card, textAlign:'center', padding:'12px 8px', background: accent?T.accentSoft:T.card, borderColor: accent?T.accent:T.border}}>
      <div style={{...label, marginBottom:4}}>{l}</div>
      {children || <div style={{fontSize:22, fontWeight:700, color: accent?T.accent:T.text, lineHeight:1}}>{value}</div>}
    </div>
  );

  // ── CORE ─────────────────────────────────────────────────────────────
  const renderCore = () => (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:16}}>
      {/* Abilities */}
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <div style={card}>
          <div style={label}>Ability Scores</div>
          <div style={{display:'flex', flexDirection:'column', gap:6}}>
            {["str","dex","con","int","wis","cha"].map(ab=>{
              const names={str:"Strength",dex:"Dexterity",con:"Constitution",int:"Intelligence",wis:"Wisdom",cha:"Charisma"};
              const m=mods[ab]; const sv=C.saves[ab]; const st=m+(sv?PB:0);
              return (
                <div key={ab} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, background:T.surface, border:`1px solid ${T.border}`}}>
                  <div style={{width:84, fontSize:12, color:T.sub, fontWeight:500}}>{names[ab]}</div>
                  <input type="number" min={1} max={30} value={C.abilities[ab]}
                    onChange={e=>upd(`abilities.${ab}`,Math.max(1,Math.min(30,parseInt(e.target.value)||1)))}
                    style={{...numInp, width:46, fontSize:15, fontWeight:700}}/>
                  <div style={{fontSize:20, fontWeight:800, color:T.accent, width:36, textAlign:'center'}}>{sgn(m)}</div>
                  <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:6}}>
                    <span style={{fontSize:11, color:T.muted}}>Save</span>
                    <input type="checkbox" checked={sv} onChange={e=>upd(`saves.${ab}`,e.target.checked)} style={{accentColor:T.accent, width:13, height:13}}/>
                    <span style={{fontSize:13, fontWeight:600, color:T.text, width:28, textAlign:'right'}}>{sgn(st)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{...card, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{textAlign:'center'}}>
            <div style={label}>Inspiration</div>
            <input type="checkbox" checked={C.inspiration} onChange={e=>upd("inspiration",e.target.checked)} style={{accentColor:T.accent, width:18, height:18, marginTop:2}}/>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={label}>Prof Bonus</div>
            <div style={{fontSize:24, fontWeight:800, color:T.accent}}>{sgn(PB)}</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={label}>Passive Perc</div>
            <div style={{fontSize:24, fontWeight:800, color:T.accent}}>{passPerc}</div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{...card, alignSelf:'start'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
          <div style={label}>Skills</div>
          {jot && <span style={{fontSize:11, color:T.accent, background:T.accentSoft, border:`1px solid ${T.accent}`, borderRadius:20, padding:'2px 8px', fontWeight:600}}>Jack of All Trades +{Math.floor(PB/2)}</span>}
        </div>
        <div style={{display:'flex', gap:8, marginBottom:8}}>
          <span style={{fontSize:11, color:T.muted}}>● Prof</span>
          <span style={{fontSize:11, color:T.muted}}>◆ Expert</span>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:1, overflowY:'auto', maxHeight:400}}>
          {SKILLS.map(sk=>{
            const sv=C.skills[sk.name]; const tot=skillTotal(sk.name);
            return (
              <div key={sk.name} style={{display:'flex', alignItems:'center', gap:8, padding:'4px 6px', borderRadius:6, cursor:'default'}}
                onMouseEnter={e=>e.currentTarget.style.background=T.accentSoft}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <input type="checkbox" checked={sv.proficient} onChange={e=>setC(p=>deepSet(p,`skills.${sk.name}.proficient`,e.target.checked))} style={{accentColor:T.accent, width:12, height:12}} title="Proficient"/>
                <input type="checkbox" checked={sv.expertise} onChange={e=>setC(p=>deepSet(p,`skills.${sk.name}.expertise`,e.target.checked))} style={{accentColor:T.accent, width:12, height:12}} title="Expertise"/>
                <span style={{flex:1, fontSize:13, color:T.text}}>{sk.name}</span>
                <span style={{fontSize:11, color:T.muted, width:26, textAlign:'center', textTransform:'uppercase'}}>{sk.ab}</span>
                <span style={{fontSize:13, fontWeight:700, color:T.accent, width:30, textAlign:'right'}}>{sgn(tot)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personality */}
      <div style={{display:'flex', flexDirection:'column', gap:12, alignSelf:'start'}}>
        {[["personalityTraits","Personality Traits"],["ideals","Ideals"],["bonds","Bonds"],["flaws","Flaws"]].map(([k,l])=>(
          <div key={k} style={card}>
            <div style={label}>{l}</div>
            <textarea value={C[k]} onChange={e=>upd(k,e.target.value)} rows={2}
              style={{...inp, resize:'none'}} placeholder={l+"..."}/>
          </div>
        ))}
        <div style={card}>
          <div style={label}>Proficiencies & Languages</div>
          <textarea value={C.profLangs} onChange={e=>upd("profLangs",e.target.value)} rows={3}
            style={{...inp, resize:'none'}} placeholder="Armor, weapons, tools, languages..."/>
        </div>
      </div>
    </div>
  );

  // ── COMBAT ───────────────────────────────────────────────────────────
  const renderCombat = () => (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <div style={card}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(100px,1fr))', gap:10, marginBottom:16}}>
          <StatBox label="Armor Class"><input type="number" min={0} value={C.combat.ac} onChange={e=>upd("combat.ac",parseInt(e.target.value)||0)} style={{...numInp, fontSize:22, fontWeight:800, width:'100%', color:T.text}}/></StatBox>
          <StatBox label="Initiative">
            <div style={{fontSize:22, fontWeight:800, color:T.text}}>{sgn(init)}</div>
            <input type="number" value={C.combat.initOverride??""} onChange={e=>upd("combat.initOverride",e.target.value===""?null:parseInt(e.target.value))} style={{...numInp, fontSize:11, marginTop:4, width:60}} placeholder="override"/>
          </StatBox>
          <StatBox label="Speed (ft)"><input type="number" min={0} value={C.combat.speed} onChange={e=>upd("combat.speed",parseInt(e.target.value)||0)} style={{...numInp, fontSize:22, fontWeight:800, width:'100%', color:T.text}}/></StatBox>
          <StatBox label="Max HP"><input type="number" min={0} value={C.combat.maxHp} onChange={e=>upd("combat.maxHp",parseInt(e.target.value)||0)} style={{...numInp, fontSize:22, fontWeight:800, width:'100%', color:T.text}}/></StatBox>
          <StatBox label="Current HP" accent>
            <div style={{fontSize:22, fontWeight:800, color:isDying?T.danger:T.accent, lineHeight:1, ...(isDying?{animation:'pulse 1s infinite'}:{})}}>{C.combat.currentHp}</div>
            <button onClick={()=>setHpOpen(true)} style={{...btn(), marginTop:4, fontSize:11}}>+/−</button>
          </StatBox>
          <StatBox label="Temp HP"><input type="number" min={0} value={C.combat.tempHp} onChange={e=>upd("combat.tempHp",parseInt(e.target.value)||0)} style={{...numInp, fontSize:22, fontWeight:800, width:'100%', color:T.text}}/></StatBox>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div>
            <div style={label}>Hit Dice</div>
            <div style={{fontSize:15, fontWeight:700, color:T.text, marginBottom:6}}>{lvl}d{hd}</div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:12, color:T.sub}}>Remaining</span>
              <input type="number" min={0} max={lvl} value={C.combat.hdCurrent} onChange={e=>upd("combat.hdCurrent",Math.max(0,Math.min(lvl,parseInt(e.target.value)||0)))} style={{...numInp, width:50}}/>
            </div>
          </div>
          <div style={isDying?{background:T.dangerSoft, border:`1px solid ${T.danger}`, borderRadius:10, padding:10}:{}}>
            <div style={label}>Death Saves</div>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6}}>
              <Heart size={13} color={T.success}/><span style={{fontSize:12, color:T.sub}}>Successes</span>
              {C.combat.dsSuc.map((v,i)=><input key={i} type="checkbox" checked={v} onChange={e=>{const a=[...C.combat.dsSuc];a[i]=e.target.checked;upd("combat.dsSuc",a);}} style={{accentColor:T.success, width:15, height:15}}/>)}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <Skull size={13} color={T.danger}/><span style={{fontSize:12, color:T.sub}}>Failures</span>
              {C.combat.dsFail.map((v,i)=><input key={i} type="checkbox" checked={v} onChange={e=>{const a=[...C.combat.dsFail];a[i]=e.target.checked;upd("combat.dsFail",a);}} style={{accentColor:T.danger, width:15, height:15}}/>)}
            </div>
          </div>
        </div>
      </div>

      {/* Attacks */}
      <div style={card}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div style={label}>Attacks & Spellcasting</div>
          <button onClick={()=>setC(p=>({...p,attacks:[...p.attacks,{name:"",bonus:"",damage:"",notes:""}]}))} style={btn('primary')}><Plus size={12}/>Add Attack</button>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', fontSize:12, borderCollapse:'collapse'}}>
            <thead><tr style={{color:T.sub, borderBottom:`1px solid ${T.border}`}}>
              {["Name","Atk Bonus","Damage / Type","Notes",""].map(h=><th key={h} style={{textAlign:'left', padding:'4px 6px', fontWeight:600}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {C.attacks.length===0&&<tr><td colSpan={5} style={{textAlign:'center', padding:20, color:T.muted, fontStyle:'italic'}}>No attacks — add one above</td></tr>}
              {C.attacks.map((a,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:'4px 4px 4px 0'}}><input value={a.name} onChange={e=>{const arr=[...C.attacks];arr[i]={...arr[i],name:e.target.value};upd("attacks",arr);}} style={inp} placeholder="Name"/></td>
                  <td style={{padding:'4px 4px'}}><input value={a.bonus} onChange={e=>{const arr=[...C.attacks];arr[i]={...arr[i],bonus:e.target.value};upd("attacks",arr);}} style={{...inp, width:64}} placeholder="+5"/></td>
                  <td style={{padding:'4px 4px'}}><input value={a.damage} onChange={e=>{const arr=[...C.attacks];arr[i]={...arr[i],damage:e.target.value};upd("attacks",arr);}} style={inp} placeholder="1d8+3 slashing"/></td>
                  <td style={{padding:'4px 4px'}}><input value={a.notes} onChange={e=>{const arr=[...C.attacks];arr[i]={...arr[i],notes:e.target.value};upd("attacks",arr);}} style={inp} placeholder="Notes"/></td>
                  <td style={{padding:'4px 0 4px 4px'}}><button onClick={()=>upd("attacks",C.attacks.filter((_,j)=>j!==i))} style={{...btn('danger'), padding:'4px 6px'}}><Trash2 size={11}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conditions */}
      <div style={card}>
        <div style={{...label, marginBottom:10}}>Conditions</div>
        <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {CONDITIONS.map(c=>(
            <button key={c} onClick={()=>upd(`conditions.${c}`,!C.conditions[c])} style={tag(C.conditions[c])}>{c}</button>
          ))}
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={tag(C.conditions.exhaustion>0)}>Exhaustion</span>
            <select value={C.conditions.exhaustion} onChange={e=>upd("conditions.exhaustion",parseInt(e.target.value))}
              style={{...numInp, width:52, fontSize:12}}>
              {[0,1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={card}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div style={label}>Features & Traits</div>
          <button onClick={()=>setC(p=>({...p,features:[...p.features,{name:"",description:""}]}))} style={btn('primary')}><Plus size={12}/>Add Feature</button>
        </div>
        {C.features.length===0&&<div style={{textAlign:'center', color:T.muted, fontStyle:'italic', padding:16}}>No features added</div>}
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {C.features.map((f,i)=>(
            <div key={i} style={{background:T.surface, borderRadius:8, padding:10, border:`1px solid ${T.border}`}}>
              <div style={{display:'flex', gap:8, marginBottom:6}}>
                <input value={f.name} onChange={e=>{const a=[...C.features];a[i]={...a[i],name:e.target.value};upd("features",a);}} style={{...inp, fontWeight:600}} placeholder="Feature name"/>
                <button onClick={()=>upd("features",C.features.filter((_,j)=>j!==i))} style={{...btn('danger'), flexShrink:0, padding:'4px 8px'}}><Trash2 size={11}/></button>
              </div>
              <textarea value={f.description} onChange={e=>{const a=[...C.features];a[i]={...a[i],description:e.target.value};upd("features",a);}} rows={2} style={{...inp, resize:'none'}} placeholder="Description..."/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── SPELLS ───────────────────────────────────────────────────────────
  const renderSpells = () => (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <div style={{...card, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:12}}>
        <div><div style={label}>Spellcasting Class</div><input value={C.spellcasting.cls} onChange={e=>upd("spellcasting.cls",e.target.value)} style={inp} placeholder="Class"/></div>
        <div><div style={label}>Spellcasting Ability</div>
          <select value={C.spellcasting.ability} onChange={e=>upd("spellcasting.ability",e.target.value)} style={inp}>
            <option value="int">Intelligence</option><option value="wis">Wisdom</option><option value="cha">Charisma</option>
          </select>
        </div>
        <StatBox label="Spell Save DC" value={spDC} accent/>
        <StatBox label="Spell Attack Bonus" value={sgn(spAtk)} accent/>
      </div>

      <div style={card}>
        <div style={{...label, marginBottom:10}}>Spell Slots</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(9, 1fr)', gap:8}}>
          {[1,2,3,4,5,6,7,8,9].map(l=>{
            const sl=C.spellcasting.slots[l];
            return (
              <div key={l} style={{textAlign:'center', background:T.surface, borderRadius:8, padding:'8px 4px', border:`1px solid ${T.border}`}}>
                <div style={{fontSize:11, color:T.sub, marginBottom:4, fontWeight:600}}>Lv {l}</div>
                <input type="number" min={0} max={10} value={sl.total}
                  onChange={e=>setC(p=>deepSet(p,`spellcasting.slots.${l}.total`,Math.max(0,parseInt(e.target.value)||0)))}
                  style={{...numInp, width:36, fontSize:12, marginBottom:6}}/>
                <div style={{display:'flex', flexWrap:'wrap', gap:3, justifyContent:'center', minHeight:12}}>
                  {Array.from({length:sl.total},(_,i)=>(
                    <button key={i} onClick={()=>{const nu=i<sl.used?i:i+1; setC(p=>deepSet(p,`spellcasting.slots.${l}.used`,nu));}}
                      title={i<sl.used?"Restore":"Use"}
                      style={{width:10, height:10, borderRadius:'50%', border:`1px solid ${i<sl.used?T.muted:T.accent}`, background:i<sl.used?T.pipEmpty:T.pip, cursor:'pointer', padding:0, transition:'all 0.15s'}}/>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {[0,1,2,3,4,5,6,7,8,9].map(lvl=>{
        const spells=C.spells[lvl]||[];
        const open=spellOpen[lvl]!==false;
        return (
          <div key={lvl} style={card}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}} onClick={()=>setSpellOpen(p=>({...p,[lvl]:!open}))}>
              <div style={label}>{lvl===0?"Cantrips":`Level ${lvl} Spells`}</div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{fontSize:11, color:T.muted}}>{spells.length}</span>
                {open?<ChevronUp size={14} color={T.sub}/>:<ChevronDown size={14} color={T.sub}/>}
              </div>
            </div>
            {open&&(
              <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:8}}>
                {spells.map((sp,i)=>{
                  const dk=`${lvl}-${i}`;
                  const dOpen=spellDesc[dk];
                  const setSpArr=arr=>setC(p=>deepSet(p,`spells.${lvl}`,arr));
                  const upSp=(f,v)=>{const a=[...C.spells[lvl]];a[i]={...a[i],[f]:v};setSpArr(a);};
                  const upSpC=(c,v)=>{const a=[...C.spells[lvl]];a[i]={...a[i],components:{...(a[i].components||{}),[c]:v}};setSpArr(a);};
                  return (
                    <div key={i} style={{background:T.surface, borderRadius:8, padding:10, border:`1px solid ${T.border}`}}>
                      <div style={{display:'grid', gridTemplateColumns:'1fr 160px', gap:8, marginBottom:8}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          {lvl>0&&<label style={{display:'flex', alignItems:'center', gap:4, fontSize:11, color:T.sub, whiteSpace:'nowrap'}}><input type="checkbox" checked={sp.prepared||false} onChange={e=>upSp("prepared",e.target.checked)} style={{accentColor:T.accent}}/>Prep</label>}
                          <input value={sp.name||""} onChange={e=>upSp("name",e.target.value)} style={{...inp, fontWeight:600}} placeholder="Spell name"/>
                        </div>
                        <select value={sp.school||"Evocation"} onChange={e=>upSp("school",e.target.value)} style={inp}>
                          {SCHOOLS.map(s=><option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:8}}>
                        <input value={sp.castingTime||""} onChange={e=>upSp("castingTime",e.target.value)} style={inp} placeholder="Casting time"/>
                        <input value={sp.range||""} onChange={e=>upSp("range",e.target.value)} style={inp} placeholder="Range"/>
                        <input value={sp.duration||""} onChange={e=>upSp("duration",e.target.value)} style={inp} placeholder="Duration"/>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:14, flexWrap:'wrap'}}>
                        {["V","S","M"].map(c=>(
                          <label key={c} style={{display:'flex', alignItems:'center', gap:4, fontSize:12, color:T.sub, cursor:'pointer'}}>
                            <input type="checkbox" checked={(sp.components||{})[c]||false} onChange={e=>upSpC(c,e.target.checked)} style={{accentColor:T.accent}}/>{c}
                          </label>
                        ))}
                        <label style={{display:'flex', alignItems:'center', gap:4, fontSize:12, color:T.sub, cursor:'pointer'}}><input type="checkbox" checked={sp.concentration||false} onChange={e=>upSp("concentration",e.target.checked)} style={{accentColor:T.accent}}/>Conc.</label>
                        <label style={{display:'flex', alignItems:'center', gap:4, fontSize:12, color:T.sub, cursor:'pointer'}}><input type="checkbox" checked={sp.ritual||false} onChange={e=>upSp("ritual",e.target.checked)} style={{accentColor:T.accent}}/>Ritual</label>
                        <button onClick={()=>setSpellDesc(p=>({...p,[dk]:!dOpen}))} style={{...btn(), marginLeft:'auto', fontSize:11}}>{dOpen?"▲ Hide":"▼ Desc"}</button>
                        <button onClick={()=>setSpArr(C.spells[lvl].filter((_,j)=>j!==i))} style={{...btn('danger'), padding:'4px 8px'}}><Trash2 size={11}/></button>
                      </div>
                      {dOpen&&<textarea value={sp.description||""} onChange={e=>upSp("description",e.target.value)} rows={3} style={{...inp, resize:'none', marginTop:8}} placeholder="Spell description..."/>}
                    </div>
                  );
                })}
                <button onClick={()=>{const a=[...C.spells[lvl],{name:"",school:"Evocation",castingTime:"",range:"",duration:"",components:{},concentration:false,ritual:false,prepared:false,description:""}];setC(p=>deepSet(p,`spells.${lvl}`,a));}}
                  style={{...btn('primary'), justifyContent:'center', width:'100%', padding:'8px'}}>
                  <Plus size={12}/>Add {lvl===0?"Cantrip":"Spell"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── EQUIPMENT ────────────────────────────────────────────────────────
  const renderEquipment = () => (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <div style={card}>
        <div style={{...label, marginBottom:10}}>Currency</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10}}>
          {[["cp","CP","Copper","#b45309"],["sp","SP","Silver","#64748b"],["ep","EP","Electrum","#3b82f6"],["gp","GP","Gold","#d97706"],["pp","PP","Platinum","#8b5cf6"]].map(([k,abbr,label_,cl])=>(
            <div key={k} style={{textAlign:'center', background:T.surface, borderRadius:8, padding:10, border:`1px solid ${T.border}`}}>
              <div style={{fontSize:13, fontWeight:700, color:cl}}>{abbr}</div>
              <div style={{fontSize:11, color:T.muted, marginBottom:4}}>{label_}</div>
              <input type="number" min={0} value={C.equipment[k]} onChange={e=>upd(`equipment.${k}`,Math.max(0,parseInt(e.target.value)||0))} style={{...numInp, width:'100%', fontSize:16, fontWeight:700}}/>
            </div>
          ))}
        </div>
        <div style={{marginTop:8, textAlign:'right', fontSize:12, color:T.sub}}>
          GP equivalent: <strong style={{color:T.accent}}>{totalGP.toFixed(2)} gp</strong>
        </div>
      </div>
      <div style={card}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div style={label}>Inventory</div>
          <button onClick={()=>setC(p=>({...p,equipment:{...p.equipment,items:[...p.equipment.items,{name:"",qty:1,weight:0,value:"",notes:"",equipped:false}]}}))} style={btn('primary')}><Plus size={12}/>Add Item</button>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', fontSize:12, borderCollapse:'collapse'}}>
            <thead><tr style={{color:T.sub, borderBottom:`1px solid ${T.border}`}}>
              {["Eq","Name","Qty","Wt (lb)","Value","Notes",""].map(h=><th key={h} style={{textAlign:'left', padding:'4px 6px', fontWeight:600}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {C.equipment.items.length===0&&<tr><td colSpan={7} style={{textAlign:'center', padding:20, color:T.muted, fontStyle:'italic'}}>No items</td></tr>}
              {C.equipment.items.map((it,i)=>{
                const upIt=(f,v)=>{const items=[...C.equipment.items];items[i]={...items[i],[f]:v};upd("equipment.items",items);};
                return (
                  <tr key={i} style={{borderBottom:`1px solid ${T.border}`, background:it.equipped?T.accentSoft:'transparent'}}>
                    <td style={{padding:'4px 6px'}}><input type="checkbox" checked={it.equipped||false} onChange={e=>upIt("equipped",e.target.checked)} style={{accentColor:T.accent, width:14, height:14}}/></td>
                    <td style={{padding:'4px 4px'}}><input value={it.name||""} onChange={e=>upIt("name",e.target.value)} style={inp} placeholder="Item name"/></td>
                    <td style={{padding:'4px 4px'}}><input type="number" min={1} value={it.qty||1} onChange={e=>upIt("qty",parseInt(e.target.value)||1)} style={{...numInp, width:50}}/></td>
                    <td style={{padding:'4px 4px'}}><input type="number" min={0} step={0.1} value={it.weight||0} onChange={e=>upIt("weight",parseFloat(e.target.value)||0)} style={{...numInp, width:60}}/></td>
                    <td style={{padding:'4px 4px'}}><input value={it.value||""} onChange={e=>upIt("value",e.target.value)} style={{...inp, width:70}} placeholder="15 gp"/></td>
                    <td style={{padding:'4px 4px'}}><input value={it.notes||""} onChange={e=>upIt("notes",e.target.value)} style={inp} placeholder="Notes"/></td>
                    <td style={{padding:'4px 0 4px 4px'}}><button onClick={()=>upd("equipment.items",C.equipment.items.filter((_,j)=>j!==i))} style={{...btn('danger'), padding:'4px 6px'}}><Trash2 size={11}/></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:10, display:'flex', gap:20, fontSize:12, color:T.sub}}>
          <span>Total weight: <strong style={{color:T.text}}>{totalWt.toFixed(1)} lb</strong></span>
          <span>Capacity: <strong style={{color:T.text}}>{carrying} lb</strong></span>
          <span style={{color: encSt!=="Normal"?T.danger:T.success, fontWeight:600}}>{encSt}</span>
        </div>
      </div>
    </div>
  );

  // ── NOTES ────────────────────────────────────────────────────────────
  const renderNotes = () => (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <div style={card}>
        <div style={{...label, marginBottom:10}}>Appearance</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px,1fr))', gap:10}}>
          {[["age","Age"],["height","Height"],["weight","Weight"],["eyes","Eyes"],["skin","Skin"],["hair","Hair"]].map(([k,l])=>(
            <div key={k}><div style={label}>{l}</div><input value={C.notes.appearance[k]||""} onChange={e=>setC(p=>deepSet(p,`notes.appearance.${k}`,e.target.value))} style={inp} placeholder={l}/></div>
          ))}
        </div>
      </div>
      <div style={card}><div style={label}>Character Backstory</div><textarea value={C.notes.backstory} onChange={e=>upd("notes.backstory",e.target.value)} rows={8} style={{...inp, resize:'none'}} placeholder="Your character's history and origin..."/></div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div style={card}><div style={label}>Allies & Organizations</div><textarea value={C.notes.allies} onChange={e=>upd("notes.allies",e.target.value)} rows={6} style={{...inp, resize:'none'}} placeholder="Allies, factions, organizations..."/></div>
        <div style={card}><div style={label}>Treasure</div><textarea value={C.notes.treasure} onChange={e=>upd("notes.treasure",e.target.value)} rows={6} style={{...inp, resize:'none'}} placeholder="Special items, non-tracked wealth..."/></div>
      </div>
      <div style={card}><div style={label}>Additional Notes</div><textarea value={C.notes.additional} onChange={e=>upd("notes.additional",e.target.value)} rows={6} style={{...inp, resize:'none'}} placeholder="Any other notes..."/></div>
    </div>
  );

  // ── ROOT ─────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"}}>
      {/* HP Modal */}
      {hpOpen&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}} onClick={()=>setHpOpen(false)}>
          <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:24, width:260, boxShadow:'0 20px 60px rgba(0,0,0,0.35)'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16, fontWeight:700, textAlign:'center', marginBottom:4, color:T.text}}>Adjust HP</div>
            <div style={{textAlign:'center', fontSize:13, color:T.sub, marginBottom:12}}>{C.combat.currentHp} / {C.combat.maxHp}</div>
            <input type="number" min={0} value={hpDelta} onChange={e=>setHpDelta(e.target.value)} style={{...numInp, width:'100%', fontSize:24, fontWeight:800, marginBottom:12}} autoFocus placeholder="0"/>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8}}>
              <button onClick={()=>applyHp(true)} style={{...btn('danger'), justifyContent:'center', padding:'9px', fontSize:13, fontWeight:600}}>Damage</button>
              <button onClick={()=>applyHp(false)} style={{...btn('success'), justifyContent:'center', padding:'9px', fontSize:13, fontWeight:600}}>Heal</button>
            </div>
            <button onClick={()=>setHpOpen(false)} style={{width:'100%', background:'none', border:'none', color:T.muted, fontSize:12, cursor:'pointer', padding:'4px'}}>Cancel</button>
          </div>
        </div>
      )}
      {/* Reset Modal */}
      {resetOpen&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}>
          <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:24, width:300, boxShadow:'0 20px 60px rgba(0,0,0,0.35)'}}>
            <div style={{fontSize:16, fontWeight:700, textAlign:'center', marginBottom:6, color:T.text}}>Reset character sheet?</div>
            <div style={{textAlign:'center', fontSize:13, color:T.sub, marginBottom:16}}>All data will be erased. This cannot be undone.</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              <button onClick={()=>{setC(JSON.parse(JSON.stringify(DEFAULT)));setResetOpen(false);}} style={{...btn('danger'), justifyContent:'center', padding:'9px', fontSize:13, fontWeight:600}}>Reset</button>
              <button onClick={()=>setResetOpen(false)} style={{...btn(), justifyContent:'center', padding:'9px', fontSize:13, fontWeight:600}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div style={{position:'sticky', top:0, zIndex:40, borderBottom:`1px solid ${T.border}`, backdropFilter:'blur(12px)', background:T.headerBg, padding:'12px 20px'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:10, marginBottom:10}}>
            <div style={{gridColumn:'span 2'}}>
              <div style={{...label, marginBottom:4}}>Character Name</div>
              <input value={C.identity.name} onChange={e=>upd("identity.name",e.target.value)}
                style={{background:'transparent', border:'none', borderBottom:`2px solid ${T.border}`, color:T.text, fontSize:20, fontWeight:800, width:'100%', outline:'none', paddingBottom:2, fontFamily:'inherit'}}
                placeholder="Character Name"
                onFocus={e=>e.target.style.borderBottomColor=T.accent}
                onBlur={e=>e.target.style.borderBottomColor=T.border}
              />
            </div>
            <div><div style={label}>Class</div>
              <div style={{display:'flex', gap:6}}>
                <select value={C.identity.cls} onChange={e=>upd("identity.cls",e.target.value)} style={{...inp, flex:1}}>
                  <option value="">— Class —</option>{CLASSES.map(c=><option key={c.name}>{c.name}</option>)}
                </select>
                <input type="number" min={1} max={20} value={C.identity.level} onChange={e=>upd("identity.level",Math.max(1,Math.min(20,parseInt(e.target.value)||1)))} style={{...numInp, width:44}}/>
              </div>
            </div>
            <div><div style={label}>Race</div>
              <select value={C.identity.race} onChange={e=>upd("identity.race",e.target.value)} style={inp}>
                <option value="">— Race —</option>{RACES.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div><div style={label}>Background</div>
              <select value={C.identity.background} onChange={e=>upd("identity.background",e.target.value)} style={inp}>
                <option value="">— Background —</option>{BACKGROUNDS.map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div><div style={label}>Alignment</div>
              <select value={C.identity.alignment} onChange={e=>upd("identity.alignment",e.target.value)} style={inp}>
                <option value="">— Alignment —</option>{ALIGNMENTS.map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', justifyContent:'space-between'}}>
            <div style={{display:'flex', alignItems:'center', gap:16}}>
              <div><div style={label}>XP</div>
                <div style={{display:'flex', alignItems:'center', gap:6}}>
                  <input type="number" min={0} value={C.identity.xp} onChange={e=>upd("identity.xp",Math.max(0,parseInt(e.target.value)||0))} style={{...numInp, width:80, fontSize:13}}/>
                  <span style={{fontSize:11, color:T.muted}}>/ {nextXP.toLocaleString()}</span>
                </div>
              </div>
              <div style={{textAlign:'center'}}><div style={label}>Prof Bonus</div><div style={{fontSize:20, fontWeight:800, color:T.accent}}>{sgn(PB)}</div></div>
              <div style={{textAlign:'center'}}><div style={label}>Passive Perc</div><div style={{fontSize:20, fontWeight:800, color:T.accent}}>{passPerc}</div></div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <button onClick={()=>setDark(d=>!d)} style={{...btn(), padding:'6px 10px'}} title="Toggle theme">
                {dark?<Sun size={14}/>:<Moon size={14}/>}
              </button>
              <a href="https://github.com/samuelvenzi/dnd-sheet" target="_blank" rel="noreferrer"
                style={{...btn(), textDecoration:'none'}} title="View on GitHub">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 6.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <button onClick={exportJSON} style={btn()}><Download size={12}/>Export</button>
              <button onClick={importJSON} style={btn()}><Upload size={12}/>Import</button>
              <button onClick={()=>setResetOpen(true)} style={btn('danger')}><RotateCcw size={12}/>Reset</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────────── */}
      <div style={{maxWidth:1100, margin:'0 auto', padding:'0 20px'}}>
        <div style={{display:'flex', borderBottom:`1px solid ${T.border}`, marginBottom:0}}>
          {["Core","Combat","Spells","Equipment","Notes"].map(t=>(
            <button key={t} onClick={()=>setTab(t.toLowerCase())}
              style={{padding:'12px 16px', fontSize:13, fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
                color: tab===t.toLowerCase()?T.accent:T.sub,
                borderBottom: tab===t.toLowerCase()?`2px solid ${T.accent}`:'2px solid transparent',
                marginBottom:-1,
              }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{padding:'20px 0 40px'}}>
          {tab==="core"      && renderCore()}
          {tab==="combat"    && renderCombat()}
          {tab==="spells"    && renderSpells()}
          {tab==="equipment" && renderEquipment()}
          {tab==="notes"     && renderNotes()}
        </div>
      </div>
      <div style={{borderTop:`1px solid ${T.border}`, padding:'16px 20px', textAlign:'center', fontSize:11, color:T.muted}}>
        Unofficial fan tool — not affiliated with, endorsed by, or connected to Wizards of the Coast.
        Dungeons &amp; Dragons is a trademark of Wizards of the Coast LLC.
        Used under the <a href="https://company.wizards.com/en/legal/fancontentpolicy" target="_blank" rel="noreferrer" style={{color:T.sub}}>Fan Content Policy</a>.
        {' · '}
        <a href="https://github.com/samuelvenzi/dnd-sheet#readme" target="_blank" rel="noreferrer" style={{color:T.sub}}>How to create your character JSON</a>
      </div>
    </div>
  );
}
