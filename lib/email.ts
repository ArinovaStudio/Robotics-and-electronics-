import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to, subject, html
        });

        return true;
    } catch (e){
        console.log(e);
        return false;
    }
}

export default sendEmail;
