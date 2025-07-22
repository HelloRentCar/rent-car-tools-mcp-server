import dayjs from 'dayjs';
export async function getFetch() {
    // Node.js 18+ 有内置的 fetch
    if (typeof globalThis.fetch !== 'undefined') {
        return globalThis.fetch;
    }
    // Node.js 16 需要使用 node-fetch
    try {
        const { default: fetch } = await import('node-fetch');
        return fetch;
    }
    catch (error) {
        throw new Error('请安装 node-fetch: npm install node-fetch');
    }
}
export const toTimestamp = (timeStr) => {
    const date = new Date(dayjs((timeStr).replace('年', '-').replace('月', '-').replace('日', '')).format('YYYY-MM-DD HH:mm:ss')).getTime();
    return date;
};
