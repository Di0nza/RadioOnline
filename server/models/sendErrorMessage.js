const router = require("express").Router();
const Token = require("./token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const generateEmailTemplate = (url, title, errorMessage) => {
    const buttonText = "Перейти";
    const emailHtml = `
        <html lang="RU">
            <head>
             <title>Возникла ошибка с радио ${title}</title>
            </head>
            <body style="background-color: #f1f1f1;text-align: center;width: 700px;padding: 0">
             <div style=" margin: 0 auto; padding: 3px 3px 20px 3px;">
              <div style="text-align: center; margin-top: 20px;">
               <p style=" color: #000000;font-size: 16px;"><b>Текст ошибки с радио "${title}": </b> ${errorMessage}</p>
               <p style="color: #000000;font-size: 14px;margin: 7px 0">Перейти на страницу администратора</p>
               <a href="${url}" style="background-color: #06B5AE;font-weight: bold;font-size: 14px; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">${buttonText}</a>
             </div>
            </div>
            </body>
        </html>
    `;
    return emailHtml;
};

router.post("/", async (req, res) => {
    try {
        const token = await new Token({
            token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const url = `http://localhost:3000/admin/${token.token}`;
        const {title, errorMessage} = req.body;
        const emailHtml = generateEmailTemplate(url, title, errorMessage);

        await sendEmail(process.env.ADMIN, `Radio Online | Возникла ошибка с радио ${title}`, emailHtml);

        return res.status(201).send({ message: "Письмо с ошибкой отправленно" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Внутренняя ошибка сервера" });
    }
});

module.exports = router;
