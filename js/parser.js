/* Smart SAP Mapper for MSME Clause 22 tax-audit data. */ 
const HEADER_ALIASES={
 amount:["amount","amount in lc","local currency","amount paid","debit","credit","amt"],
 docDate:["document date","doc date","posting date","invoice date"],
 payDate:["clearing date","payment date","clearing","clearing/payt date","payment"],
 vendor:["vendor","vendor name","supplier","party","party name","customer/vendor"],
 text:["text","narration","description","remarks","reference"],
 creditPeriod:["credit period","credit days","payment terms","terms"]
};
function norm(v){return String(v||"").trim().toLowerCase().replace(/[_.:/()-]+/g," ").replace(/\s+/g," ")}
function findHeader(headers,aliases){return headers.findIndex(h=>aliases.some(a=>norm(h)===norm(a)||norm(h).includes(norm(a))))}
function detectMapping(headers){const m={};for(const [key,aliases] of Object.entries(HEADER_ALIASES)){const i=findHeader(headers,aliases);if(i>=0)m[key]=i}return m}
function parseFlexibleDate(v){if(v===null||v===undefined||v==="")return null;const s=String(v).trim();const p=s.split(/[\/-]/).map(Number);if(p.length===3&&!p.some(Number.isNaN)){if(p[2]>1900)return new Date(p[2],p[1]-1,p[0]);if(p[0]>1900)return new Date(p[0],p[1]-1,p[2])}const d=new Date(s);return Number.isNaN(d.getTime())?null:d}
function parseAmount(v){if(v===null||v===undefined)return 0;let s=String(v).replace(/[,₹]/g,"").trim();if(s.startsWith("(")&&s.endsWith(")"))s="-"+s.slice(1,-1);return Number(s)||0}
function parseSAPPaste(text,manualMapping={}){
 const lines=text.trim().split(/\r?\n/).filter(Boolean);if(!lines.length)return {headers:[],rows:[],mapping:{}};
 const rawHeaders=lines[0].split("\t").map(norm),auto=detectMapping(rawHeaders),mapping={...auto,...manualMapping},body=lines.slice(1);
 const rows=body.map((line,i)=>{const c=line.split("\t");return{sr:i+1,vendor:mapping.vendor!=null?(c[mapping.vendor]||"Unknown").trim():"Unknown",amount:mapping.amount!=null?parseAmount(c[mapping.amount]):0,docDate:mapping.docDate!=null?parseFlexibleDate(c[mapping.docDate]):null,payDate:mapping.payDate!=null?parseFlexibleDate(c[mapping.payDate]):null,text:mapping.text!=null?(c[mapping.text]||"").trim():"",creditPeriod:mapping.creditPeriod!=null?parseAmount(c[mapping.creditPeriod]):45}}).filter(r=>r.amount!==0||r.docDate||r.vendor!=="Unknown");
 return {headers:rawHeaders,rows,mapping};
}
