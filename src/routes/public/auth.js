const express = require('express');
const bcrypt = require('bcrypt');
const failedResponse = require('../../helpers/failedResponse');
const successResponse = require('../../helpers/successResponse');
const OTP = require('../../models/OTP');
const { User } = require('../../models/User');
const Verification = require('../../models/Verification');
const UserSession = require('../../models/UserSession');
const Security = require('../../models/Security');
const { EmailVerificationOTP, UserAuthorizationOTP } = require('../../helpers/mailer');
const router = express.Router();

// Login Route
router.post("/", async(req, res, next) => {
    try{
        const { email, password, device, deviceInfo, productSub } = req.body;
        let user;
        user = await User.findOne({ email: email });
        if (!user) return failedResponse(res, 400, 'User with these details does not exist');

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return failedResponse(res, 400, 'Incorrect password');
            
        if (!user.verifiedEmail)
            return failedResponse(res, 400, 'Email not verified');

        let session = await UserSession.findOne({ deviceID: productSub });
        if (session){
            console.log("Can't add this session");
        }else{
            session = new UserSession({
                user: user._id,
                deviceID: productSub,
                deviceType: device,
                deviceInfo: deviceInfo,
                createdAt: new Date().toISOString()
            });
            await session.save();
        }

        const token = user.generateAuthToken();
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

        user = await User.findOne({ username: username });
        if (user) return failedResponse(res, 400, 'User with this username already exist');

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

        await new Verification({ user: user._id }).save();
        await new Security({ user: user._id }).save();

        const otp = Date.now().toString().slice(9, 13);
        console.log("NUM OTP: ", otp);
        const sent = await EmailVerificationOTP(email, otp);
        if (sent){
            await new OTP({
                otp: otp,
            }).save();
        }
        user.passwordText = undefined;
        return successResponse(res, 200, user, 'Verification code sent to your mail');

    }catch(error){
        next(error);
    }
})

//authorise user to change password
router.post("/authorize", async(req, res, next) => {
    try{
        const { email, device, deviceInfo, productSub } = req.body;
        let user;
        user = await User.findOne({ email: email });
        if (!user) return failedResponse(res, 400, 'User with these details does not exist');
        
        const otp = Date.now().toString().slice(9, 13);
        console.log("NUM OTP: ", otp);
        const sent = await UserAuthorizationOTP(email, otp);
        if (sent){
            await new OTP({
                otp: otp,
            }).save();
        }
        user.passwordText = undefined;
        return successResponse(res, 200, user, 'Authorization code sent to your mail');
    }catch(error){
        next(error);
    }
})

//Modify password
router.post("/newpassword", async(req, res, next) => {
    try {
    const { email, password, OTPcode } = req.body;
    const checkOTPCode = await OTP.findOne({ otp: String(OTPcode), email: email });
    if (!checkOTPCode) return failedResponse(res, 400, 'You were not authorised to access this page');
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);
    const update = {
        password: hashed_password,
        passwordText: password
    }
    User.findOneAndUpdate(
        { email: email },
        { $set: update },
        { new: true }
    )
    .then(updatedDocument => {
        return successResponse(res, 200, 'Password change Successful');
    })
    .catch(error => {
        return failedResponse(res, 400, 'An error occured');
    });
    }
    catch(error) {
        next(error);
    }
})

// OTP Router for verification
router.post("/otp-verification", async(req, res, next) => {
    try{
        const { email, otp } = req.body;
        console.log("BODY: ", req.body);

        const checkOTPCode = await OTP.findOne({ otp: String(otp), email: email });
        if (!checkOTPCode) return failedResponse(res, 400, 'Invalid verification code');

        const user = await User.findOne({ email: email });
        user.verifiedEmail=true;
        await user.save();

        return successResponse(res, 200, {}, 'Email successfully verified');
    }
    catch(error){
        next(error);
    }
})

// OTP Router for authorization
router.post("/otp-authorization", async(req, res, next) => {
    try{
        const { email, otp } = req.body;
        console.log("BODY: ", req.body);

        const checkOTPCode = await OTP.findOne({ otp: String(otp), email: email });
        if (!checkOTPCode) return failedResponse(res, 400, 'Invalid authorization code');

        return successResponse(res, 200, {}, 'Authorization confirmed, You can now change your password');
    }catch(error){
        next(error);
    }
})

module.exports = router;