const express = require('express');
const controller = require('../controllers/controller.js');

const app = express();

app.get('/', controller.getIndex);
app.get('/login', controller.getLogin);
app.post("/log-in", controller.postLogin);
app.get('/signup', controller.getSignup);
app.post('/sign-up', controller.postSignup);
app.get("/Home", controller.getHome);
app.post("/Home", controller.getHome);
app.get("/Body", controller.getBody);
app.post("/Body", controller.postBody);
app.get("/profile", controller.getProfile);
app.post("/profile", controller.postProfile);
app.post("/about", controller.postAbout);
app.get("/poster-profile", controller.getPosterProfile);
app.post("/NewPost", controller.postNewPost);
app.post('/submit-post', controller.postSubmitPost);
app.post('/submit-comment', controller.postSubmitComment);
app.post('/edit-post', controller.postEditPost);
app.post('/update-post', controller.postUpdatePost);
app.post('/back-to-post', controller.postBackPost);
app.post('/delete-post', controller.postDeletePost);
app.post('/edit-comment', controller.postEditComment);
app.post('/update-comment', controller.postUpdateComment);
app.post('/delete-comment', controller.postDeleteComment);
app.get("/post", controller.getPost);
app.post("/post", controller.postPost);
app.post("/sort-posts", controller.postSortPosts);
app.post("/search-posts", controller.postSearchPosts);
app.post("/search-comments", controller.postSearchComments);
app.post("/edit-profile-pic", controller.postEditProfilePic);
app.get("/logout", controller.getLogOut);

module.exports = app;
