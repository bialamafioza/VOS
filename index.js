const { 
  Client, 
  GatewayIntentBits, 
  ActivityType, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  EmbedBuilder, 
  PermissionsBitField, 
  ChannelType 
} = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

// Tworzenie klienta Discorda
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
});

// Express - serwer HTTP
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Serwer działa na http://localhost:${port}`);
});

// Status bota
const statusMessages = ["🎧 Biala Mafioza", "🎮 Biala Mafioza"];
let currentStatusIndex = 0;

client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
});

function updateStatus() {
  const currentStatus = statusMessages[currentStatusIndex];

  client.user.setPresence({
    activities: [{ name: currentStatus, type: ActivityType.Playing }],
    status: 'online',
  });

  console.log(`🔄 Zaktualizowano status na: ${currentStatus}`);
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
}

function heartbeat() {
  setInterval(() => {
    console.log(`💓 Bot jest aktywny - ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

// Komenda !panel
client.on('messageCreate', async message => {
  if (message.content === '!panel') {
    const embed = new EmbedBuilder()
      .setTitle('📩 **Witaj!**')
      .setDescription('Wybierz opcję z listy.')
      .setColor('#3498db')
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/4712/4712031.png')
      .setFooter({ text: 'Panel' });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket_menu')
      .setPlaceholder('📩 W czym możemy pomóc?')
      .addOptions([
        { label: '📩 Ticket', description: 'Stwórz standardowy ticket.', value: 'create_ticket' },
        { label: '🔍 Weryfikacja', description: 'Zweryfikuj się podając kod.', value: 'verification_ticket' },
        { label: '📜 Regulamin', description: 'Odpowiedz na pytania regulaminowe.', value: 'regulation_test' },
        { label: '🛒 Sklep', description: 'Kup przedmioty w sklepie.', value: 'shop' }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// Obsługa interakcji
client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  const user = interaction.user;
  const guild = interaction.guild;

  if (interaction.customId === 'ticket_menu') {
    if (interaction.values[0] === 'create_ticket') {
      try {
        const ticketChannel = await guild.channels.create({
          name: `ticket-${user.username}`,
          type: ChannelType.GuildText,
          parent: '1302743323089309876',
          permissionOverwrites: [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: '1300816251706409020', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels] }
          ]
        });

        const ticketFormEmbed = new EmbedBuilder()
          .setTitle('🎟️ **Ticket - Potrzebuję Pomocy!** 🎟️')
          .setDescription('Proszę wypełnić poniższy formularz, abyśmy mogli Ci pomóc szybciej!')
          .setColor('#ffcc00');

        await ticketChannel.send({ embeds: [ticketFormEmbed] });
        await interaction.reply({ content: `📩 Ticket został utworzony: ${ticketChannel}`, ephemeral: true });
      } catch (error) {
        console.error('Błąd podczas tworzenia ticketu:', error);
        await interaction.reply({ content: '❌ Wystąpił błąd.', ephemeral: true });
      }
    }
  }
});

// Obsługa błędów
client.on('error', error => {
  console.error('❌ Błąd klienta:', error);
});

client.on('shardError', error => {
  console.error('❌ WebSocket error:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Logowanie bota
client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Błąd logowania: Sprawdź poprawność tokena!", err);
});
