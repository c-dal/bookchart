const mongoose = require("mongoose");

const libraryEntrySchema = new mongoose.Schema({
    openLibraryId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isbn: {
        type: String,
        default: null
    },
    title: {
        type: String,
        required: true
    },
    authors: {
        type: [String],
        default: []
    },
    description: {
        type: String,
    },
    thumbnail: {
        type: String
    },
    publishedDate: {
        type: String
    },
    status: {
        type: String,
        enum: ['TO_READ', 'FINISHED', 'CURRENT'],
        required: true
    }
}, { timestamps: true });

libraryEntrySchema.index(
    { userId: 1, googleBooksId: 1 },
    { unique: true }
);

libraryEntrySchema.index({ userId: 1, status: 1 });

const LibraryEntry = mongoose.model('LibraryEntry', libraryEntrySchema);

module.exports = LibraryEntry;