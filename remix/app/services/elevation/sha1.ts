import crypto from 'crypto';

export const sha1 = (s: string) => {
    return crypto.createHash('sha1').update(s).digest('base64');
};
