import mongoose from 'mongoose';

export enum UserAcessLevel {
    admin = "admin",
    default = "default"
}

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        immutable: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlenght: 32,
        select: false
    },
    acessLevel: {
        type: String,
        default: "default",
        select: false
    },
    token: {
        type: String,
        default: "",
        select: false
    }
}, {
    timestamps: false
});

export const userSchema = mongoose.models.UserData || mongoose.model("UserData", schema);