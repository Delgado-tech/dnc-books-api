import mongoose from 'mongoose';

export enum UserAccessLevel {
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
        select: false
    },
    accessLevel: {
        type: String,
        required: true,
        select: false
    }
}, {
    timestamps: false,
});

export const userSchema = mongoose.models.UserData || mongoose.model("UserData", schema);