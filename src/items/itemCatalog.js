export const ITEM_CATALOG={
 helmet:{name:"Capacete",slot:"head",kind:"equipment",tone:"gray"},
 armor:{name:"Armadura",slot:"body",kind:"equipment",tone:"gray"},
 pants:{name:"Calça",slot:"legs",kind:"equipment",tone:"gray"},
 boots:{name:"Botas",slot:"feet",kind:"equipment",tone:"gray"},
 ring:{name:"Anel místico",slot:"mystic",kind:"equipment",tone:"mystic"}
};
export const EQUIPMENT_TYPES=Object.keys(ITEM_CATALOG);
export function createItem(type){const base=ITEM_CATALOG[type];return base?{id:`${type}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,type,...base}:null}