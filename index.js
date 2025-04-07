const { 
  Client, 
  GatewayIntentBits, 
  ActivityType, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  EmbedBuilder, 
  PermissionsBitField, 
  ChannelType, 
  ButtonBuilder, 
  ButtonStyle 
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

const verificationCodes = new Map();
const regulationAnswers = new Map();

const logChannelId = '1358020433374482453';

const shopItems = [
  { label: '💎 VIP', description: 'Kup specjalną rangę VIP.', value: 'buy_vip' },
  { label: '🔑 Klucz Premium', description: 'Uzyskaj dostęp do ekskluzywnych funkcji.', value: 'buy_premium_key' },
  { label: '🛡️ Ochrona Konta', description: 'Dodatkowe zabezpieczenia konta.', value: 'buy_account_protection' }
];

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
  if (!interaction.isButton()) return;

  if (interaction.customId === 'close_ticket') {
    const user = interaction.user;
    const channel = interaction.channel;
    const guild = interaction.guild;
    
    const ticketOwner = channel.name.split('-')[1];  // Przyjmujemy, że nazwa kanału to np. "ticket-username"
    
    const reason = `Zamknięty przez ${user.tag} (${user.id}) o ${new Date().toLocaleString()}`;
    const logChannel = guild.channels.cache.get('1358020433374482453'); // Twój kanał logów

    await channel.send(`📪 Ticket zamknięty przez ${user.tag}. Kanał zostanie usunięty za 5 sekund.`);
    
    if (logChannel) {
      logChannel.send(`🗂️ Ticket #${channel.name} zamknięty przez ${user.tag}. Dotyczy użytkownika: ${ticketOwner}.\n📅 **Data zamknięcia:** ${new Date().toLocaleString()}\n**Powód:** ${reason}`);
    }

    setTimeout(() => {
      channel.delete(reason).catch(console.error);
    }, 5000);
  }
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

      await ticketChannel.send({ content: `<@${user.id}>`, embeds: [ticketEmbed], components: [closeButton] });

      const logEmbed = new EmbedBuilder()
        .setTitle('📂 Ticket utworzony')
        .setDescription(`Użytkownik ${user.tag} otworzył ticket.`)
        .addFields(
          { name: 'ID użytkownika', value: user.id, inline: true },
          { name: 'Kanał', value: `<#${ticketChannel.id}>`, inline: true },
          { name: 'Czas', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setColor('#2ecc71');

      const logChannel = guild.channels.cache.get(logChannelId);
      if (logChannel) logChannel.send({ embeds: [logEmbed] });

      await interaction.reply({ content: `✅ Ticket został otwarty: ${ticketChannel}`, ephemeral: true });
    }
  }
});
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'close_ticket') {
    await interaction.reply({
      content: '🛑 Czy na pewno chcesz zamknąć ticket?',
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_close')
            .setLabel('Tak, zamknij')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancel_close')
            .setLabel('Anuluj')
            .setStyle(ButtonStyle.Secondary)
        )
      ],
      ephemeral: true
    });
  }

  if (interaction.customId === 'confirm_close') {
    const reason = 'Zamknięto przez użytkownika'; // Można tu zrobić prompt na własny powód

    const closedEmbed = new EmbedBuilder()
      .setTitle('🎟️ Ticket zamknięty')
      .addFields(
        { name: 'Zamknięty przez', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Czas', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: 'Powód', value: reason }
      )
      .setColor('#e74c3c');

    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    if (logChannel) await logChannel.send({ embeds: [closedEmbed] });

    const channel = interaction.channel;
    setTimeout(() => {
      channel.delete().catch(err => console.error('Błąd przy zamykaniu kanału:', err));
    }, 5000);

    await interaction.update({ content: '✅ Ticket zostanie zamknięty za 5 sekund.', components: [] });
  }

  if (interaction.customId === 'cancel_close') {
    await interaction.update({ content: '❎ Zamknięcie ticketu anulowane.', components: [] });
  }
});
const moderatorRoleId = '1300816251706409020'; // Podmień na prawdziwe ID rangi moderatora

client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'ticket_menu' && interaction.values[0] === 'mod_panel') {
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
});
client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'mod_action_menu') return;

  const selected = interaction.values[0];
  const modActionName = {
    mute_user: 'Wycisz',
    kick_user: 'Wyrzuć',
    ban_user: 'Zbanuj'
  };

  await interaction.reply({
    content: `🔧 Podaj ID użytkownika do akcji: ${modActionName[selected]}\n(Na razie system testowy - brak działania)`,
    ephemeral: true
  });

  // Tutaj można by rozbudować o modal lub kolejną interakcję do wykonania prawdziwej akcji.
});
client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'ticket_menu' && interaction.values[0] === 'verification_ticket') {
    return interaction.reply({ content: '🔍 Weryfikacja nieaktywna (placeholder)', ephemeral: true });
  }

  if (interaction.customId === 'ticket_menu' && interaction.values[0] === 'regulation_test') {
    return interaction.reply({ content: '📜 Test regulaminu nieaktywny (placeholder)', ephemeral: true });
  }
});
client.login(process.env.TOKEN);
