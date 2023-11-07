const mongoose = require('mongoose');
const { Schema } = mongoose;


const cartSchema = new Schema({
    quantity: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }
})

const virtual = cartSchema.virtual('id');
virtual.get(() => {
    return this._id
})
cartSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => { delete ret._id }
})

exports.Cart = mongoose.model('Cart', cartSchema);
