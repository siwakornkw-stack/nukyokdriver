export function numberFormat(number: number | string, plus = false, def = '-') {
	if (number === null) return def;
	const n = typeof number === 'string' ? parseFloat(number) : number;
	return isNaN(n) ? def : (plus && n > 0 ? '+' : '') + n.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatMoney(amount: number): string {
  // เก็บเครื่องหมายและค่าสัมบูรณ์
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  // จัดรูปแบบตัวเลข
  let result = '';
  if (absoluteAmount >= 1000) {
    result = (absoluteAmount / 1000).toFixed(1) + 'k';
  } else {
    result = absoluteAmount.toString();
  }
  
  // เพิ่มเครื่องหมายลบถ้าเป็นค่าติดลบ
  return isNegative ? '-' + result : result;
}
