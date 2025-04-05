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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});

app.listen(port, () => {
  console.log(`\x1b[36m[ SERVER ]\x1b[0m \x1b[32m SH : http://localhost:${port} ✅\x1b[0m`);
});

const statusMessages = ["🎧 Biala Mafioza", "🎮 Biala Mafioza"];
const statusType = 'online'; 
let currentStatusIndex = 0;

client.once('ready', async () => {
  console.log(`Zalogowano jako ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
});

function updateStatus() {
  const currentStatus = statusMessages[currentStatusIndex];

  client.user.setPresence({
    activities: [{ name: currentStatus, type: ActivityType.Playing }],
    status: statusType,
  });

  console.log(`\x1b[33m[ STATUS ]\x1b[0m Updated status to: ${currentStatus} (${statusType})`);
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
}

function heartbeat() {
  setInterval(() => {
    console.log(`\x1b[35m[ HEARTBEAT ]\x1b[0m Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

const verificationCodes = new Map();
const regulationAnswers = new Map();
const LOG_CHANNEL_ID = '1358020433374482453';

async function sendLog(guild, content) {
  const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (logChannel) {
    logChannel.send(`📘 ${content}`);
  } else {
    console.warn('[ WARN ] Kanał logów nie został znaleziony.');
  }
}

const shopItems = [
  { label: '💎 VIP', description: 'Kup specjalną rangę VIP.', value: 'buy_vip' },
  { label: '🔑 Klucz Premium', description: 'Uzyskaj dostęp do ekskluzywnych funkcji.', value: 'buy_premium_key' },
  { label: '🛡️ Ochrona Konta', description: 'Dodatkowe zabezpieczenia konta.', value: 'buy_account_protection' }
];

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
        { label: '🛒 Sklep', description: 'Kup przedmiot z naszego sklepu.', value: 'shop_menu' }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  const user = interaction.user;
  const guild = interaction.guild;

  if (interaction.customId === 'ticket_menu') {
    if (interaction.values[0] === 'create_ticket') {
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
        .setDescription('Proszę wypełnić poniższy formularz...')
        .setColor('#ffcc00');

      await ticketChannel.send({ embeds: [ticketFormEmbed] });
      await interaction.reply({ content: `📩 Ticket utworzony: ${ticketChannel}`, ephemeral: true });
      await sendLog(guild, `🎟️ Ticket utworzony przez ${user.tag}`);
    }

    if (interaction.values[0] === 'verification_ticket') {
      const code = Math.floor(10000000 + Math.random() * 90000000);
      verificationCodes.set(user.id, code);

      const ticketChannel = await guild.channels.create({
        name: `weryfikacja-${user.username}`,
        type: ChannelType.GuildText,
        parent: '1302743323089309876',
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: '1300816251706409020', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels] }
        ]
      });

      const verificationEmbed = new EmbedBuilder()
        .setTitle('🔍 **Weryfikacja**')
        .setDescription(`Twój kod: \`${code}\``)
        .setColor('#ff5733');

      await ticketChannel.send({ embeds: [verificationEmbed] });
      await interaction.reply({ content: `🔍 Kanał weryfikacyjny: ${ticketChannel}`, ephemeral: true });
      await sendLog(guild, `🔍 Weryfikacja rozpoczęta przez ${user.tag} (kod: ${code})`);
    }

    if (interaction.values[0] === 'regulation_test') {
      const member = guild.members.cache.get(user.id);
      if (!member.roles.cache.has('1300816261655302216')) {
        await interaction.reply({ content: '❌ Musisz mieć rangę zweryfikowany.', ephemeral: true });
        return;
      }

      const ticketChannel = await guild.channels.create({
        name: `regulamin-${user.username}`,
        type: ChannelType.GuildText,
        parent: '1302743323089309876',
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: '1300816251706409020', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels] }
        ]
      });

      const questions = [
        { question: 'Czy można spamić?', answer: 'Nie' },
        { question: 'Czy można prosić o rangę?', answer: 'Nie' },
        { question: 'Czy można podszywać się pod administrację?', answer: 'Nie' },
        { question: 'Czy administracja może wejść na kanał prywatny?', answer: 'Tak' }
      ];

      regulationAnswers.set(user.id, { questions, currentIndex: 0, correct: 0 });

      await ticketChannel.send('📜 Test regulaminu. Pisz odpowiedzi: Tak/Nie.');
      await ticketChannel.send(questions[0].question);
      await interaction.reply({ content: `📜 Kanał testowy: ${ticketChannel}`, ephemeral: true });
      await sendLog(guild, `📜 Test regulaminowy rozpoczęty przez ${user.tag}`);
    }

    if (interaction.values[0] === 'shop_menu') {
      const shopEmbed = new EmbedBuilder()
        .setTitle('🛒 Sklep')
        .setDescription('Wybierz produkt do zakupu.')
        .setColor('#2ecc71');

      const shopMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_selection')
        .setPlaceholder('🛒 Wybierz przedmiot')
        .addOptions(shopItems);

      const row = new ActionRowBuilder().addComponents(shopMenu);
      await interaction.reply({ embeds: [shopEmbed], components: [row], ephemeral: true });
    }
  }

  if (interaction.customId === 'shop_selection') {
    const selected = shopItems.find(item => item.value === interaction.values[0]);
    if (!selected) return;

    const shopChannel = await interaction.guild.channels.create({
      name: `zakup-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: '1302743323089309876',
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: '1300816251706409020', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels] }
      ]
    });

    const purchaseEmbed = new EmbedBuilder()
      .setTitle(`🛒 Zakup - ${selected.label}`)
      .setDescription(selected.description)
      .setColor('#f1c40f');

    await shopChannel.send({ embeds: [purchaseEmbed] });
    await interaction.reply({ content: `🛒 Kanał zakupu: ${shopChannel}`, ephemeral: true });
    await sendLog(interaction.guild, `🛒 Zakup rozpoczęty przez ${interaction.user.tag}: ${selected.label}`);
  }
});

client.login(process.env.TOKEN);
