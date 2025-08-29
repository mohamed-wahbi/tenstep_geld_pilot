const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },

    dataverseId: {
        type: String,
        default:""
    }
});

const TestModel = mongoose.model('TestModel', testSchema);

module.exports = {TestModel};
