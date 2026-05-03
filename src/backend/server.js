import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
} from "discord.js";

const app = express();

app.use(cors());
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

function cleanChannelName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

async function createDiscordChannels(groupName) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const guild = await client.guilds.fetch(guildId);

  const safeName = cleanChannelName(groupName);

  const category = await guild.channels.create({
    name: safeName,
    type: ChannelType.GuildCategory,
  });

  const textChannel = await guild.channels.create({
    name: `${safeName}-chat`,
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `Canal de estudio para ${groupName}`,
  });

  const voiceChannel = await guild.channels.create({
    name: `${safeName}-voz`,
    type: ChannelType.GuildVoice,
    parent: category.id,
  });

  return {
    categoryId: category.id,
    textChannelId: textChannel.id,
    voiceChannelId: voiceChannel.id,
    textChannelUrl: `https://discord.com/channels/${guild.id}/${textChannel.id}`,
  };
}

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend Discord funcionando" });
});

app.post("/create-discord-group", async (req, res) => {
  try {
    const { groupName } = req.body;

    if (!groupName) {
      return res.status(400).json({
        ok: false,
        error: "Falta groupName",
      });
    }

    const result = await createDiscordChannels(groupName);

    res.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Error creando canales:", error);
    res.status(500).json({
      ok: false,
      error: "No se pudieron crear los canales de Discord",
    });
  }
});

client.once("ready", () => {
  console.log(`Bot conectado como ${client.user.tag}`);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Backend corriendo en http://localhost:${port}`);
  });
});

client.login(process.env.DISCORD_TOKEN);