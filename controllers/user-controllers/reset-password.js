import nodemailer from "nodemailer";

import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const resetPassword = wrapper(async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    if (
        !username ||
        !email ||
        typeof username !== "string" ||
        typeof email !== "string"
    ) {
        throw new Error(
            "Bad Request Error: Username or email was not provided"
        );
    }
    const dbUser = await User.findOne({
        username: String(username.toLowerCase()),
    });
    if (!dbUser) {
        throw new Error("Credential Error: No user found with that username");
    }
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const code = Math.floor(Math.random() * (999999 - 100000) + 100000);
    const expiration = Date.now() + 600000;
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                resetCode: code,
                resetExpiration: expiration,
            },
        }
    );
    await transporter.sendMail({
        to: String(dbUser.email),
        subject: "Reset your 4em account password",
        html: `
        <p>Use the code below to reset your password</p>
        <p>Verification code: <strong>${code}</strong></p>
        <p>This code will expire if not used within 10 minutes</p>
        <br>
        <p>If you did not request this, please contact the admins</p>
        `,
    });
    res.status(200);
    res.json({
        message: "Password reset initiated successfully",
        username: String(dbUser.username),
    });
});
