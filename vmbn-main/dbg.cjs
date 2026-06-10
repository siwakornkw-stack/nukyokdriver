const XLSX = require('xlsx');
const str = (s) => (s==null)?'':String(s).trim();
const excelSerialToDate = (n) => { const d=new Date(Math.round((n-25569)*86400*1000)); return isNaN(d.getTime())?null:d; };
const adjustBE = (d) => { if(!d) return null; if(d.getFullYear()>=2400){const x=new Date(d.getTime());x.setFullYear(x.getFullYear()-543);return x;} return d; };
const dateOrNull = (v) => {
  if (v===undefined||v===null||v==='') return null;
  if (v instanceof Date) return adjustBE(isNaN(v.getTime())?null:v);
  if (typeof v==='number') return v>10000&&v<400000?adjustBE(excelSerialToDate(v)):null;
  const s=String(v).trim(); if(!s) return null;
  if (/^\d+(\.\d+)?$/.test(s)){const n=parseFloat(s);return n>10000&&n<400000?adjustBE(excelSerialToDate(n)):null;}
  const d=new Date(s); return adjustBE(isNaN(d.getTime())?null:d);
};
const wb = XLSX.read(require('fs').readFileSync(process.argv[2]), { type:'buffer', cellDates:false });
const name = wb.SheetNames[0];
const m = XLSX.utils.sheet_to_json(wb.Sheets[name], { header:1, blankrows:false, defval:'' });
console.log('SHEET', name, 'rows', m.length);
for (let i=6;i<Math.min(m.length,16);i++){
  const c0=m[i][0];
  console.log(`row ${i}: col0=${JSON.stringify(c0)} (type ${typeof c0}) -> dateOrNull=`, dateOrNull(c0));
}
// also with cellDates:true
const wb2 = XLSX.read(require('fs').readFileSync(process.argv[2]), { type:'buffer', cellDates:true });
const m2 = XLSX.utils.sheet_to_json(wb2.Sheets[name], { header:1, blankrows:false, defval:'' });
console.log('--- cellDates:true ---');
for (let i=8;i<Math.min(m2.length,12);i++){ const c0=m2[i][0]; console.log(`row ${i}: col0=${JSON.stringify(c0)} (type ${typeof c0})`); }
