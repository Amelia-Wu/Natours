const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name.']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email.'],
        unique: true,
        lowercase: true,
        validator: [validator.isEmail, 'Please provide a valid email.']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password.'],
        validate: {
            //This only works on CREATE and SAVE
            validator: function(el) {
                return el === this.password;
            }
        }
    }
});

userSchema.pre('save', async function(next) {
    //this means this document(user), if the password is not modified, move on to the next middleware
    if (!this.isModified('password')) return next();

    //hash the password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //delete the password confirm field
    this.passwordConfirm = undefined;
    next();
});

//This is an instance method, which is available in all the documents
//Use bcrypt to compare if the stored password is the same as the input password(candidatePassword)
//Need to use bcrypt because the candidatePassword is not encrypted
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

const User = mongoose.model('User', userSchema);

module.exports = User;