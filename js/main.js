// --- main.js : ゲームの司令塔 ---

import { CONF, SAVE_KEY, JOBS, ENEMY_TYPES, BOSSES, ITEM_DATA, INITIAL_G } from './data.js';
import { getStats, getBestJob, getDeck, calcHit, calcDmg } from './logic.js';

// エラーハンドリング
window.onerror = function(msg, url, line) {
    const el = document.getElementById('error-trap');
    if(el) { el.style.display = 'block'; el.innerText = `ERROR: ${msg} (Line ${line})`; }
    return false;
};

// グローバル変数 (State)
let g = JSON.parse(JSON.stringify(INITIAL_G));
// ジョブ参照は初期化時に復元
g.currentJob = JOBS[0];

// ============================
//         Save / Load
// ============================

window.saveGame = function() {
    if(g.gameOver) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(g)); log("記録しました", "l-sys"); }
    catch(e) { log("保存失敗", "l-red"); }
};

window.loadGame = function() {
    try {
        const d = localStorage.getItem(SAVE_KEY);
        if(!d) { log("記録がありません", "l-gry"); return; }
        const loaded = JSON.parse(d);
        g = { ...INITIAL_G, ...loaded };
        // Job Objectを再紐付け
        updateJobState();
        log("記録を読込", "l-sys"); 
        updateUI();
    } catch(e) { log("読込失敗", "l-red"); }
};

window.resetGame = function() {
    if(!confirm("リセットしますか？")) return;
    localStorage.removeItem(SAVE_KEY); location.reload();
};

// ============================
//      Game Loop & Action
// ============================

function log(msg, cls="") { 
    const d=document.createElement('div'); 
    d.className=cls; d.innerText=msg; 
    document.getElementById('log-list').prepend(d); 
}

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

function updateJobState() {
    // 状態(g)から最適なジョブを再計算してセット
    const t=g.axis.T, d=g.axis.D, r=g.axis.R;
    const best = getBestJob(t, d, r, g.lv);
    
    if(g.currentJob.id !== best.id) {
        g.currentJob = best;
        g.jobSkillCd = 0;
    } else {
        g.currentJob = best;
    }
}

// --- Actions Exported to Window for HTML OnClick ---

window.actExplore = function() {
    if(g.gameOver || !consumeTime(1)) return;
    g.searchCount = (g.searchCount||0)+1;
    
    const r = Math.random();
    let eventOccurred = false;

    if(r<0.6) { startBattle(); eventOccurred=true; }
    else if(r<0.7) { startChest(); eventOccurred=true; }
    else if(r<0.8) {
        const k=['T','D','R'][Math.floor(Math.random()*3)]; const v=Math.random()<.5?5:-5;
        g.axis[k]=Math.max(0,Math.min(100, g.axis[k]+v)); log("磁場異常！性格変動","l-yel");
        eventOccurred=true;
    }

    const findChance = g.searchCount * 0.1; 
    if(!g.stairsFound && Math.random() < findChance) {
        g.stairsFound = true;
        if(eventOccurred) log("...そして階段も見つけた！","l-grn");
        else log(`階段を発見した！(捜索${g.searchCount}回目)`, "l-grn");
    } else if(!eventOccurred) {
        if(g.stairsFound) { g.exp += 5; log("瓦礫をあさった...(Exp+5)", "l-gry"); }
        else log(`気配が強まる...(${Math.floor(findChance*100)}%)`, "l-gry");
    }
    updateUI();
};

function startBattle(fE=null) {
    let e; 
    if(fE) e=fE;
    else { 
        const lv=Math.floor(g.floor*1.8) + Math.floor(Math.random()*2); 
        // Floor logic
        let pool = [];
        if(g.floor <= 3) pool = ['slime','bat','ghost'];
        else if(g.floor <= 6) pool = ['bat','ghost','golem'];
        else pool = ['ghost','golem','dragon'];
        
        let typeId = pool[Math.floor(Math.random()*pool.length)];
        let t = ENEMY_TYPES.find(x => x.id === typeId);
        if(!t && typeId === 'dragon') t = ENEMY_TYPES.find(x => x.id === 'dragon');

        e={...t, lv:lv, type:t.id, mhp:Math.floor((20+lv*8)*t.hpMod), hp:Math.floor((20+lv*8)*t.hpMod), atk:5+lv*(t.atkMod||1.0)*2}; 
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

window.actBattle = function(sk) {
    if(g.gameOver || !g.enemy || g.enemy.hp<=0 || g.state!=='BATTLE') return;
    if(sk.cd && g.jobSkillCd > 0) { log(`充填中... (あと${g.jobSkillCd}T)`,"l-gry"); return; }
    
    g.mp -= (sk.mp||0); 
    if(sk.cd) g.jobSkillCd = sk.cd; 
    tickBattleTurns(); 
    const s = getStats(g.lv, g.awakening, g.axis);
    
    if(sk.type==='heal') {
        const v = Math.floor((20*g.currentJob.bonus.heal||20)+s.MND*2); g.hp=Math.min(g.mhp, g.hp+v); log(`HP${v}回復`,"l-grn"); 
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
        const hit = calcHit(sk, s, g.enemy, g.isFocused);
        if(Math.random() > hit) log("ミス！","l-gry");
        else {
            const d = calcDmg(sk, s, g.enemy, g.currentJob);
            let dmg = Math.floor(d.min + Math.random()*(d.max-d.min));
            applyDamageToEnemy(dmg, sk.name);
            const items = Object.keys(ITEM_DATA).filter(k => k !== 'clock');
            const it = items[Math.floor(Math.random()*items.length)];
            if(g.items[it] < CONF.itemMax) { g.items[it]++; log(`盗んだ！${ITEM_DATA[it].name}`,"l-yel"); }
            else log(`盗んだが持てない`,"l-gry");
        }
        if(g.enemy.hp <= 0) winBattle(); else enemyTurn();
        updateUI(); return;
    }

    if(sk.isInstantDeath) {
        let rate = 0.5; 
        if(g.enemy.isBoss) rate = (g.floor===5) ? 0.10 : 0.03;
        if(Math.random() < rate) {
            log(`即死発動！！ ${g.enemy.name}を葬った！`,"l-kill"); g.enemy.hp=0; winBattle(); updateUI(); return;
        } else {
            log("即死失敗... (1dmg)","l-gry"); applyDamageToEnemy(1, "即死ミス");
        }
    } else {
        const hit = calcHit(sk, s, g.enemy, g.isFocused);
        if(Math.random() > hit) log("ミス！","l-gry");
        else {
            const d = calcDmg(sk, s, g.enemy, g.currentJob);
            let dmg = Math.floor(d.min + Math.random()*(d.max-d.min));
            let cr=0.05; 
            if(sk.id==='snipe' || g.isFocused) cr=1.0; 
            else if(g.currentJob.bonus.crit) cr+=g.currentJob.bonus.crit;
            
            // DEX Crit Scaling
            let critMult = 1.5 + (s.DEX * 0.01);
            if(Math.random()<cr) { dmg=Math.floor(dmg*critMult); log(`Critical(x${critMult.toFixed(1)})!!`,"l-red"); }
            applyDamageToEnemy(dmg, sk.name);
            if(g.isFocused) g.isFocused = false; 
        }
    }
    if(g.enemy.hp <= 0) winBattle(); 
    else {
        const diff = s.AGI - (g.enemy.lv * 4);
        if(!g.gameOver && Math.random() < diff*0.01) { 
             log("再行動！","l-spd"); return; 
        }
        tickTime();
        enemyTurn();
    }
    updateUI();
};

function enemyTurn() {
    if(g.gameOver || !g.enemy || g.enemy.hp<=0) return;
    
    if(g.enemy.isStunned) {
        log("敵は動けない...","l-grn"); g.enemy.isStunned = false; g.guardStance = 0;
        tickBattleTurns(); return;
    }
    
    const s = getStats(g.lv, g.awakening, g.axis);
    const agiDiff = Math.max(0, s.AGI - (g.enemy.lv*4));
    if(Math.random() < agiDiff*0.025) { 
        log("敵を置き去りにした！","l-spd"); g.guardStance = 0; return; 
    }

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
                const counter = Math.floor(s.DEX*2); g.enemy.hp -= counter; log(`反撃！ ${counter}dmg`,"l-grn"); 
                if(g.enemy.hp<=0){winBattle();return;} 
            }
        }
        applyDamage(dmg, true);
        g.guardStance = 0; tickBattleTurns(); return;
    }

    const acts = g.enemy.act || ['atk'];
    const act = acts[Math.floor(Math.random()*acts.length)];

    if(act === 'heal') {
        let h = Math.floor(g.enemy.mhp * 0.15); g.enemy.hp = Math.min(g.enemy.mhp, g.enemy.hp + h);
        log(`再生(+${h})`, "l-red"); g.guardStance = 0; tickBattleTurns(); return;
    }
    if(act === 'charge') { g.isCharging = true; log(`力を溜めている...！`,"l-chg"); g.guardStance = 0; tickBattleTurns(); return; }

    let eva = s.AGI*0.025; if(g.currentJob.bonus.eva) eva+=g.currentJob.bonus.eva;
    if(act==='atk' && !g.guardStance && !g.parryActive && Math.random()<eva) { 
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
    if(g.guardStance === 2 && act==='atk') { dmg = 0; log("完全防御！", "l-grn"); }
    else if(g.guardStance === 1 && act==='atk') { dmg = Math.floor(dmg/2); log("防御！", "l-grn"); }

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

function applyDamageToEnemy(dmg, sourceName, type='phys') {
    if(g.enemy.reflect && g.enemy.reflect > 0 && type === 'phys') {
        const recoil = Math.floor(dmg * g.enemy.reflect);
        if(recoil > 0) {
            log(`反射！ ${recoil}dmgを受けた`,"l-red");
            applyDamage(recoil);
            if(g.gameOver) return;
        }
    }
    g.enemy.hp -= dmg;
    if(sourceName !== "Parry" && sourceName !== "Counter" && sourceName !== "JustParry") log(`${sourceName}! ${dmg}dmg`, "l-blu"); 
}

function applyDamage(dmg, isBig=false) {
    dmg = Math.floor(dmg);
    g.hp -= dmg; 
    if(dmg > 0) {
        if(isBig) log(`【溜め攻撃】 ${dmg}dmg!!`,"l-dmg");
        else log(`被弾 ${dmg}dmg`,"l-dmg");
    }
    g.hp = Math.floor(g.hp);
    if(g.hp <= 0) {
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

window.actInspect = function() { if(g.gameOver) return; if(g.mp<2){log("MP不足","l-gry");return;} g.mp-=2; const s=getStats(g.lv, g.awakening, g.axis); g.chest.inspected=true; if(Math.random()<(30+s.INT*2)/100) { g.chest.identified=true; log("鑑定成功","l-blu"); } else log("不明...","l-gry"); updateUI(); };
window.actDisarm = function() { if(g.gameOver) return; if(g.mp<3){log("MP不足","l-gry");return;} g.mp-=3; const s=getStats(g.lv, g.awakening, g.axis); if(Math.random()<(30+s.DEX*2)/100) { log("解除成功","l-grn"); g.chest.trap=false; actOpen(false); } else { log("失敗!","l-red"); actOpen(true); } };
window.actOpen = function(f) { actOpen(f); };
window.useItem = function(k) { useItem(k); };
window.actRest = function() { actRest(); };
window.actDescend = function() { actDescend(); };
window.actChallengeBoss = function() { actChallengeBoss(); };
window.actRun = function() { actRun(); };
window.mod = function(k,v) { mod(k,v); };
