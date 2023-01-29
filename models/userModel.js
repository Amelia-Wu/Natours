const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
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
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
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

userSchema.pre('save', async function(next) {
    if (!this.isModified('password' || this.isNew)) return next();

    //make the passwordChangedAt one second before now, making sure the token is always used after the change of password
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next){
    //this points to the current query
    this.find({active: { $ne: false }});
    next();
})

//This is an instance method, which is available in all the documents
//Use bcrypt to compare if the stored password is the same as the input password(candidatePassword)
//Need to use bcrypt because the candidatePassword is not encrypted
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

//Check if the user changed password after using the token
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        //If the changed time is larger than the JWT time, the password has been changed
        return JWTTimestamp < changedTimestamp;
    }

    //False means the password is not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    //encode the token with the algorithm sha256
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //Make the password reset token expire after 10 minutes
    this.passwordResetExpires = Date.now() + 10 *60 *1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;