const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
	postID: String,
	datetime: Date,
	type: String,
	content: String,
	student: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;