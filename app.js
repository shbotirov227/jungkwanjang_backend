import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

// `dotenv` faylini yuklash
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Telegramga xabar yuborish funksiyasi
app.post("/send-message", async (req, res) => {
    const { name, surname, phone, message } = req.body;

    const chatId = process.env.TELEGRAM_CHAT_ID;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const telegramMessage = `
        Foydalanuvchi Ma'lumotlari:
        Ism: ${name}
        Familiya: ${surname}
        Telefon: ${phone}
        Xabar: ${message}
    `;

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: telegramMessage,
                parse_mode: "HTML",
            }),
        });

        const data = await response.json();

        if (data.ok) {
            res.status(200).json({ message: "Xabar yuborildi!" });
        } else {
            res.status(500).json({ error: "Xabar yuborishda xato!" });
        }
    } catch (error) {
        res.status(500).json({ error: "Xabar yuborishda xato!" });
    }
});

// Serverni ishga tushirish
app.listen(port, () => {
    console.log(`Server ${port}-portda ishlamoqda`);
});
