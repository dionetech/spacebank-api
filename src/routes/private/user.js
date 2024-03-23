const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const failedResponse = require("../../helpers/failedResponse");
const successResponse = require('../../helpers/successResponse');
const Auth = require("../../middleware/auth");
const Security = require('../../models/Security');
const Transaction = require('../../models/Transaction');
const { User } = require("../../models/User");
const UserSession = require('../../models/UserSession');
const NodeCache = require("node-cache");
const myCache = new NodeCache();


// Get a user's details based on Id
// router.get('/:id', [Auth], async (req, res) => {
//     const { id } = req.params;
//     const user = await User.findById(id);
//     if (!user) return failedResponse(res, 400, 'User data error');

//     var userCredentials = myCache.get("userCredentials");
//     if (userCredentials == undefined){
//         const transactions = await Transaction.find({ user: id }).sort({ createdAt: -1 });
//         const security = await Security.findOne({ user: id });
//         const sessions = await UserSession.find({ user: id });

//         userCredentials = {
//             user,
//             transactions,
//             security,
//             sessions
//         }
//         myCache.set("userCredentials", userCredentials);
    
//         return successResponse(
//             res,
//             200,
//             userCredentials,
//             'Successfully fetched user'
//         );
//     }
//     return successResponse(
//         res,
//         200,
//         userCredentials,
//         'Successfully fetched user'
//     );
// });

// Get a user's details based on Id
router.get('/:id', [Auth], async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return failedResponse(res, 400, 'User data error');

    const transactions = await Transaction.find().sort({ createdAt: -1 });
    let userTransactions = [];
    const security = await Security.findOne({ user: user._id });
    const sessions = await UserSession.find({ user: user._id });

    transactions.map((tr) => {
        if (String(tr.sender).toLowerCase()===String(user.wallet.address).toLowerCase() || String(tr.receiver).toLowerCase()===String(user.wallet.address).toLowerCase()){
            userTransactions.push(tr);
        }
    })

    userCredentials = {
        user,
        transactions: userTransactions,
        security,
        sessions
    }

    return successResponse(
        res,
        200,
        userCredentials,
        'Successfully fetched user'
    );
});

// Get a user details based on username
router.get("/username/:username", [Auth], async(req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username: username });
    if (!user) return failedResponse(res, 400, 'User with this username does not exist');

    const transactions = await Transaction.find({ user: user._id }).sort({ createdAt: -1 });
    const security = await Security.findOne({ user: user._id });
    const sessions = await UserSession.find({ user: user._id });

    userCredentials = {
        user,
        transactions,
        security,
        sessions
    }

    return successResponse(
        res,
        200,
        userCredentials,
        'Successfully fetched user'
    );

})

// User profile setting route
router.put("/:id/profile-setting",[Auth], async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone, gender, dob, address } = req.body;
    const user = await User.findById(id);
    if (!user) return failedResponse(req, 400, "User does not exist");

    user.firstName = firstName;
    user.lastName = lastName;
    user.name = `${firstName} ${lastName}`;
    user.phone = phone;
    user.gender = gender;
    user.dob = new Date(dob).toISOString();
    user.address = address;

    await user.save();
    return successResponse(res, 200, {user}, 'User updated successfully');
})

// User security setting route
router.put("/:id/security-setting", [Auth], async (req, res) => {
    const { id } = req.params;
    const { securityQuestion, answer, securityNote } = req.body;
    const user = await User.findById(id);
    if (!user) return failedResponse(req, 400, "User does not exist");

    let security = await Security.findOne({ user: user._id });
    if (!security){
        security = new Security({ user: user._id });
    }

    security.security_question = {
        question: securityQuestion,
        answer: answer
    }
    security.security_note = securityNote;
    await security.save();

    return successResponse(res, 200, {user}, 'User updated successfully');
})

// User update password route
router.put("/:id/update-password", [Auth], async (req, res) => {
    const { id } = req.params;
    const { password, newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) return failedResponse(req, 400, "User does not exist");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return failedResponse(res, 400, 'Incorrect current password');

    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(newPassword, salt);

    user.password = hashed_password;
    user.passwordText = newPassword;

    await user.save();

    return successResponse(res, 200, {user}, 'Password updated successfully');
})

// User update transaction password route
router.put("/:id/update-transactionpassword", [Auth], async (req, res) => {
    const { id } = req.params;
    const { password, newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) return failedResponse(req, 400, "User does not exist");

    if (String(password)!==String(user.transactionPassword)) return failedResponse(req, 400, "Incorrect password");

    user.transactionPassword = newPassword;
    await user.save();

    return successResponse(res, 200, {user}, 'Transaction pin updated successfully');
})

// Verify identity route
router.post("/verify-identity", [Auth], async(req, res) => {
    const id = req.user._id;
    const { firstName, lastName, username, gender, pin } = req.body;

    const user = await User.findById(id);
    if (!user) return failedResponse(res, 400, 'User data error');

    const verification = await Verification.findOne({ user: id });
    const checkUsername = await User.findOne({ username: username });
    if (checkUsername) return failedResponse(res, 400, 'Username not available')

    user.username = username;
    user.transaction_password = pin;
    user.verified_identity = true;
    verification.details.first_name = firstName;
    verification.details.last_name = lastName;
    verification.details.gender = gender;

    await user.save();
    await verification.save();

    return successResponse(
        res,
        200,
        {
            user,
            verification
        },
        'User verification successful'
    );
})

module.exports = router;