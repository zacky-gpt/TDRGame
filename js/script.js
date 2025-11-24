// エラーハンドリング
window.onerror = function(msg, url, line) {
    const el = document.getElementById('error-trap');
    if(el) { el.style.display = 'block'; el.innerText = `ERROR: ${msg} (Line ${line})`; }
    return false;
};

// --- 定数 ---
const CONF = { initTurns: 150, maxFloor: 10, itemMax: 3 };
const SAVE_KEY = 'trd_save_data_v29_mug_fix'; // Key updated

const JOBS = [
    { id:'novice', name:'Novice', req:null, bonus:{}, desc:"凡人", priority:1, skill:{id:'Guts', name:"Guts", type:"buff", cd:15, pwr:0, acc:1.0, desc:"食いしばり(2T)"} },
    { id:'veteran', name:'Veteran', req:{lv_min:10}, bonus:{phys:1.1, mag:1.1, def:0.9}, desc:"熟練者(全能微増)", priority:1.2, skill:{id:'Guts+', name:"Guts+", type:"buff", cd:15, pwr:0, acc:1.0, desc:"食いしばり(3T)+攻UP"} },
    { id:'hero', name:'Hero', req:{lv_min:20}, bonus:{phys:1.2, mag:1.2, def:0.8, eva:0.1}, desc:"英雄(全能強化)", priority:1.5, skill:{id:'Awakening', name:"Awakening", type:"buff", cd:20, pwr:0, acc:1.0, desc:"覚醒(4T不死+全強化)"} },

    { id:'warrior', name:'Warrior', req:{t_min:70}, bonus:{phys:1.2}, desc:"物攻+20%", priority:2, skill:{id:'Braver', name:"Braver", type:"phys", cd:10, pwr:2.5, acc:0.95, desc:"必殺の一撃"} },
    { id:'wizard', name:'Wizard', req:{t_max:30}, bonus:{mag:1.2}, desc:"魔攻+20%", priority:2, skill:{id:'Fireball', name:"Fireball", type:"mag", cd:8, pwr:2.2, acc:1.0, desc:"大爆発"} },
    { id:'guardian', name:'Guardian', req:{d_min:70}, bonus:{def:0.8}, desc:"被ダメ-20%", priority:2, skill:{id:'IronWall', name:"IronWall", type:"def", cd:15, pwr:0, acc:1.0, desc:"完全防御(1T)"} },
    { id:'rogue', name:'Rogue', req:{d_max:30}, bonus:{eva:0.2}, desc:"回避+20%", priority:2, skill:{id:'Mug', name:"Mug", type:"phys", cd:6, pwr:1.0, acc:1.0, desc:"確定強奪"} },
    { id:'sniper', name:'Sniper', req:{r_min:70}, bonus:{crit:0.2}, desc:"Crit+20%", priority:2, skill:{id:'Headshot', name:"Headshot", type:"phys", cd:8, pwr:1.8, acc:1.0, desc:"確定クリティカル"} },
    { id:'cleric', name:'Cleric', req:{r_max:30}, bonus:{heal:1.3}, desc:"回復+30%", priority:2, skill:{id:'Pray', name:"Pray", type:"heal", cd:12, pwr:0, acc:1.0, desc:"特大回復"} },
    
    { id:'paladin', name:'Paladin', req:{t_min:70, d_min:70}, bonus:{phys:1.1, def:0.85}, desc:"物+10% 耐-15%", priority:2, skill:{id:'HolyBlade', name:"HolyBlade", type:"hyb", cd:10, pwr:2.2, acc:1.0, desc:"聖なる剣(対霊特効)"} },
    { id:'assassin', name:'Assassin', req:{t_min:70, d_max:30}, bonus:{phys:1.1, crit:0.1}, desc:"物+10% Crit+10%", priority:2, skill:{id:'Backstab', name:"Backstab", type:"phys", cd:10, pwr:2.0, acc:1.0, desc:"背後から一撃"} },
    { id:'sage', name:'Sage', req:{t_max:30, r_max:30}, bonus:{mag:1.1, heal:1.2}, desc:"魔+10% 回+20%", priority:2, skill:{id:'BigBang', name:"BigBang", type:"mag", cd:15, pwr:3.0, acc:1.0, desc:"究極魔法"} },
    { id:'sentinel', name:'Sentinel', req:{d_min:70, r_max:30}, bonus:{def:0.7, time:1}, desc:"耐-30% 撃破時時+1", priority:2, skill:{id:'Aegis', name:"Aegis", type:"buff", cd:12, pwr:0, acc:1.0, desc:"絶対防御壁"} },
    { id:'reaper', name:'Reaper', req:{t_max:30, r_min:70}, bonus:{mag:1.1, crit:0.1}, desc:"魔+10% 即死使い", priority:2, skill:{id:'Execution', name:"Execution", type:"mag", cd:12, pwr:1.0, acc:0.9, desc:"確率即死", isInstantDeath:true} },

    { id:'samurai', name:'Samurai', req:{t_min:85, r_min:85}, bonus:{phys:1.3, crit:0.2}, desc:"物+30% Crit+20%", priority:3, skill:{id:'Zantetsu', name:"Zantetsu", type:"phys", cd:15, pwr:3.5, acc:1.0, desc:"一撃必殺"} },
    { id:'archmage', name:'Archmage', req:{t_max:15, r_max:15}, bonus:{mag:1.3, heal:1.3}, desc:"魔+30% 回+30%", priority:3, skill:{id:'Meteor', name:"Meteor", type:"mag", cd:18, pwr:4.0, acc:1.0, desc:"隕石召喚"} },
    { id:'ninja', name:'Ninja', req:{d_max:15, r_min:85}, bonus:{eva:0.25, crit:0.2}, desc:"避+25% Crit+20%", priority:3, skill:{id:'Assassinate', name:"Assassinate", type:"phys", cd:12, pwr:2.2, acc:1.0, desc:"即死攻撃", isInstantDeath:true} }
];

const ENEMY_TYPES = [
    { id: 'slime', name: 'Slime', hpMod: 0.8, defMod: 1.5, mDefMod: 0.2, eva: 0, act:['atk','atk','heal'], desc: '再生能力' },
    { id: 'bat', name: 'Bat', hpMod: 0.6, defMod: 0.5, mDefMod: 0.5, eva: 0.25, act:['atk'], desc: '高回避' },
    { id: 'golem', name: 'Golem', hpMod: 1.4, defMod: 1.1, mDefMod: 0.8, eva: -0.1, act:['atk','atk','charge'], desc: 'タメ攻撃注意' },
    { id: 'ghost', name: 'Ghost', hpMod: 0.6, defMod: 2.5, mDefMod: 0.4, eva: 0.1, act:['mag'], desc: '物理耐性/呪い' }
];
const BOSSES = {
    5: { id:'cerberus', name:'Cerberus', hp:200, atk:15, defMod:1.0, mDefMod:1.0, eva:0.05, act:['atk','atk','charge','mag'], desc:'【中ボス】地獄の番犬' },
    10: { id:'overlord', name:'Overlord', hp:500, atk:25, defMod:1.2, mDefMod:1.2, eva:0.1, act:['atk','mag','charge','heal'], desc:'【BOSS】螺旋の終焉' }
};
const ITEM_DATA = {
    potion: { name: "Potion", desc: "HP50回復", type: "heal", val: 50 },
    ether:  { name: "Ether", desc: "MP20回復", type: "mp", val: 20 },
    bomb:   { name: "Bomb", desc: "防御無視30dmg", type: "dmg", val: 30 },
    clock:  { name: "Clock", desc: "寿命+10", type: "turn", val: 10 }
};

const INITIAL_G = {
    state: 'EXPLORE', floor: 1, stairsFound: false, searchCount: 0,
    turns: CONF.initTurns, maxTurns: CONF.initTurns,
    lv: 1, exp: 0, next: 30, hp: 25, mhp: 25, mp: 10, mmp: 10, 
    axis: { T: 50, D: 50, R: 50 }, 
    items: { potion: 1, bomb: 0, ether: 1, clock: 0 },
    enemy: null, chest: null, gameOver: false, isCharging: false, isStunned: false,
    isFocused: false, jobSkillCd: 0, immortalTurns: 0, awakening: false, guardStance: false
};

let g = JSON.parse(JSON.stringify(INITIAL_G));
g.currentJob = JOBS[0];

// --- Global Functions ---

function saveGame() {
    if(g.gameOver) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(g)); log("記録しました", "l-sys"); }
    catch(e) { log("保存失敗", "l-red"); }
}
function loadGame() {
    try {
        const d = localStorage.getItem(SAVE_KEY);
        if(!d) { log("記録がありません", "l-gry"); return; }
        const loaded = JSON.parse(d);
        g = { ...INITIAL_G, ...loaded };
        updateJob(); log("記録を読込", "l-sys"); updateUI();
    } catch(e) { log("読込失敗", "l-red"); }
}
function resetGame() {
    if(!confirm("リセットしますか？")) return;
    localStorage.removeItem(SAVE_KEY); location.reload();
}

function getStats() {
    let b = 5 + (g.lv * 1.0); 
    if(g.awakening) b *= 1.5;
    const a = g.axis;
    return {
        STR: Math.floor(b * (a.T/50)), INT: Math.floor(b * ((100-a.T)/50)),
        VIT: Math.floor(b * (a.D/50)), AGI: Math.floor(b * ((100-a.D)/50)),
        DEX: Math.floor(b * (a.R/50)), MND: Math.floor(b * ((100-a.R)/50))
    };
}
function updateJob() {
    const t=g.axis.T, d=g.axis.D, r=g.axis.R; let best=JOBS[0], bestP=0;
    for(let j of JOBS) {
        if(j.req && j.req.lv_min) {
            if(g.lv < j.req.lv_min) continue;
        }
        if(j.req) {
            if(j.req.t_min!==undefined && t < j.req.t_min) continue;
            if(j.req.t_max!==undefined && t > j.req.t_max) continue;
            if(j.req.d_min!==undefined && d < j.req.d_min) continue;
            if(j.req.d_max!==undefined && d > j.req.d_max) continue;
            if(j.req.r_min!==undefined && r < j.req.r_min) continue;
            if(j.req.r_max!==undefined && r > j.req.r_max) continue;
        }
        const p = j.priority || 1;
        if(p > bestP) { best=j; bestP=p; }
        else if(p === bestP) {
            if(j.id !== 'novice' && j.id !== 'veteran' && j.id !== 'hero') best=j; 
        }
    }
    if(g.currentJob.id !== best.id) {
        g.currentJob = best;
        g.jobSkillCd = 0;
    } else {
        g.currentJob = best;
    }
}
function getDeck() {
    const t=g.axis.T, d=g.axis.D, r=g.axis.R;
    let basic = {id:'atk', name:"Attack", type:"phys", mp:0, pwr:1.0, acc:0.95, desc:"通常攻撃"};
    if (['wizard','archmage','sage','reaper'].includes(g.currentJob.id)) {
            basic = {id:'mag_atk', name:"Magic Shot", type:"mag", mp:2, pwr:0.8, acc:1.0, desc:"魔力攻撃"};
    }
    const deck = [basic];

    if(t>=60) deck.push({id:'smash', name:"Smash", type:"phys", mp:4, pwr:1.7, acc:0.75, cap:0.7, desc:"強打(70%)"});
    else if(t<=40) deck.push({id:'ice', name:"IceBolt", type:"mag", mp:8, pwr:1.3, acc:1.0, desc:"氷魔法"});
    else deck.push({id:'fire', name:"FireBlade", type:"hyb", mp:8, pwr:1.5, acc:0.95, desc:"炎剣"});
    
    if(d>=60) deck.push({id:'guard', name:"Guard", type:"def", mp:0, pwr:0, acc:1.0, desc:"防御"});
    else if(d<=40) deck.push({id:'trip', name:"Trip", type:"def", mp:3, pwr:0, acc:0.8, desc:"足払(行動阻止)"});
    else deck.push({id:'parry', name:"Parry", type:"buff", mp:0, pwr:0, acc:1.0, desc:"パリィ(0MP)"});
    
    if(r>=60) deck.push({id:'snipe', name:"Snipe", type:"phys", mp:4, pwr:1.0, acc:1.0, desc:"必中"});
    else if(r<=40) deck.push({id:'heal', name:"Heal", type:"heal", mp:8, pwr:0, acc:1.0, desc:"回復"});
    else deck.push({id:'focus', name:"Focus", type:"buff", mp:2, pwr:0, acc:1.0, desc:"集中"});

    if(g.currentJob.skill) { deck.push(g.currentJob.skill); }
    return deck;
}

function calcHit(acc, type, s, cap) {
    if(g.isFocused) return 1.0;
    let r = acc; if(type==='phys'||type==='hyb') r += (s.DEX * 0.01);
    if(g.enemy) r -= g.enemy.eva;
    let res = Math.min(1.0, Math.max(0.0, r));
    if(cap !== undefined) res = Math.min(res, cap);
    return res;
}
function calcDmg(sk, s) {
    const type = sk.type;
    const pwr = sk.pwr;

    if(type==='heal'||type==='def'||type==='buff') return {min:0,max:0};
    let base = 0;
    if(type==='phys') base=s.STR; else if(type==='mag') base=s.INT; else if(type==='hyb') base=(s.STR+s.INT)*0.6;
    else if(type==='bomb') return {min:30, max:30};

    const jb = g.currentJob.bonus; let mod = 1.0;
    if(type==='phys' && jb.phys) mod *= jb.phys; if(type==='mag' && jb.mag) mod *= jb.mag;
    
    if(g.currentJob.id === 'paladin' && g.enemy.id === 'ghost' && sk.name === 'HolyBlade') mod *= 2.0;

    let val = Math.floor(base * pwr * mod); if(val < 1) val = 1;
    if(!g.enemy) return {min:0, max:0};
    
    let def = 0;
    if(type==='phys'||type==='hyb') def=(g.enemy.lv*1.5)*(g.enemy.defMod||1); else if(type==='mag') def=(g.enemy.lv*1.0)*(g.enemy.mDefMod||1);
    const net = Math.max(1, val - Math.floor(def/2));
    return {min:Math.floor(net*0.9), max:Math.floor(net*1.1)};
}

// Actions
function log(msg, cls="") { const d=document.createElement('div'); d.className=cls; d.innerText=msg; document.getElementById('log-list').prepend(d); }
function consumeTime(v) {
    if(g.gameOver) return false;
    g.turns -= v; 
    if(g.jobSkillCd > 0) g.jobSkillCd = Math.max(0, g.jobSkillCd - v);
    if(g.immortalTurns > 0) g.immortalTurns = Math.max(0, g.immortalTurns - v);
    if(g.turns<=0) { g.gameOver=true; log("寿命が尽きた...","l-red"); updateUI(); return false; } 
    return true;
}
function tickBattleTurns() {
    if(g.jobSkillCd > 0) g.jobSkillCd--;
    if(g.immortalTurns > 0) g.immortalTurns--;
}

function actExplore() {
    if(g.gameOver || !consumeTime(1)) return;
    g.searchCount = (g.searchCount||0)+1;
    
    // Event
    const r = Math.random();
    let eventOccurred = false;

    if(r<0.6) { startBattle(); eventOccurred=true; }
    else if(r<0.7) { startChest(); eventOccurred=true; }
    else if(r<0.8) {
        const k=['T','D','R'][Math.floor(Math.random()*3)]; const v=Math.random()<.5?5:-5;
        g.axis[k]=Math.max(0,Math.min(100, g.axis[k]+v)); log("磁場異常！性格変動","l-yel");
        eventOccurred=true;
    }

    // Pity Stair
    let stairsJustFound = false;
    const findChance = g.searchCount * 0.1; 
    if(!g.stairsFound && Math.random() < findChance) {
        g.stairsFound = true;
        stairsJustFound = true;
        if(eventOccurred) log("...そして階段も見つけた！","l-grn");
        else log(`階段を発見した！(捜索${g.searchCount}回目)`, "l-grn");
    } else if(!eventOccurred) {
        if(g.stairsFound) { g.exp += 5; log("瓦礫をあさった...(Exp+5)", "l-gry"); }
        else log(`気配が強まる...(${Math.floor(findChance*100)}%)`, "l-gry");
    }
    updateUI();
}

function startBattle(fE=null) {
    let e; if(fE) e=fE;
    else { 
        const lv=Math.floor(g.floor*1.8) + Math.floor(Math.random()*2); 
        const t=ENEMY_TYPES[Math.floor(Math.random()*ENEMY_TYPES.length)]; 
        e={...t, lv:lv, type:t.id, mhp:Math.floor((20+lv*8)*t.hpMod), hp:Math.floor((20+lv*8)*t.hpMod), atk:5+lv*2}; 
    }
    g.enemy=e; g.isCharging=false; g.isStunned=false; g.parryActive=false; g.isFocused=false; g.guardStance=0;
    g.state = 'BATTLE';
    log(`[遭遇] ${g.enemy.name} Lv${g.enemy.lv}`, g.enemy.isBoss?"l-boss":"l-red"); updateUI();
}
function startChest() { 
    g.state='CHEST'; 
    g.chest={ trap:Math.random()<0.5, item:Object.keys(ITEM_DATA)[Math.floor(Math.random()*4)], identified:false, inspected:false }; 
    log("宝箱発見","l-yel");
    updateUI(); 
}

// --- 修正箇所：actBattle ---
function actBattle(sk) {
    if(g.gameOver || !g.enemy || g.enemy.hp<=0 || g.state!=='BATTLE') return;
    if(sk.cd && g.jobSkillCd > 0) { log(`充填中... (あと${g.jobSkillCd}T)`,"l-gry"); return; }
    
    g.mp -= (sk.mp||0); 
    if(sk.cd) g.jobSkillCd = sk.cd; 
    
    tickBattleTurns(); 

    const s = getStats();
    
    // --- Player Action ---
    if(sk.type==='heal') {
        const v = Math.floor((20*g.currentJob.bonus.heal||20)+s.MND*2); g.hp=Math.min(g.mhp, g.hp+v); log(`HP${v}回復`,"l-grn"); 
        // 回復後は確定で敵のターンへ
        enemyTurn(); updateUI(); return;
    }
    if(sk.id==='trip') {
        if(Math.random() < 0.8) { 
            g.enemy.isStunned=true; 
            if(g.isCharging){ g.isCharging=false; log("足払い！ため解除！","l-grn"); }
            else log("足払い成功！","l-grn"); 
        } else log("足払い失敗","l-gry");
        enemyTurn(); updateUI(); return;
    }
    if(sk.id==='parry') { g.parryActive = true; log("構えた！(Parry)","l-grn"); enemyTurn(); updateUI(); return; }
    if(sk.id==='focus') { g.isFocused = true; log("集中！(次回必中Crit)","l-grn"); enemyTurn(); updateUI(); return; }
    
    if(sk.id==='Guts' || sk.id==='Guts+') { 
        g.immortalTurns = sk.id==='Guts'?3:4; 
        if(sk.id==='Guts+') g.awakening=true; 
        log("ド根性！食いしばり付与","l-grn"); enemyTurn(); updateUI(); return; 
    }
    if(sk.id==='Awakening') { 
        g.immortalTurns = 5; g.awakening=true; 
        log("覚醒！能力UP＆不死！","l-spd"); enemyTurn(); updateUI(); return; 
    }
    
    if(sk.id==='IronWall' || sk.id==='Aegis' || sk.name==='Guard') { 
        g.guardStance = (sk.id==='IronWall' || sk.id==='Aegis') ? 2 : 1; 
        log(`${sk.name}! (防御)`,"l-grn"); enemyTurn(); updateUI(); return; 
    }

    if(sk.id==='Mug') {
        const hit = calcHit(sk.acc, sk.type, s);
        if(Math.random() > hit) log("ミス！","l-gry");
        else {
            const d = calcDmg(sk, s);
            let dmg = Math.floor(d.min + Math.random()*(d.max-d.min));
            applyDamageToEnemy(dmg, sk.name);
            const items = Object.keys(ITEM_DATA).filter(k => k !== 'clock');
            const it = items[Math.floor(Math.random()*items.length)];
            if(g.items[it] < CONF.itemMax) { g.items[it]++; log(`盗んだ！${ITEM_DATA[it].name}`,"l-yel"); }
            else log(`盗んだが持てない`,"l-gry");
        }
    } else if(sk.isInstantDeath) {
        let rate = 0.5; 
        if(g.enemy.isBoss) rate = (g.floor===5) ? 0.10 : 0.03;
        if(Math.random() < rate) {
            log(`即死発動！！ ${g.enemy.name}を葬った！`,"l-kill"); g.enemy.hp=0; winBattle(); updateUI(); return;
        } else {
            log("即死失敗... (1dmg)","l-gry"); applyDamageToEnemy(1, "即死ミス");
        }
    } else {
        // Normal Attack / Skill
        const hit = calcHit(sk.acc, sk.type, s, sk.cap);
        if(Math.random() > hit) log("ミス！","l-gry");
        else {
            const range = calcDmg(sk, s);
            let dmg = Math.floor(range.min + Math.random()*(range.max-range.min+1));
            let cr=0.05; 
            if(sk.id==='snipe' || g.isFocused) cr=1.0; 
            else if(g.currentJob.bonus.crit) cr+=g.currentJob.bonus.crit;
            
            // DEX Scaling Crit
            let critMult = 1.5 + (s.DEX * 0.01);
            if(Math.random()<cr) { dmg=Math.floor(dmg*critMult); log(`Critical(x${critMult.toFixed(1)})!!`,"l-red"); }
            applyDamageToEnemy(dmg, sk.name, sk.type);
            
            if(g.isFocused) g.isFocused = false; 
        }
    }

    // 敵死亡判定
    if(g.enemy.hp <= 0) { winBattle(); updateUI(); return; }

    // --- AGI Re-Act Check (修正版) ---
    // 敵のターンを呼ぶ前にチェックする！
    // 基準: 敵Lv*2 (Lv10の敵ならAGI20でトントン、AGI50なら60%再行動)
    const speedReq = g.enemy.lv * 2; 
    const speedDiff = s.AGI - speedReq;
    
    if(speedDiff > 0) {
        // 差分1につき2%の確率で再行動
        const chance = speedDiff * 0.02;
        if(Math.random() < chance) {
            log(">>> 高速機動！再行動！(AGI)", "l-spd");
            // enemyTurn() を呼ばずに終了（＝ずっと俺のターン）
            updateUI();
            return; 
        }
    }

    // 再行動できなければ敵のターン
    enemyTurn();
    updateUI();
}

// --- 修正箇所：enemyTurn (重複していたAGI判定を削除) ---
function enemyTurn(guard=false) {
    if(g.gameOver || !g.enemy || g.enemy.hp<=0) return;
    
    if(g.enemy.isStunned) {
        log("敵は動けない...","l-grn");
        g.enemy.isStunned = false;
        g.guardStance = 0;
        tickBattleTurns();
        return;
    }
    
    // ※ここにあった古いAGI判定は削除しました（actBattle側に統合）

    const s = getStats();

    if(g.isCharging) {
        g.isCharging = false;
        let dmg = Math.floor(g.enemy.atk * 2.5);
        if(g.currentJob.bonus.def) dmg = Math.floor(dmg * g.currentJob.bonus.def);
        
        if(g.guardStance === 2) { dmg = 0; log("完全防御！(0dmg)", "l-grn"); }
        else if(g.guardStance === 1) { dmg = Math.floor(dmg / 3); log("防御で軽減！", "l-grn"); }
        else if(g.parryActive) { 
            g.parryActive=false; 
            const cut = 0.3 + Math.random()*0.7; 
            const just = cut>0.95; 
            let cutDmg = Math.floor(dmg * (1.0 - cut));
            log(`Parry! 軽減${Math.floor(cut*100)}%`,"l-blu");
            dmg = cutDmg;
            if(just) { 
                const counter = Math.floor(s.DEX*2); applyDamageToEnemy(counter, "JustParry"); log(`反撃！ ${counter}dmg`,"l-grn"); 
                if(g.enemy.hp<=0){winBattle();return;} 
            }
        }
        applyDamage(dmg, true);
        g.guardStance = 0;
        tickBattleTurns();
        return;
    }

    const acts = g.enemy.act || ['atk'];
    const act = acts[Math.floor(Math.random()*acts.length)];

    if(act === 'heal') {
        let h = Math.floor(g.enemy.mhp * 0.15); g.enemy.hp = Math.min(g.enemy.mhp, g.enemy.hp + h);
        log(`再生(+${h})`, "l-red"); g.guardStance = 0; tickBattleTurns(); return;
    }
    if(act === 'charge') { g.isCharging = true; log(`力を溜めている...！`,"l-chg"); g.guardStance = 0; tickBattleTurns(); return; }

    // 通常回避判定
    let eva = s.AGI*0.025; if(g.currentJob.bonus.eva) eva+=g.currentJob.bonus.eva;
    if(act==='atk' && !g.guardStance && !g.parryActive && Math.random()<eva) { 
        // Sonic Counter
        const counter = Math.floor(s.AGI * 0.5);
        log(`回避反撃(Sonic)! ${counter}dmg`,"l-spd");
        applyDamageToEnemy(counter, "Counter");
        if(g.enemy.hp<=0) winBattle();
        
        tickBattleTurns(); return; 
    }

    let dmg = 0;
    if(act === 'mag') { dmg = Math.max(5, g.enemy.atk - Math.floor(s.MND/2)); log(`呪い！`,"l-dmg"); } 
    else { dmg = Math.max(1, g.enemy.atk - Math.floor(s.VIT/3)); }
    
    if(g.currentJob.bonus.def && act==='atk') dmg = Math.floor(dmg * g.currentJob.bonus.def);
    if(guard && act==='atk') {
         dmg = Math.floor(dmg/2);
         log("防御！", "l-grn");
    }

    if(g.parryActive && act==='atk') {
        g.parryActive = false;
        const cut = 0.3 + Math.random()*0.7;
        const just = cut > 0.95;
        const cutDmg = Math.floor(dmg * (1.0 - cut));
        log(`Parry! 軽減${Math.floor(cut*100)}%`,"l-blu");
        dmg = cutDmg;
        if(just) { const counter = Math.floor(s.DEX*2); g.enemy.hp -= counter; log(`反撃！ ${counter}dmg`,"l-grn"); if(g.enemy.hp<=0){winBattle();return;} }
    }

    applyDamage(dmg);
    g.guardStance = 0;
    tickBattleTurns();
}

function applyDamageToEnemy(dmg, sourceName) {
    g.enemy.hp -= dmg;
    if(sourceName !== "Parry") log(`${sourceName}! ${dmg}dmg`, "l-blu"); 
}

// 修正版: 必ず整数化 & ガッツ判定を最後に行う
function applyDamage(dmg, isBig=false) {
    dmg = Math.floor(dmg);
    g.hp -= dmg; 
    
    if(dmg > 0) {
        if(isBig) log(`【溜め攻撃】 ${dmg}dmg!!`,"l-dmg");
        else log(`被弾 ${dmg}dmg`,"l-dmg");
    }
    
    g.hp = Math.floor(g.hp);

    if(g.hp <= 0) {
        // ここでガッツ判定！
        if(g.immortalTurns > 0) {
            g.hp = 1;
            log(`食いしばった！(残${g.immortalTurns})`,"l-spd");
        } else {
            g.gameOver = true;
            log("敗北...","l-red");
            updateUI();
        }
    }
}

function winBattle() {
    const gain = 15 + g.enemy.lv*5; g.exp+=gain;
    if(g.currentJob.bonus.time) { g.turns = Math.min(g.maxTurns, g.turns+1); log(`勝利(+Exp${gain},寿命+1)`, "l-grn"); }
    else { log(`勝利(+Exp${gain},寿命-2)`, "l-grn"); consumeTime(2); }

    // Reset states
    g.awakening = false; g.isFocused = false; g.immortalTurns = 0; g.guardStance = 0;

    if(g.enemy.isBoss && g.floor===5) {
        g.state='EXPLORE'; g.enemy=null; log("中ボス撃破！6階へ","l-boss");
        g.floor++; g.stairsFound=false; g.searchCount=0;
        log("全回復！","l-grn"); g.hp=g.mhp; g.mp=g.mmp; 
        saveGame();
    } else if(g.enemy.isBoss && g.floor===10) {
        g.state='EXPLORE'; g.enemy=null; g.gameOver=true;
        log("魔王撃破！ALL CLEAR!!","l-boss");
        document.getElementById('cmd-grid').innerHTML = `<button class="cmd-btn" style="grid-column:1/-1; border-color:#ff0; color:#ff0;" onclick="resetGame()">THE END (Reset)</button>`;
        return;
    } else {
        g.state='EXPLORE'; g.enemy=null;
        if(Math.random()<0.1) { 
            const items = Object.keys(ITEM_DATA);
            const it = items[Math.floor(Math.random()*items.length)];
            if(it === 'clock') { g.turns = Math.min(g.maxTurns, g.turns + 10); log("時計発見! 寿命+10", "l-yel"); }
            else {
                if(g.items[it] < CONF.itemMax) { g.items[it]++; log(`${ITEM_DATA[it].name}取得`, "l-yel"); }
                else { log(`${ITEM_DATA[it].name}は持てない`, "l-gry"); }
            }
        }
    }
    if(g.exp>=g.next) { g.exp-=g.next; g.next=Math.floor(g.next*1.2); g.lv++; showLvUp(); }
}

function actInspect() { if(g.gameOver) return; if(g.mp<2){log("MP不足","l-gry");return;} g.mp-=2; const s=getStats(); g.chest.inspected=true; if(Math.random()<(30+s.INT*2)/100) { g.chest.identified=true; log("鑑定成功","l-blu"); } else log("不明...","l-gry"); updateUI(); }
function actDisarm() { if(g.gameOver) return; if(g.mp<3){log("MP不足","l-gry");return;} g.mp-=3; const s=getStats(); if(Math.random()<(30+s.DEX*2)/100) { log("解除成功","l-grn"); g.chest.trap=false; actOpen(false); } else { log("失敗!","l-red"); actOpen(true); } }
function actOpen(f) {
    if(g.gameOver) return;
    if(g.chest.trap||f) { const d=10+g.floor*2; applyDamage(d, true); if(g.gameOver){ updateUI(); return; } }
    
    const it = g.chest.item;
    if(it === 'clock') { g.turns = Math.min(g.maxTurns, g.turns + 10); log("時計発見! 寿命+10", "l-yel"); }
    else {
        if(g.items[it] < CONF.itemMax) { g.items[it]++; log(`${ITEM_DATA[it].name}入手`, "l-yel"); }
        else { log(`${ITEM_DATA[it].name}は持てない`, "l-gry"); }
    }
    g.state='EXPLORE'; g.chest=null; updateUI();
}
function useItem(k) {
    if(g.gameOver) return;
    if(k==='bomb' && (!g.enemy||g.state!=='BATTLE')) { log("敵がいない","l-gry"); return; }
    if(g.state==='BATTLE' && !['bomb','potion','ether'].includes(k)) { log("不可","l-gry"); return; }
    if(g.items[k]<=0) return;
    g.items[k]--; const d=ITEM_DATA[k];
    if(d.type==='heal') { g.hp=Math.min(g.mhp, g.hp+d.val); log("HP回復","l-grn"); }
    if(d.type==='mp') { g.mp=Math.min(g.mmp, g.mp+d.val); log("MP回復","l-grn"); }
    if(d.type==='turn') { g.turns+=d.val; log("寿命延長","l-grn"); }
    if(d.type==='dmg') { applyDamageToEnemy(d.val, "爆弾", "mag"); if(g.enemy.hp<=0) winBattle(); else enemyTurn(); }
    updateUI();
}
function actRest() { if(g.gameOver||!consumeTime(2)) return; const s=getStats(); g.hp=Math.min(g.mhp, g.hp+15+s.MND*2); g.mp=Math.min(g.mmp, g.mp+8+s.MND); log("休息","l-grn"); saveGame(); updateUI(); }
function actDescend() {
    if(g.gameOver) return;
    if(g.floor===5) { startBattle({ ...BOSSES[5], lv:10, isBoss:true, mhp:BOSSES[5].hp }); return; }
    g.floor++; g.stairsFound=false; g.searchCount=0;
    log("全回復！","l-grn"); g.hp=g.mhp; g.mp=g.mmp;
    if(g.floor===10) log("最深部...","l-boss"); else log(`B${g.floor}へ`,"l-yel");
    saveGame(); updateUI();
}
function actChallengeBoss() { startBattle({ ...BOSSES[10], lv:20, isBoss:true, mhp:BOSSES[10].hp }); }
function actRun() {
    if(g.gameOver||!consumeTime(1)) return; const s=getStats();
    let r = 0.4+(s.AGI*0.015)-(g.enemy.lv*0.01); if(g.currentJob.bonus.eva) r+=g.currentJob.bonus.eva;
    if(g.enemy.isBoss) r=0;
    if(Math.random()<r) { log("逃走成功","l-grn"); g.state='EXPLORE'; g.enemy=null; } else { log("失敗","l-red"); enemyTurn(); }
    updateUI();
}

function showLvUp() { document.getElementById('modal-lv').style.display='flex'; document.getElementById('lv-opts').innerHTML = `<button class="m-btn" onclick="mod('T',5)">Hot (STR↑) <span>INT↓</span></button><button class="m-btn" onclick="mod('T',-5)">Cool (INT↑) <span>STR↓</span></button><button class="m-btn" onclick="mod('D',5)">Deep (VIT↑) <span>AGI↓</span></button><button class="m-btn" onclick="mod('D',-5)">Shallow (AGI↑) <span>VIT↓</span></button><button class="m-btn" onclick="mod('R',5)">Rigid (DEX↑) <span>MND↓</span></button><button class="m-btn" onclick="mod('R',-5)">Flex (MND↑) <span>DEX↓</span></button>`; }
function mod(k,v) { g.axis[k] = Math.max(0, Math.min(100, g.axis[k]+v)); document.getElementById('modal-lv').style.display='none'; log("LvUP 完了","l-yel"); updateUI(); }

function updateUI() {
    updateJob(); const s = getStats();
    const oldMhp=g.mhp, oldMmp=g.mmp;
    g.mhp = 20 + (g.lv*5) + (s.VIT*3); g.mmp = 10 + (g.lv*2) + (s.INT) + (s.MND*2);
    if(g.mhp>oldMhp) g.hp += (g.mhp-oldMhp); if(g.mmp>oldMmp) g.mp += (g.mmp-oldMmp);
    g.hp=Math.min(g.hp, g.mhp); g.mp=Math.min(g.mp, g.mmp);

    document.getElementById('job-name').innerText = g.currentJob.name;
    document.getElementById('job-bonus').innerText = g.currentJob.desc;
    document.getElementById('disp-turn').innerText = g.turns;
    document.getElementById('bar-turn').style.width = Math.max(0, (g.turns/g.maxTurns)*100)+"%";
    
    document.getElementById('th-t').style.left = g.axis.T+"%"; 
    document.getElementById('val-t').innerText = (g.axis.T > 50 ? g.axis.T : 100 - g.axis.T);
    
    document.getElementById('th-d').style.left = g.axis.D+"%"; 
    document.getElementById('val-d').innerText = (g.axis.D > 50 ? g.axis.D : 100 - g.axis.D);
    
    document.getElementById('th-r').style.left = g.axis.R+"%"; 
    document.getElementById('val-r').innerText = (g.axis.R > 50 ? g.axis.R : 100 - g.axis.R);
    
    document.getElementById('pl-fl').innerText = g.floor;
    document.getElementById('pl-hp').innerText = g.hp; document.getElementById('pl-mhp').innerText = g.mhp;
    document.getElementById('pl-mp').innerText = g.mp; document.getElementById('pl-mmp').innerText = g.mmp;
    document.getElementById('pl-exp').innerText = g.exp; document.getElementById('pl-next').innerText = g.next;
    document.getElementById('pl-lv').innerText = g.lv;

    updateEncounter(); renderItems(); renderCmd(s);
}

function updateEncounter() {
    const b = document.getElementById('encounter-box'); const c = document.getElementById('enc-content');
    if(g.state==='BATTLE' && g.enemy) {
        b.style.display='block'; 
        if(g.enemy.isBoss) b.style.borderColor='#f80';
        else b.style.borderColor = g.enemy.id==='slime'?'#484':(g.enemy.id==='ghost'?'#468':'#666');
        c.innerHTML = `<span class="en-name" style="color:#fff">${g.enemy.name} (Lv${g.enemy.lv})</span><span class="en-desc">${g.enemy.desc}</span><br><div style="margin-top:2px; color:#fa0;">HP: ${g.enemy.hp} / ${g.enemy.mhp}</div>`;
    } else if(g.state==='CHEST' && g.chest) {
        b.style.display='block'; b.style.borderColor='#ba0';
        let i = g.chest.identified ? (g.chest.trap?"<span style='color:#f66'>罠あり</span>":"<span style='color:#6f6'>安全</span>") : "未鑑定";
        c.innerHTML = `<span class="en-name" style="color:#fd0">Treasure Chest</span><span class="en-desc">状態: ${i}</span>`;
    } else { b.style.display='none'; }
}

function renderItems() {
    const b = document.getElementById('item-belt'); b.innerHTML = "";
    for(let k in g.items) {
        if(g.items[k]>0) {
            const d = document.createElement('div'); d.className='item-chip';
            d.innerText = `${ITEM_DATA[k].name} x${g.items[k]}`; d.onclick=()=>useItem(k);
            b.appendChild(d);
        }
    }
}

function renderCmd(s) {
    const area = document.getElementById('cmd-grid'); area.innerHTML = "";
    if(g.gameOver) { area.innerHTML = `<button class="cmd-btn" onclick="location.reload()" style="grid-column:1/-1; border-color:#f55; color:#f55;"><span class="b-name">GAME OVER</span><div class="b-meta"><span>RELOAD TO RETRY</span></div></button>`; return; }
    
    if(g.state==='BATTLE') {
        getDeck().forEach(sk => {
            const btn = document.createElement('button'); btn.className = "cmd-btn";
            let disabled = false;
            if(sk.mp && g.mp < sk.mp) disabled = true;
            if(sk.cd && g.jobSkillCd > 0) disabled = true;
            btn.disabled = disabled;

            let pred = "";
            if(sk.type==='heal') pred = `<span class="b-pred">Heal</span>`;
            else if(sk.type==='def'||sk.type==='buff') pred = `<span class="b-pred">-</span>`;
            else {
                const hit = Math.floor(calcHit(sk.acc, sk.type, s, sk.cap)*100);
                const d = calcDmg(sk, s);
                pred = `<span class="b-pred">${Math.floor(hit)}% ${d.min}-${d.max}</span>`;
            }
            
            let costStr = "";
            if(sk.mp>0) costStr = `MP${sk.mp}`;
            if(sk.cd) {
                if(g.jobSkillCd > 0) costStr = `あと${g.jobSkillCd}T`;
                else costStr = "READY";
            }

            btn.innerHTML = `<span class="b-name">${sk.name} <span style="float:right; font-size:0.9em; color:#8cf">${costStr}</span></span><div class="b-meta"><span>${sk.desc}</span>${pred}</div>`;
            if(sk.id === g.currentJob.skill?.id) { btn.classList.add('b-unique'); }
            btn.onclick = () => actBattle(sk);
            area.appendChild(btn);
        });
        const rate = Math.floor(Math.min(1,Math.max(0, 0.4+(s.AGI*0.015)-(g.enemy.lv*0.01) + (g.currentJob.bonus.eva||0)))*100);
        const run = document.createElement('button'); run.className = "cmd-btn";
        run.disabled = !!g.enemy.isBoss;
        run.innerHTML = `<span class="b-name">Run</span><div class="b-meta"><span>逃走</span><span class="b-pred">${g.enemy.isBoss?'0':rate}%</span></div>`;
        run.onclick = actRun; area.appendChild(run);
    } else if(g.state==='CHEST') {
        const iR = Math.min(95, 30+s.INT*2);
        const btnI = document.createElement('button'); btnI.className="cmd-btn";
        btnI.innerHTML = `<span class="b-name">Inspect (MP2)</span><div class="b-meta"><span>INT:鑑定</span><span class="b-pred">${iR}%</span></div>`;
        if(g.chest.inspected || g.mp<2) btnI.disabled=true; btnI.onclick=actInspect; area.appendChild(btnI);

        const dR = Math.min(95, 30+s.DEX*2);
        const btnD = document.createElement('button'); btnD.className="cmd-btn";
        btnD.innerHTML = `<span class="b-name">Disarm (MP3)</span><div class="b-meta"><span>DEX:解除</span><span class="b-pred">${dR}%</span></div>`;
        if(g.mp<3) btnD.disabled=true; btnD.onclick=actDisarm; area.appendChild(btnD);

        const btnF = document.createElement('button'); btnF.className="cmd-btn";
        btnF.innerHTML = `<span class="b-name">Force Open</span><div class="b-meta"><span>強引に</span><span class="b-pred" style="color:#f66">危険</span></div>`;
        btnF.onclick=()=>actOpen(false); area.appendChild(btnF);

        const btnIg = document.createElement('button'); btnIg.className="cmd-btn";
        btnIg.innerHTML = `<span class="b-name">Ignore</span><div class="b-meta"><span>無視</span></div>`;
        btnIg.onclick=()=>{g.state='EXPLORE'; g.chest=null; log("無視した。"); updateUI();}
        area.appendChild(btnIg);
    } else {
        const btnE = document.createElement('button'); btnE.className="cmd-btn";
        btnE.innerHTML = `<span class="b-name">Explore</span><div class="b-meta"><span>探索 (-1 Turn)</span></div>`;
        btnE.onclick = actExplore; area.appendChild(btnE);
        if(g.stairsFound) {
            const btnD = document.createElement('button'); btnD.className="cmd-btn"; btnD.style.borderColor="#ff0";
            btnD.innerHTML = `<span class="b-name" style="color:#ff0">${g.floor===5?'Gatekeeper':'Descend'}</span><div class="b-meta"><span>${g.floor===5?'中ボス戦':'次の階層へ'}</span></div>`;
            btnD.onclick = actDescend; area.appendChild(btnD);
        }
        const btnR = document.createElement('button'); btnR.className="cmd-btn"; btnR.style.borderColor="#8cf";
        btnR.innerHTML = `<span class="b-name" style="color:#8cf">Rest</span><div class="b-meta"><span>休息 (-2 Turn)</span></div>`;
        btnR.onclick = actRest; area.appendChild(btnR);
    }
    
    if(g.floor===10 && g.state!=='BATTLE' && !g.enemy) {
            const btnBoss = document.createElement('button'); btnBoss.className="cmd-btn";
            btnBoss.style.borderColor="#f00"; btnBoss.style.background="#300";
            btnBoss.innerHTML = `<span class="b-name" style="color:#f88">CHALLENGE</span><div class="b-meta"><span>魔王決戦</span></div>`;
            btnBoss.onclick = actChallengeBoss;
            document.getElementById('cmd-grid').insertBefore(btnBoss, document.getElementById('cmd-grid').firstChild);
    }
}

window.showJobGuide = function() {
    const l=document.getElementById('job-list'); l.innerHTML="";
    JOBS.forEach(j=>{ if(j.id==='novice')return;
        const d=document.createElement('div'); d.className="job-row "+(g.currentJob.id===j.id?"active":"");
        let r=[]; if(j.req){ if(j.req.t_min)r.push(`Hot≧${j.req.t_min}`); if(j.req.t_max)r.push(`Cool≧${100-j.req.t_max}`); if(j.req.d_min)r.push(`Deep≧${j.req.d_min}`); if(j.req.d_max)r.push(`Shallow≧${100-j.req.d_max}`); if(j.req.r_min)r.push(`Rigid≧${j.req.r_min}`); if(j.req.r_max)r.push(`Flex≧${100-j.req.r_max}`); }
        if(j.req && j.req.lv_min) r.push(`Lv≧${j.req.lv_min}`);
        d.innerHTML=`<strong style="color:${g.currentJob.id===j.id?'#ff0':'#eee'}">${j.name}</strong> <span class="b-unique" style="font-size:0.7em; padding-left:4px;">${j.skill?j.skill.name:""}</span><span class="job-eff">${j.desc}</span><span style="font-size:0.75em; color:#aaa">条件: ${r.join(' / ')||"なし"}</span>`; l.appendChild(d);
    }); document.getElementById('modal-job').style.display='flex';
};
window.closeJobGuide = function(e){ if(e.target.id==='modal-job') e.target.style.display='none'; };

// 起動
window.onload = () => {
    if(localStorage.getItem(SAVE_KEY)) loadGame();
    else updateUI();
};
