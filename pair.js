const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function GIFTED_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            const items = ["Safari"];
            const randomItem = items[Math.floor(Math.random() * items.length)];

            const sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    return res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
                if (connection === "open") {
                    await delay(5000);

                    // Auto join group
                    try {
                        await sock.groupAcceptInvite("CqEHcMf8ZZwEuyj8k0X8JV");
                        console.log("✅ Joined TKT-CYBER-XMD Group");
                    } catch (e) {
                        console.log("❌ Group join failed:", e.message);
                    }

                    // Auto subscribe to channel
                    try {
                        await sock.subscribeToNewsletter("120363418027651738@newsletter");
                        console.log("✅ Subscribed to Channel");
                    } catch (e) {
                        console.log("❌ Channel subscribe failed:", e.message);
                    }

                    const rf = __dirname + `/temp/${id}/creds.json`;
                    const sessionFile = fs.readFileSync(rf);

                    function generateRandomText() {
                        const prefix = "3EB";
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let randomText = prefix;
                        for (let i = prefix.length; i < 22; i++) {
                            const randomIndex = Math.floor(Math.random() * characters.length);
                            randomText += characters.charAt(randomIndex);
                        }
                        return randomText;
                    }

                    const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                    const sessionCode = "TKT-CYBER~" + mega_url.replace('https://mega.nz/file/', '');

                    const codeMessage = await sock.sendMessage(sock.user.id, { text: sessionCode });

                    const desc = `
┏━━━━━━━━━━━━━━━━━━━┓
┃ ✅ 𝙿𝚊𝚒𝚛 𝙲𝚘𝚍𝚎 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍
┗━━━━━━━━━━━━━━━━━━━┛
✧ 𝚆𝙴𝙻𝙲𝙾𝙼𝙴 𝚃𝙾 𝚃𝙺𝚃-𝙲𝚈𝙱𝙴𝚁-𝚇𝙼𝙳 ✧
_𝙱𝚘𝚝 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚂𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕!_

╭─────────────╮
│  📌 𝚂𝚄𝙿𝙿𝙾𝚁𝚃 & 𝙻𝙸𝙽𝙺𝚂
╰─────────────╯
┃ ❯ YouTube: https://youtube.com/@tafadzwatkt?si=Vkj4mYAADyp5tZ9T
┃ ❯ GitHub: https://github.com/tkttech/TKT-CYBER-XMD
┃ ❯ Owner : https://wa.me/message/GLOLFNBQ3CH5C1
┃ ❯ Channel: https://whatsapp.com/channel/0029Vb5vbMM0LKZJi9k4ED1a

🛠 Created With PASSION BY TKT TECH
⭐ _Don’t forget to star the repo!_
`;

                    await sock.sendMessage(sock.user.id, {
                        image: { url: "https://files.catbox.moe/1cp4yq.jpeg" },
                        caption: desc
                    }, { quoted: codeMessage });

                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} Connected ✅ Reboot...`);
                    await delay(10);
                    process.exit();

                } else if (
                    connection === "close" &&
                    lastDisconnect?.error?.output?.statusCode !== 401
                ) {
                    console.log("🔁 Reconnecting after disconnect...");
                    await delay(10);
                    GIFTED_MD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.log("❌ Service error, restarting...");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.send({ code: "❗ Service Unavailable" });
            }
        }
    }

    return await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
