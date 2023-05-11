const mongoose = require('mongoose')
const User = require('../models/user');
const crypto = require('crypto');
const async = require('async');
const nodemailer = require('nodemailer');



const addUser = (req, res) => {
    let { firstName, lastName, email, password, role } = req.body;
    password = 'Upm@2023'
    const userData = {
        firstName,
        lastName,
        email: `${firstName.charAt(0)}.${lastName}@afroukh.ac.ma`,
        role,
    };
    User.register(userData, password, (error, user) => {
        if (error) {
            req.flash('error_msg', `ERROR: ${error}`);
            res.redirect('/manageStudents');
        } else {
            req.flash('success_msg', 'User Created Successfully');
            res.redirect('/manageStudents');
        }
    });
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.render('./teacher-views/manage-students.ejs', { users, userId: req.params.user });
    }
    catch (err) {
        req.flash('error_msg', `ERRO: ${err}`)
        res.redirect('/')
    }

}


const forgetPassword = (req, res) => {
    let recoverPassword = '';
    async.waterfall([
        (done) => {
            crypto.randomBytes(10, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token)
            });
        },
        (token, done) => {
            User.findOne({ email: req.body.email })
                .then(user => {
                    if (!user) {
                        req.flash('error_msg', 'User does not exist with this email');
                        return res.redirect('/forgot');
                    }
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 18000000;
                    user.save(err => {
                        done(err, token, user)
                    })
                })
                .catch(err => {
                    req.flash('error_msg', `ERROR:${err}`);
                    res.redirect('/forgot');
                })
        },
        (token, user) => {
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.Gmail,
                    pass: process.env.password
                }
            });

            let mailOptions = {
                to: user.email,
                from: 'Mohamed Afroukh afroukhm03@gmail.com',
                subject: 'Recovery Email from Auth project',
                text: 'Please click the following link to recover your password:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'if you did not request this,please ignore this email.'
            };
            smtpTransport.sendMail(mailOptions, err => {
                req.flash('success_msg', 'Email with further instructions.Please check that.');
                res.redirect('/forgot');
            })
        }
    ], err => {
        if (err) res.redirect('/forgot')
        console.log(err)
    });
}



const logout = (req, res) => {
    res.clearCookie('loggedIn');
    req.logOut(() => {
        req.flash('success_msg', 'You have been logged out');
        res.redirect('/login');
    });
};

const resetPassword = (req, res) => {
    async.waterfall([
        (done) => {
            let token = req.params.token;
            User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
                .then(user => {
                    if (!user) {
                        req.flash('error_msg', 'Password reset token is invalid or has been expired.')
                        return res.redirect('/forgot')
                    }
                    if (req.body.password !== req.body.confirmPass) {
                        req.flash("error_msg", "Password Don't match.")
                        res.redirect('/forgot')
                    }
                    user.setPassword(req.body.password, err => {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(err => {
                            req.logIn(user, err => {
                                done(err, user);
                            })
                        })
                    })
                })
                .catch(err => {
                    req.flash('error_msg', `ERROR: ${err}`)
                    res.redirect('/forgot');
                });
        },
        (user) => {
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.Gmail,
                    pass: process.env.password
                }
            })
            let mailOptions = {
                to: user.email,
                from: 'Afroukh Mohamed mohamedAfroukh@gmail.com',
                subject: 'Your Password is changed',
                text: 'Hello ,+user.name' + '\n\n' +
                    'this is the confirmation that the password for your account ' + user.email + 'has beenchanged'
            };
            smtpTransport.sendMail(mailOptions, err => {
                req.flash('success_msg', 'Your password has been changed successfuly.')
                res.redirect('/login')
            })
        }

    ], err => {
        if (err) res.redirect('login')
    })
}


const reset = async (req, res) => {
    let token = req.params.token;
    await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error_msg', 'Password reset token is invalid or has been expired.')
                return res.redirect('/forgot')
            }
            res.render('newPass.ejs', { token })
        })
        .catch(err => {
            req.flash('error_msg', `ERROR: ${err}`);
            res.redirect('/forgot');
        })

}

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        console.log(user)
        res.render('user-profile.ejs', { user })
    }
    catch (err) {
        req.flash(`eror_msg ${err}`)
        console.log(err)
        res.redirect('/')
    }

}

const updateUser = async function (req, res) {
    try {
        const userId = req.params.id;
        // Get the updated user data from the request body
        const updatedUserData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            role: req.body.role
        };
        // Update the user in the database
        const user = await User.findByIdAndUpdate(userId, updatedUserData);
        console.log(mongoose.Types.ObjectId(userId))
        // Redirect to the manage students page
        res.redirect('/manageStudents');
    } catch (err) {
        // Handle the error
        console.log(err)
        res.status(500).send('Error updating user');
    }
};
/// get edite
const edit = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id })
        res.render('./teacher-views/edit.ejs', { user })
    } catch (err) {
        req.flash(`ERRO:${err}`)
        res.redirect('./teacher-views/manage-students.ejs') // Redirect back to the previous page
    }
}
// update user data 
const editUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id,{
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            role: req.body.role
        })
        await res.redirect('/manageStudents')
    } catch (err) {
        console.log(err)
    }

}


module.exports = {
    forgetPassword,
    logout,
    reset,
    addUser,
    resetPassword,
    getProfile,
    getUsers,
    updateUser,
    edit,
    editUser

}