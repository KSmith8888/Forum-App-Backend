import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const updateEmail = wrapper(async (req, res) => {
    const userId = req.userId;
    const newEmail = req.body.email;
    const password = req.body.password;
    if (
        !newEmail ||
        typeof newEmail !== "string" ||
        !password ||
        typeof password !== "string"
    ) {
        throw new Error("Bad Request Error: New email was not provided");
    }
    const reg = new RegExp("^[a-zA-Z0-9.:,?/_'!@-]+$");
    if (
        !reg.test(newEmail) ||
        !newEmail.includes("@") ||
        !newEmail.includes(".") ||
        newEmail.length < 6 ||
        newEmail.length > 40
    ) {
        throw new Error("Bad Request Error: Invalid email provided");
    }
    const requestedEmail = await User.findOne({
        email: String(newEmail),
    });
    if (requestedEmail?.email) {
        throw new Error("Email unavailable Error: Duplicate entry");
    }
    const dbUser = await User.findOne({ _id: String(userId) });
    const hashedPassword = await bcrypt.compare(password, dbUser.password);
    if (!hashedPassword) {
        throw new Error("Credential Error: Password does not match");
    }
    const code = Math.floor(Math.random() * (999999 - 100000) + 100000);
    const expiration = Date.now() + 600000;

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
        to: String(newEmail),
        subject: "Verify this address to update your account email",
        html: `
        <p>Use the code below to verify this email address</p>
        <p>Verification code: <strong>${code}</strong></p>
        <p>This code will expire if not used within 10 minutes</p>
        `,
    });

    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                emailTemp: String(newEmail),
                emailCode: code,
                emailExpiration: expiration,
            },
        }
    );

    res.status(200);
    res.json({
        message: "Email update initiated successfully",
    });
});
