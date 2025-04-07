const { 
  Client, 
  GatewayIntentBits, 
  ActivityType, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  EmbedBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ChannelType // Dodaj ten import
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
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`\x1b[36m[ SERVER ]\x1b[0m \x1b[32m SH : http://localhost:${port} ✅\x1b[0m`);
});

const statusMessages = ["🎧 Biala Mafioza", "🎮 Biala Mafioza"];
const statusType = 'online'; 
let currentStatusIndex = 0;

const logChannelId = '1358020433374482453';
const moderatorRoleId = '1300816251706409020'; // Podmień na prawdziwe ID rangi moderatora

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

client.on('messageCreate', async message => {
  if (message.content === '!panel') {
    const embed = new EmbedBuilder()
      .setTitle('📩 **Panel główny**')
      .setDescription('Wybierz jedną z opcji poniżej, aby rozpocząć.')
      .setColor('#3498db')
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/4712/4712031.png')
      .setFooter({ text: 'Panel serwera' });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket_menu')
      .setPlaceholder('📩 Co chcesz zrobić?')
      .addOptions([
        { label: '📩 Ticket', description: 'Stwórz ticket pomocy.', value: 'create_ticket' },
        { label: '🔍 Weryfikacja', description: 'Zweryfikuj się kodem.', value: 'verification_ticket' },
        { label: '📜 Regulamin', description: 'Rozwiąż quiz z regulaminu.', value: 'regulation_test' },
        { label: '🛒 Sklep', description: 'Kup przedmiot w sklepie.', value: 'shop_menu' },
        { label: '🛠️ Panel moderatora', description: 'Dostęp tylko dla moderatorów.', value: 'mod_panel' }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'close_ticket') {
      await handleCloseTicket(interaction);
    }
  } else if (interaction.isStringSelectMenu()) {
    await handleSelectMenu(interaction);
  }
});

async function handleCloseTicket(interaction) {
  const user = interaction.user;
  const channel = interaction.channel;
  const ticketOwner = channel.name.split('-')[1];  
  const reason = `Zamknięty przez ${user.tag} (${user.id}) o ${new Date().toLocaleString()}`;
  const logChannel = interaction.guild.channels.cache.get(logChannelId); 

  await channel.send(`📪 Ticket zamknięty przez ${user.tag}. Kanał zostanie usunięty za 5 sekund.`);
  
  if (logChannel) {
    logChannel.send(`🗂️ Ticket #${channel.name} zamknięty przez ${user.tag}. Dotyczy użytkownika: ${ticketOwner}.\n📅 **Data zamknięcia:** ${new Date().toLocaleString()}\n**Powód:** ${reason}`);
  }

  setTimeout(() => {
    channel.delete(reason).catch(console.error);
  }, 5000);
}

async function createTicket(interaction) {
  const ticketChannel = await interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
    type: ChannelType.GuildText, // Poprawione
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: ['VIEW_CHANNEL'],
      },
      {
        id: interaction.user.id,
        allow: ['VIEW_CHANNEL'],
      },
    ],
  });

  const closeButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Zamknij Ticket')
      .setStyle(ButtonStyle.Danger)
  );

  const ticketEmbed = new EmbedBuilder()
    .setTitle('🎫 Ticket otwarty')
    .setDescription('Zespół zaraz się Tobą zajmie.\n\nKliknij poniżej, aby zamknąć ticket.')
    .setColor('#3498db');

  await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [ticketEmbed], components: [closeButton] });
  await interaction.reply({ content: `✅ Ticket został otwarty: ${ticketChannel}`, ephemeral: true });
}

async function handleVerification(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🔍 **Weryfikacja**')
    .setDescription('Wpisz kod weryfikacyjny, aby potwierdzić swoją tożsamość.')
    .setColor('#3498db');

  await interaction.reply({ embeds: [embed], ephemeral: true });
  await interaction.user.send('🔑 Proszę podać swój kod weryfikacyjny.');
}

async function handleRegulation(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('📜 **Regulamin**')
    .setDescription('Aby kontynuować, odpowiedz na pytania związane z regulaminem.')
    .setColor('#3498db');

  await interaction.reply({ embeds: [embed], ephemeral: true });
  await interaction.user.send('📋 Proszę odpowiedzieć na pytania regulaminowe:\n\n1. Czy zaakceptowałeś nasz regulamin? (Tak/Nie)');
}

async function handleModPanel(interaction) {
  if (!interaction.member.roles.cache.has(moderatorRoleId)) {
    return interaction.reply({ content: '❌ Nie masz dostępu do panelu moderatora.', ephemeral: true });
  }

  const modMenu = new StringSelectMenuBuilder()
    .setCustomId('mod_action_menu')
    .setPlaceholder('🛠️ Wybierz akcję moderacyjną')
    .addOptions([
      { label: '🔇 Wycisz użytkownika', value: 'mute_user' },
      { label: '👢 Wyrzuć użytkownika', value: 'kick_user' },
      { label: '⛔ Zbanuj użytkownika', value: 'ban_user' }
    ]);

  const row = new ActionRowBuilder().addComponents(modMenu);
  await interaction.reply({ content: '🛠️ Panel moderatora:', components: [row], ephemeral: true });
}

client.login(process.env.TOKEN);
