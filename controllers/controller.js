const Post = require("../database/models/Post");
const Comment = require("../database/models/Comment");
const User = require('../database/models/user');
const path = require("path");
const fileUpload = require("express-fileupload");
const bcrypt = require('bcryptjs');
var tempID;
var tempType;

const controller = {
	
    getIndex: function (req, res) {
		res.render('index.hbs');
	},
	
	getLogOut: function (req, res){
		console.log(req.session.user);
		if (req.session.user) {
			req.session.destroy(() => {
				res.clearCookie('connect.sid');
				res.redirect('/');
			});
		}
	},
	
    getLogin: function (req, res) {
		res.render("login.hbs");
	},

    postLogin: async (req, res) => {
		const users = await User.findOne({idNumber:req.body.idNumber});
		if (req.body.idNumber != "" && req.body.password != ""){
			if(await User.findOne({idNumber:req.body.idNumber}).count() > 0){
				bcrypt.compare(req.body.password, users.password, function(err, result) {
					if(result){
						res.render("Home.hbs", {users});
						console.log(users._id);
						req.session.user = users._id;
						console.log(req.session.user);
					}
						
					else
						res.render("login.hbs", {error:"*This ID Number and Password do not match."});
				});
			}
			else
				res.render("login.hbs", {error:"*This ID Number does not exist in our database."});
		}
		else
			res.render("login.hbs", {error:"*Please fill up all fields"});
	},

    getSignup: function (req, res) {
		res.render("signup.hbs")
	},
	
	postSignup: async (req, res) => {
		if (req.body.idNumber != "" && req.body.password != "" && req.body.lastName != "" && req.body.firstName != "" && req.body.confirmPassword != "" && req.body.email != ""){
			if(await User.find({idNumber:req.body.idNumber}).count() == 0){
				if (req.body.password == req.body.confirmPassword){
					bcrypt.hash(req.body.password, 10, function(err, hash) {
						// Store hash in your password DB.
						if(err){
							return res.status(500).json({error:err});
						}
						else{
							User.create({
								idNumber: req.body.idNumber,
								firstName: req.body.firstName,
								lastName: req.body.lastName,
								password: hash,
								email: req.body.email,
								image:'/images/defaultpicture.jpg'
							}, (error,post) => {
								res.redirect("/")
							})
						}
					});	
				}
				else
					res.render("signup.hbs", {error:"*The Password and Confirm Password do not match."});
			}
			else
				res.render("signup.hbs", {error:"*This Id Number has already been taken."});
		}	
		else
			res.render("signup.hbs", {error:"*Please fill up all fields"});
	},
	
	getHome: async(req,res)=>{
		const users = await User.find({_id:req.session.user});
		res.render("Home", {users});
	},
	
	getBody: async(req,res)=>{
		const posts = await Post.find({type:tempType}).populate("student");
		res.render("Body", {posts, type:tempType, id:req.session.user});
	},
	
	postBody: async(req,res)=>{
		const posts = await Post.find({type:req.body.type}).populate("student");
		res.render("Body", {posts, type:req.body.type, id:req.session.user});
	},
	
	getProfile: async(req,res)=>{
		console.log(req.session.user);
		const users = await User.find({_id:req.session.user});
		res.render("profile", {users});
	},
	
	postProfile: async(req,res)=>{
		console.log(req.session.user);
		const users = await User.find({_id:req.session.user});
		res.render("profile", {users});
	},
	
	postAbout: function(req,res){
		res.render("about.hbs");
	},
	
	getPosterProfile: async(req,res)=>{
		console.log(req.query.id);
		const users = await User.find({_id:req.query.id});
		res.render("profile", {users});
	},
	
	postNewPost: function(req,res){
		tempType = req.body.type;
		res.render("NewPost.hbs", {type:req.body.type});
	},
	
	postSubmitPost: function(req, res) {	
		if (req.body.title != "" && req.body.content != ""){
			var type = new String();
			var datetime = new Date();
			Post.create({
				...req.body,
				datetime: datetime,
				type: tempType,
				commentNo: 0,
				student: req.session.user
			}, (error,post) => {
				res.redirect('/Body')
			})
		}
		else
			res.render("newPost.hbs", {type:tempType, id:req.session.user, error:"*Please fill up all fields"});
	},
	
	postSubmitComment: async(req,res)=>{
		console.log(req.body.student);
		if (req.body.content != ""){
			tempID = req.body.postID;
			var datetime = new Date();
			const posts = await Post.updateOne({_id:req.body.postID},{$inc: {commentNo:1}});
			Comment.create({
				...req.body,
				datetime: datetime,
				student: req.body.student
			}, (error,post) => {
				res.redirect("/post")
			})
		}
		else{
			const posts = await Post.findById(tempID).populate("student");
			const comments = await Comment.find({postID:tempID}).populate("student");
			const users = await User.find({_id: req.session.user});
			res.render("post", {posts, comments, users, commentError:"*You must fill up all fields."});
		}
	},
	
	postEditPost: async(req,res)=>{
		if (req.session.user == req.body.studentid){
			const posts = await Post.findById(req.body.id);
			res.render("EditPost.hbs", {posts});
		}
		else{
			const posts = await Post.findById(tempID).populate("student");
			const comments = await Comment.find({postID:tempID}).populate("student");
			const users = await User.find({_id: req.session.user});
			res.render("post", {posts, comments, users, postError: "*You do not have the authorization to edit another student's post."});
		}	
	},
	
	postUpdatePost: async(req,res)=>{
		if (req.body.title != "" && req.body.content != ""){
			const posts = await Post.updateOne({_id:req.body.id},{$set: {title:req.body.title, content:req.body.content}});
			res.redirect("/post");
		}
		else{
			const posts = await Post.findById(req.body.id);
			res.render("EditPost.hbs", {posts, error:"*Please fill up all fields"});
		}
	},
	
	postDeletePost: async(req,res)=>{
		tempType = req.body.type;
		if (req.session.user == req.body.studentid){
			const posts = await Post.deleteOne({_id:req.body.id});
			const comments = await Comment.deleteMany({postID:req.body.id});
			res.redirect("/Body");
		}
		else{
			const posts = await Post.findById(tempID).populate("student");
			const comments = await Comment.find({postID:tempID}).populate("student");
			const users = await User.find({_id: req.session.user});
			res.render("post", {posts, comments, users, postError: "*You do not have the authorization to edit another student's post."});
		}	
	},
	
	postBackPost: async(req,res)=>{
		res.redirect("/post");
	},
	
	postEditComment: async(req,res)=>{
		if (req.session.user == req.body.studentid){
			const comments = await Comment.findById(req.body.id).populate("student");
			res.render("EditComment.hbs", {comments});
		}
		else{
			const posts = await Post.findById(tempID).populate("student");
			const comments = await Comment.find({postID:tempID}).populate("student");
			const users = await User.find({_id: req.session.user});
			res.render("post", {posts, comments, users, commentError2: "*You do not have the authorization to edit another student's post."});
		}
	},
	
	postUpdateComment: async(req,res)=>{
		if (req.body.content != ""){
			const comments = await Comment.updateOne({_id:req.body.commentID},{$set: {content:req.body.content}});
			res.redirect("/post");
		}
		else{
			const posts = await Post.findById(req.body.postID);
			const comments = await Comment.findById(req.body.commentID);
			res.render("EditComment.hbs", {posts, comments, error:"*Please fill up all fields"});
		}
	},
	
	postDeleteComment: async(req,res)=>{
		if (req.session.user == req.body.studentid){
			const posts = await Post.updateOne({_id:tempID},{$inc: {commentNo:-1}});
			const comments = await Comment.deleteOne({_id:req.body.id});
			res.redirect("/post");
		}
		else{
			const posts = await Post.findById(tempID).populate("student");
			const comments = await Comment.find({postID:tempID}).populate("student");
			const users = await User.find({_id: req.session.user});
			res.render("post", {posts, comments, users, commentError2: "*You do not have the authorization to edit another student's post."});
		}	
	},
	
	getPost: async(req,res)=>{
		const posts = await Post.findById(tempID).populate("student");
		const comments = await Comment.find({postID:tempID}).populate("student");
		const users = await User.find({_id: req.session.user});
		res.render("post", {posts, comments, users});
	},
	
	postPost: async(req,res)=>{
		tempID = req.body.postID;
		const posts = await Post.findById(req.body.postID).populate("student");
		const comments = await Comment.find({postID:req.body.postID}).populate("student");
		const users = await User.find({_id: req.session.user});
		res.render("post", {posts, comments, users});
	},
	
	postSortPosts: async(req,res)=>{
		const posts = (req.body.choice == "earliest") ? await Post.find({type:req.body.type}).populate("student").sort({datetime: 1}): ((req.body.choice == "latest") ? await Post.find({type:req.body.type}).populate("student").sort({datetime: -1}) : await Post.find({type:req.body.type}).populate("student").sort({title: 1}));
		res.render("Body", {posts, type:req.body.type});
	},
	
	postSearchPosts: async(req,res)=>{
		const posts = await Post.find({type:req.body.type, title: new RegExp(req.body.search, "i")}).populate("student");
		res.render("Body", {posts, type:req.body.type});
	},
	
	postSearchComments: async(req,res)=>{
		const posts = await Post.findById(req.body.postID).populate("student");
		const comments = await Comment.find({postID:req.body.postID, content: new RegExp(req.body.search, "i")}).populate("student");
		const users = await User.find({_id: req.session.user});
		res.render("post", {posts, comments,users});
	},
	
	postEditProfilePic: async(req,res)=>{
		if (req.files != null){
			const {image} = req.files;
			const users = await User.updateOne({_id:req.session.user},{$set: {image:'/images/'+image.name}});
			image.mv(path.resolve(__dirname,'../public/images',image.name));
		}
		res.redirect('/profile')
	}
}

module.exports = controller;