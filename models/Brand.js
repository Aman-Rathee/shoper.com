const mongoose = require('mongoose');
const { Schema } = mongoose;


const brandSchema = new Schema({
    value: { type: String, required: true, unique: true },
    label: { type: String, required: true, unique: true }
})

const virtual = brandSchema.virtual('id');
virtual.get(() => {
    return this._id
})
brandSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => { delete ret._id }
})

exports.Brand = mongoose.model('Brand', brandSchema);
