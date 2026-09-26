const DB_KEY="MSME_AUDITCHECK_V2";
function db(){try{return JSON.parse(localStorage.getItem(DB_KEY)||'{"clients":{}}')}catch{return{clients:{}}}}
function saveDb(x){localStorage.setItem(DB_KEY,JSON.stringify(x))}
function ensureFY(client,fy){const d=db();d.clients[client]??={years:{}};d.clients[client].years[fy]??={rows:[],vendors:{},overrides:{},notes:{},settings:{fyEnd:fy==="2025-26"?"2026-03-31":""}};saveDb(d);return d.clients[client].years[fy]}
function getFY(client,fy){const d=ensureFY(client,fy);return d.clients?.[client]?.years?.[fy]||d.clients[client].years[fy]}
function listClients(){return Object.keys(db().clients||{})}
function listFY(client){return Object.keys(db().clients?.[client]?.years||{})}
function saveFY(client,fy,payload){const d=db();d.clients[client]??={years:{}};d.clients[client].years[fy]={...ensureFY(client,fy),...payload};saveDb(d)}
