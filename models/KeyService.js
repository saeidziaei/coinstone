var keystone = require('keystone');
var Types = keystone.Field.Types;
/**
 * Key Service Model
 * =============
 */
var KeyService = new keystone.List('KeyService');
KeyService.add({
    keyName: {type: String, required: true, initial: false},
    seq: { type: Types.Number, default: 0 }
});


KeyService.register();