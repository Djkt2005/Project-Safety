const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = "ACb0857dd8b809c3622ff1dd455f2b93f0";
const TWILIO_AUTH_TOKEN = "329e4facb4de2a0e834b6b5c72cb023d";
const TWILIO_PHONE_NUMBER = "+19707106943";

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

let emergencyContacts = [];

app.post("/add-contact", (req, res) => {
    const { contact } = req.body;
    if (!contact) {
        return res.status(400).json({ error: "Contact number is required" });
    }
    emergencyContacts.push(contact);
    res.json({ message: "Contact added successfully", contacts: emergencyContacts });
});

app.post("/send-sos", async (req, res) => {
    const { location } = req.body;
    if (emergencyContacts.length === 0) {
        return res.status(400).json({ error: "No emergency contacts available" });
    }

    const messageBody = `SOS Alert! I am in danger. My location: ${location}`;

    try {
        await Promise.all(
            emergencyContacts.map((contact) =>
                client.messages.create({
                    body: messageBody,
                    from: TWILIO_PHONE_NUMBER,
                    to: contact
                })
            )
        );
        res.json({ message: "SOS alerts sent successfully" });
    } catch (error) {
        console.error("Twilio Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

