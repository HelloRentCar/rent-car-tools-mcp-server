import { getFetch } from './index.js';
export async function getUbt({ pointId, businessInfo = {} }) {
    try {
        const fetch = await getFetch();
        await fetch('https://apmgw.hellobike.com/metrics', {
            method: 'POST',
            body: JSON.stringify({
                info: [
                    {
                        logerType: 'ubt',
                        extraType: 'ubt_zuche',
                        info: {
                            eventId: 'others',
                            detailProperties: {
                                eventId: 'others',
                                pointId,
                                categoryId: 'rentCars',
                            },
                        },
                        businessInfo,
                    }
                ]
            })
        });
    }
    catch (error) {
    }
}
