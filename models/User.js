const mongoose = require('mongoose');
const { Schema } = mongoose;


const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: Buffer, required: true },
    role: { type: String, required: true, default: 'user' },
    addresses: { type: [Schema.Types.Mixed] },
    // TODO : we can make a separate Schema for addresses
    name: { type: String },
    // orders: { type: [Schema.Types.Mixed] },
    salt: Buffer,
})

const virtual = userSchema.virtual('id');
virtual.get(() => {
    return this._id
})
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => { delete ret._id }
})

exports.User = mongoose.model('User', userSchema);
