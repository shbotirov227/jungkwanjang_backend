import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/send-message", async (req, res) => {
    const { firstName, lastName, phone, message } = req.body.formData;

    if (!firstName || !lastName || !phone || !message) {
        return res.status(400).json({ ok: false, error: "Barcha maydonlar to'ldirilishi kerak." });
    }

    const botToken = process.env.BOT_TOKEN;
    const userChatId = process.env.USER_CHAT_ID;
    const adminChatId = process.env.ADMIN_CHAT_ID;
    const groupChatId = process.env.GROUP_CHAT_ID;

    const telegramMessage = `
    🧾 Yangi ariza:

👤 F.I.Sh: ${firstName} ${lastName}
📅 Sana: ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}
📞 Telefon: ${phone}
💬 Xabar: ${message}
`;

    const sendToTelegram = async (chatId) => {
        return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: telegramMessage }),
        }).then(res => res.json());
    };

    try {
        // Asynchronous calls for all destinations using Promise.allSettled
        const results = await Promise.allSettled([
            sendToTelegram(userChatId),
            sendToTelegram(groupChatId),
            sendToTelegram(adminChatId),
        ]);

        // Check if any of the promises were rejected
        const allFailed = results.every(result => result.status === "rejected");

        if (allFailed) {
            // If all promises failed, return an error response
            console.error("❌ Barcha xabarlar yuborilmadi:", results);
            return res.status(500).json({ ok: false, error: "Hammasi xato bo'ldi.", details: results });
        }

        // If at least one promise succeeded, return success
        console.log("✅ Ba'zi xabarlar muvaffaqiyatli yuborildi.");
        res.json({ ok: true, result: results });
    } catch (error) {
        console.error("❌ Server xatosi:", error.message);
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
});
