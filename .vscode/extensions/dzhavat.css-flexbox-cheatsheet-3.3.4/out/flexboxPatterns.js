"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allFlexboxPatterns = exports.order = exports.flexShrinkBiggerThanZero = exports.flexGrowBiggerThanZero = exports.displayFlexPattern = void 0;
/**
 * Matches `display: flex` property
 */
exports.displayFlexPattern = /display:\s*flex;?/g;
/**
 * Matches `display: inline-flex` property
 */
const displayInlineFlexPattern = /display:\s*inline-flex;?/g;
/**
 * Matches all `align-items`, `align-content` and `align-self` properties
 */
const alignPattern = /align-[\w]+:\s*[\w-]+;?/g;
/**
 * Matches all `justify-content` properties
 */
const justifyPattern = /justify-[\w]+:\s*[\w-]+;?/g;
/**
 * Matches all `flex-direction` and `flex-wrap` properties
 */
const flexWrapAndDirectionPattern = /flex-(wrap|direction):\s*[\w-]+;?/g;
/**
 * Matches all `flex-grow` and `flex-shrink` properties
 */
const flexGrowAndShrinkPattern = /flex-(grow|shrink):\s*\d+;?/g;
/**
 * Matches `flex-grow` values bigger than 0
 */
exports.flexGrowBiggerThanZero = /flex-grow:\s*(?!0)\d+;?/;
/**
 * Matches `flex-shrink` values bigger than 0
 */
exports.flexShrinkBiggerThanZero = /flex-shrink:\s*(?!0)\d+;?/;
/**
 * Matches `order` property
 */
exports.order = /order:\s*?-?\d+;?/g;
exports.allFlexboxPatterns = [
    exports.displayFlexPattern,
    displayInlineFlexPattern,
    alignPattern,
    justifyPattern,
    flexWrapAndDirectionPattern,
    flexGrowAndShrinkPattern,
    exports.order
];
//# sourceMappingURL=flexboxPatterns.js.map