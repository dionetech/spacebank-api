const express = require('express');
const bcrypt = require('bcrypt');
const failedResponse = require('../../helpers/failedResponse');
const successResponse = require('../../helpers/successResponse');
const { Balance } = require('../../models/Balance');
const OTP = require('../../models/OTP');
const { User } = require('../../models/User');
const Verification = require('../../models/Verification');
const UserSession = require('../../models/UserSession');
const router = express.Router();

// Login Route
router.post("/", async(req, res, next) => {
    try{
        const { email, password } = req.body;
        let user;
        user = await User.findOne({ email: email });
        if (!user) return failedResponse(res, 400, 'User with these details does not exist');

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return failedResponse(res, 400, 'Incorrect password');
            
        if (!user.verifiedEmail)
            return failedResponse(res, 400, 'Email not verified');

        const token = user.generateAuthToken();
        const session = new UserSession({
            user: user._id,
        });
        await session.save();
        user.passwordText = undefined;
        user.password=undefined;

        return successResponse(res, 200, { user, token}, 'Successfull authentication');

    }catch(error){
        next(error);
    }
})

// Register Router
router.post("/signup", async(req, res, next) => {
    try{
        const { firstName, lastName, username, phoneNumber, email, password, wallet } = req.body;
        let user;
        user = await User.findOne({ email: email });
        if (user) return failedResponse(res, 400, 'User with this email already exist');
        user = await User.findOne({ phoneNumber: phoneNumber });
        if (user) return failedResponse(res, 400, 'User with this number already exist');

        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(password, salt);

        user = new User({
            firstName: firstName,
            lastName: lastName,
            name: `${firstName} ${lastName}`,
            username: username,
            email: email,
            phoneNumber: phoneNumber,
            wallet: wallet,
            password: hashed_password,
            passwordText: password,
            profilePhoto: 'https://res.cloudinary.com/cryptocrat/image/upload/v1649181236/istockphoto-522855255-612x612_sslqgh.jpg',
            uniqueID: Date.now().toString().slice(9, 13)
        });
        user = await user.save();

        await new Balance({ user: user._id }).save();
        await new Verification({ user: user._id }).save();

        const otp = Date.now().toString().slice(9, 13);
        console.log("NUM OTP: ", otp);

        await new OTP({
            otp: otp,
        }).save();
    
        user.passwordText = undefined;
        return successResponse(res, 200, user, 'Verification code sent to your mail');

    }catch(error){
        next(error);
    }
})

router.post("/otp", async(req, res, next) => {
    try{
        const { email, otp } = req.body;
        console.log("BODY: ", req.body);

        const checkOTPCode = await OTP.findOne({ otp: String(otp) });
        if (!checkOTPCode) return failedResponse(res, 400, 'Invalid verification code');

        const user = await User.findOne({ email: email });
        user.verifiedEmail=true;
        await user.save();

        return successResponse(res, 200, {}, 'Email successfully verified');
    }catch(error){
        next(error);
    }
})

module.exports = router;