import { Blob } from 'buffer';
import Environment from 'jest-environment-jsdom';
/**
 * A custom environment to set the TextEncoder that is required by TensorFlow.js.
 */
module.exports = class CustomTestEnvironment extends Environment {
    async setup() {
        await super.setup();
        if (typeof this.global.TextEncoder === 'undefined') {
            const { TextEncoder } = require('util');
            this.global.TextEncoder = TextEncoder;
        }
        if (typeof this.global.TextDecoder === 'undefined') {
            const { TextDecoder } = require('util');
            this.global.TextDecoder = TextDecoder;
        }
        if (typeof this.global.fetch === 'undefined') {
            this.global.fetch = function name(args) {
                return import('node-fetch').then((fetch) => fetch.default(args));
            };
        }

        if (typeof this.global.URL.createObjectURL === 'undefined') {
            this.global.URL.createObjectURL = (a) => URL.createObjectURL(new Blob([a]));
        }
    }
};
