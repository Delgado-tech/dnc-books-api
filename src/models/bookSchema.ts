import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    codeISBN: {
        type: String,
        required: true,
        unique: true,
        minlength: 13,
        maxlength: 13
    },
    publisher: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

export const bookSchema = mongoose.models.BookData || mongoose.model("BookData", schema);