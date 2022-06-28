const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    idNumber: { type: Number, require: true },
    firstName: { type: String, required: true },
    lastName: { type: String, require: true },
    password: { type: String, require: true }, // hashing password w/ salt
    email: { type: String, require: true },
	image: String	
});

module.exports = mongoose.model('User', userSchema, 'users');
