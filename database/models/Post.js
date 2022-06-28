const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
	datetime: Date,
	type: String,
	title: String,
	content: String,
	commentNo: Number,
	student: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;