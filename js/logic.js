// --- logic.js : 計算・判定ロジック ---
import { JOBS, ITEM_DATA } from './data.js';

// ステータス計算
export function getStats(lv, awakening, axis) {
    let b = 5 + (lv * 1.0); 
    if(awakening) b *= 1.5;
    return {
        STR: Math.floor(b * (axis.T/50)), INT: Math.floor(b * ((100-axis.T)/50)),
        VIT: Math.floor(b * (axis.D/50)), AGI: Math.floor(b * ((100-axis.D)/50)),
        DEX: Math.floor(b * (axis.R/50)), MND: Math.floor(b * ((100-axis.R)/50))
    };
}

// 適職判定
export function getBestJob(t, d, r, lv) {
    let best = JOBS[0];
    let bestP = 0;
    
    for(let j of JOBS) {
        if(j.req && j.req.lv_min && lv < j.req.lv_min) continue;
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
    return best;
}

// スキルデッキ生成
export function getDeck(axis, currentJob) {
    const t=axis.T, d=axis.D, r=axis.R;
    
    let basic = {id:'atk', name:"Attack", type:"phys", mp:0, pwr:1.0, acc:0.95, desc:"通常攻撃"};
    if (['wizard','archmage','sage','reaper'].includes(currentJob.id)) {
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

    if(currentJob.skill) { deck.push(currentJob.skill); }
    return deck;
}

// 命中計算
export function calcHit(sk, s, enemy, isFocused) {
    if(isFocused) return 1.0;
    let r = sk.acc;
    if(sk.type==='phys'||sk.type==='hyb') r += (s.DEX * 0.01);
    if(enemy) r -= enemy.eva;
    let res = Math.min(1.0, Math.max(0.0, r));
    if(sk.cap !== undefined) res = Math.min(res, sk.cap);
    return res;
}

// ダメージ計算
export function calcDmg(sk, s, enemy, currentJob) {
    const type = sk.type;
    const pwr = sk.pwr;

    if(type==='heal'||type==='def'||type==='buff') return {min:0,max:0};
    let base = 0;
    if(type==='phys') base=s.STR; else if(type==='mag') base=s.INT; else if(type==='hyb') base=(s.STR+s.INT)*0.6;
    else if(type==='bomb') return {min:ITEM_DATA.bomb.val, max:ITEM_DATA.bomb.val};

    const jb = currentJob.bonus; let mod = 1.0;
    if(type==='phys' && jb.phys) mod *= jb.phys; 
    if(type==='mag' && jb.mag) mod *= jb.mag;
    
    if(currentJob.id === 'paladin' && enemy && enemy.id === 'ghost' && sk.name === 'HolyBlade') mod *= 2.0;

    let val = Math.floor(base * pwr * mod); 
    if(val < 1) val = 1;

    if(!enemy) return {min:0, max:0};
    
    // Resistance
    let res = 1.0;
    if(type==='phys') res = (enemy.resP!==undefined ? enemy.resP : 1.0);
    if(type==='mag') res = (enemy.resM!==undefined ? enemy.resM : 1.0);
    // Lv Scaling
    if(enemy.lv > 10) res *= (1.0 - Math.min(0.2, (enemy.lv-10)*0.02));
    // Hybrid Penetration
    if(type==='hyb') {
         const resAvg = ((enemy.resP||1)+(enemy.resM||1))/2;
         res = Math.max(resAvg, 0.8); 
    }
    
    val = Math.floor(val * res);
    const net = val;
    return {min:Math.floor(net*0.9), max:Math.floor(net*1.1)};
}
