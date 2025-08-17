import UserAgent from 'user-agents';

export const getRandomUserAgent = () => {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    return userAgent.toString();
};

export const randomDelay = (min = 1000, max = 3000) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};