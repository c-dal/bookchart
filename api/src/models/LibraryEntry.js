import mongoose from "mongoose";

const libraryEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    authors: {
        type: [String]
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
        enum: ['À lire', 'En cours', 'Lu'],
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