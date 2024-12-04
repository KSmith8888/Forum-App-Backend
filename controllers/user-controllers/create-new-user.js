import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import { User } from "../../models/user-model.js";
import { PendingUser } from "../../models/pending-user-model.js";
import { wrapper } from "../wrapper.js";

export const createNewUser = wrapper(async (req, res) => {
    if (
        !req.body.username ||
        !req.body.password ||
        !req.body.terms ||
        !req.body.email
    ) {
        throw new Error(
            "Bad Request Error: Registration info was not provided"
        );
    }
    const usernameReg = new RegExp("^[a-zA-Z0-9_]+$");
    const reg = new RegExp("^[a-zA-Z0-9.:,?/_'!@-]+$");
    if (
        typeof req.body.username !== "string" ||
        typeof req.body.password !== "string" ||
        !reg.test(req.body.password) ||
        !usernameReg.test(req.body.username) ||
        req.body.password.length > 40
    ) {
        throw new Error(
            "Bad Request Error: Username or password not in proper format"
        );
    }
    if (
        typeof req.body.email !== "string" ||
        !reg.test(req.body.email) ||
        !req.body.email.includes("@") ||
        !req.body.email.includes(".")
    ) {
        throw new Error("Bad Request Error: Email not in proper format");
    }
    const bannedNames = ["deleted", "admin", "mod"];
    const displayName = req.body.username;
    const username = displayName.toLowerCase();
    if (bannedNames.includes(username)) {
        throw new Error("Bad Request Error: Banned username attempt");
    }
    const password = req.body.password;
    const requestedUsername = await User.findOne({
        username: String(username),
    });
    if (requestedUsername?.username) {
        throw new Error("Username unavailable Error: Duplicate entry");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(String(password), saltRounds);
    const userEmail = req.body.email;
    const requestedEmail = await User.findOne({
        email: String(userEmail),
    });
    if (requestedEmail?.email) {
        throw new Error("Email unavailable Error: Duplicate entry");
    }
    const code = Math.floor(Math.random() * (999999 - 100000) + 100000);
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    await transporter.sendMail({
        to: String(userEmail),
        subject: "Verify to complete 4em account registration",
        html: `
        <p>Hi ${String(displayName)},</p>
        <p>Use the code below to finish creating your 4em account</p>
        <p>Verification code: <strong>${code}</strong></p>
        <p>This code will expire if not used within 10 minutes</p>
        `,
    });
    const expiration = Date.now() + 600000;
    const dbPending = await PendingUser.create({
        username: String(username),
        password: String(hashedPassword),
        displayName: String(displayName),
        email: String(userEmail),
        verificationCode: code,
        codeExpiration: expiration,
    });
    res.status(201);
    res.json({
        message:
            "New account is pending, email must be verified to complete registration",
        pendingId: String(dbPending._id),
    });
});
