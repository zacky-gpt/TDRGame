// --- data.js : 世界の構成データ ---

export const CONF = { initTurns: 150, maxFloor: 10, itemMax: 3 };
export const SAVE_KEY = 'trd_save_data_v33_modular'; // キー更新

export const JOBS = [
    // Middle Path
    { id:'novice', name:'Novice', req:null, bonus:{}, desc:"凡人", priority:1, skill:{id:'Guts', name:"Guts", type:"buff", cd:15, pwr:0, acc:1.0, desc:"食いしばり(2T)"} },
    { id:'veteran', name:'Veteran', req:{lv_min:10}, bonus:{phys:1.1, mag:1.1, def:0.9}, desc:"熟練者(全能微増)", priority:1.2, skill:{id:'Guts+', name:"Guts+", type:"buff", cd:15, pwr:0, acc:1.0, desc:"食いしばり(3T)+攻UP"} },
    { id:'hero', name:'Hero', req:{lv_min:20}, bonus:{phys:1.2, mag:1.2, def:0.8, eva:0.1}, desc:"英雄(全能強化)", priority:1.5, skill:{id:'Awakening', name:"Awakening", type:"buff", cd:20, pwr:0, acc:1.0, desc:"覚醒(4T不死+全強化)"} },

    // T-Axis
    { id:'warrior', name:'Warrior', req:{t_min:70}, bonus:{phys:1.2}, desc:"物攻+20%", priority:2, skill:{id:'Braver', name:"Braver", type:"phys", cd:10, pwr:2.5, acc:0.95, desc:"必殺の一撃"} },
    { id:'wizard', name:'Wizard', req:{t_max:30}, bonus:{mag:1.2}, desc:"魔攻+20%", priority:2, skill:{id:'Fireball', name:"Fireball", type:"mag", cd:8, pwr:2.2, acc:1.0, desc:"大爆発"} },
    
    // D-Axis
    { id:'guardian', name:'Guardian', req:{d_min:70}, bonus:{def:0.8}, desc:"被ダメ-20%", priority:2, skill:{id:'IronWall', name:"IronWall", type:"def", cd:15, pwr:0, acc:1.0, desc:"完全防御(1T)"} },
    { id:'rogue', name:'Rogue', req:{d_max:30}, bonus:{eva:0.2}, desc:"回避+20%", priority:2, skill:{id:'Mug', name:"Mug", type:"phys", cd:6, pwr:1.0, acc:1.0, desc:"確定強奪"} },
    
    // R-Axis
    { id:'sniper', name:'Sniper', req:{r_min:70}, bonus:{crit:0.2}, desc:"Crit+20%", priority:2, skill:{id:'Headshot', name:"Headshot", type:"phys", cd:8, pwr:1.8, acc:1.0, desc:"確定クリティカル"} },
    { id:'cleric', name:'Cleric', req:{r_max:30}, bonus:{heal:1.3}, desc:"回復+30%", priority:2, skill:{id:'Pray', name:"Pray", type:"heal", cd:12, pwr:0, acc:1.0, desc:"特大回復"} },
    
    // Hybrid
    { id:'paladin', name:'Paladin', req:{t_min:70, d_min:70}, bonus:{phys:1.1, def:0.85}, desc:"物+10% 耐-15%", priority:2, skill:{id:'HolyBlade', name:"HolyBlade", type:"hyb", cd:10, pwr:2.2, acc:1.0, desc:"聖なる剣(対霊特効)"} },
    { id:'assassin', name:'Assassin', req:{t_min:70, d_max:30}, bonus:{phys:1.1, crit:0.1}, desc:"物+10% Crit+10%", priority:2, skill:{id:'Backstab', name:"Backstab", type:"phys", cd:10, pwr:2.0, acc:1.0, desc:"背後から一撃"} },
    { id:'sage', name:'Sage', req:{t_max:30, r_max:30}, bonus:{mag:1.1, heal:1.2}, desc:"魔+10% 回+20%", priority:2, skill:{id:'BigBang', name:"BigBang", type:"mag", cd:15, pwr:3.0, acc:1.0, desc:"究極魔法"} },
    { id:'sentinel', name:'Sentinel', req:{d_min:70, r_max:30}, bonus:{def:0.7, time:1}, desc:"耐-30% 撃破時時+1", priority:2, skill:{id:'Aegis', name:"Aegis", type:"buff", cd:12, pwr:0, acc:1.0, desc:"絶対防御壁"} },
    { id:'reaper', name:'Reaper', req:{t_max:30, r_min:70}, bonus:{mag:1.1, crit:0.1}, desc:"魔+10% 即死使い", priority:2, skill:{id:'Execution', name:"Execution", type:"mag", cd:12, pwr:1.0, acc:0.9, desc:"確率即死", isInstantDeath:true} },

    // High Tier
    { id:'samurai', name:'Samurai', req:{t_min:85, r_min:85}, bonus:{phys:1.3, crit:0.2}, desc:"物+30% Crit+20%", priority:3, skill:{id:'Zantetsu', name:"Zantetsu", type:"phys", cd:15, pwr:3.5, acc:1.0, desc:"一撃必殺"} },
    { id:'archmage', name:'Archmage', req:{t_max:15, r_max:15}, bonus:{mag:1.3, heal:1.3}, desc:"魔+30% 回+30%", priority:3, skill:{id:'Meteor', name:"Meteor", type:"mag", cd:18, pwr:4.0, acc:1.0, desc:"隕石召喚"} },
    { id:'ninja', name:'Ninja', req:{d_max:15, r_min:85}, bonus:{eva:0.25, crit:0.2}, desc:"避+25% Crit+20%", priority:3, skill:{id:'Assassinate', name:"Assassinate", type:"phys", cd:12, pwr:2.2, acc:1.0, desc:"即死攻撃", isInstantDeath:true} }
];

export const ENEMY_TYPES = [
    { id: 'slime', name: 'Slime', hpMod: 0.8, defMod: 1.5, mDefMod: 0.2, eva: 0, act:['atk','atk','heal'], resP:1.0, desc: '再生能力/魔法弱点' },
    { id: 'bat', name: 'Bat', hpMod: 0.6, defMod: 0.5, mDefMod: 0.5, eva: 0.25, act:['atk'], resP:1.0, desc: '高回避' },
    { id: 'golem', name: 'Golem', hpMod: 1.4, defMod: 1.1, mDefMod: 0.8, eva: -0.1, act:['atk','atk','charge'], resP:1.0, desc: '高耐久/タメ攻撃' },
    { id: 'ghost', name: 'Ghost', hpMod: 0.6, defMod: 2.5, mDefMod: 0.4, eva: 0.1, act:['mag'], resP:0.1, desc: '物理耐性/呪い' }
];

export const BOSSES = {
    5: { id:'cerberus', name:'Cerberus', hp:200, atk:15, defMod:1.0, mDefMod:1.0, eva:0.05, act:['atk','atk','charge','mag'], desc:'【中ボス】地獄の番犬' },
    10: { id:'overlord', name:'Overlord', hp:800, atk:40, defMod:1.2, mDefMod:1.2, eva:0.1, act:['atk','mag','charge','heal'], desc:'【BOSS】螺旋の終焉' }
};

export const ITEM_DATA = {
    potion: { name: "Potion", desc: "HP50回復", type: "heal", val: 50 },
    ether:  { name: "Ether", desc: "MP20回復", type: "mp", val: 20 },
    bomb:   { name: "Bomb", desc: "防御無視50dmg", type: "dmg", val: 50 },
    clock:  { name: "Clock", desc: "寿命+10", type: "turn", val: 10 }
};

export const INITIAL_G = {
    state: 'EXPLORE', floor: 1, stairsFound: false, searchCount: 0,
    turns: CONF.initTurns, maxTurns: CONF.initTurns,
    lv: 1, exp: 0, next: 30, hp: 25, mhp: 25, mp: 10, mmp: 10, 
    axis: { T: 50, D: 50, R: 50 }, 
    items: { potion: 1, bomb: 0, ether: 1, clock: 0 },
    enemy: null, chest: null, gameOver: false, isCharging: false, isStunned: false,
    isFocused: false, jobSkillCd: 0, immortalTurns: 0, awakening: false, guardStance: false
};
