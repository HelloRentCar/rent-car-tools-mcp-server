import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc.js';
// import timezone from 'dayjs/plugin/timezone.js';
// dayjs.extend(utc);
// dayjs.extend(timezone);

export async function getFetch() {
  // Node.js 18+ 有内置的 fetch
  if (typeof globalThis.fetch !== 'undefined') {
    return globalThis.fetch;
  }

  // Node.js 16 需要使用 node-fetch
  try {
    const { default: fetch } = await import('node-fetch');
    return fetch as any;
  } catch (error) {
    throw new Error('请安装 node-fetch: npm install node-fetch');
  }
}


// export async function toTimestamp(timeStr: string, tz = 'Asia/Shanghai') {
//   console.log('timeStr', dayjs.tz(timeStr, tz).valueOf());
//   return dayjs.tz(timeStr, tz).valueOf();
// }

export function toTimestamp(timeStr: string) {
  const date = new Date(dayjs((timeStr).replace('年', '-').replace('月', '-').replace('日', '')).format('YYYY-MM-DD HH:mm:ss')).getTime()
  return date;
}
