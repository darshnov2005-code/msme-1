function isPaymentRow(r,settings={}){const text=(r.text||"").toLowerCase();const bank=(settings.bankKeywords||["punjab national bank","pnb","hdfc bank","icici bank","axis bank","kotak bank","bank"]).some(k=>text.includes(k));return r.amount>0||bank}
function fifoMatch(rows,settings={}){
 const invoices=rows.filter(r=>r.amount<0).map(r=>({id:"INV-"+r.sr,sr:r.sr,vendor:r.vendor||"Unknown",amount:Math.abs(r.amount),remaining:Math.abs(r.amount),docDate:r.docDate,creditPeriod:r.creditPeriod||settings.defaultCreditPeriod||45,text:r.text,allocations:[]}));
 const payments=rows.filter(r=>isPaymentRow(r,settings)&&r.amount>0).map(r=>({id:"PAY-"+r.sr,sr:r.sr,amount:Math.abs(r.amount),remaining:Math.abs(r.amount),date:r.payDate||r.docDate,vendor:r.vendor||"Unknown",text:r.text}));
 const byVendor={};invoices.forEach(i=>(byVendor[i.vendor]??=[]).push(i));
 payments.forEach(p=>{const pool=byVendor[p.vendor]||invoices.filter(i=>i.vendor==="Unknown");for(const inv of pool){if(p.remaining<=0||inv.remaining<=0)continue;const used=Math.min(p.remaining,inv.remaining);inv.remaining-=used;p.remaining-=used;inv.allocations.push({paymentId:p.id,date:p.date,amount:used})}});
 return {invoices,payments,unmatchedPayments:payments.filter(p=>p.remaining>0.005)};
}
