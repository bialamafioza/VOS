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
const ticketCategoryId = '1302743323089309876'; // Kategoria do ticketów
const ticketLogChannelId = '1358020433374482453'; // <- Uzupełnij ID kanału logów

app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});

app.listen(port, () => {
  console.log(`\x1b[36m[ SERVER ]\x1b[0m \x1b[32m SH : http://localhost:${port} ✅\x1b[0m`);
});

const statusMessages = ["🎧 Biala Mafioza", "🎮 Biala Mafioza"];
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
    status: 'online',
  });
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
}

function heartbeat() {
  setInterval(() => {
    console.log(`\x1b[35m[ HEARTBEAT ]\x1b[0m Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

const verificationCodes = new Map();
const regulationAnswers = new Map();

const muteTimes = [
  { label: '5 minut', value: '300000' },
  { label: '15 minut', value: '900000' },
  { label: '1 godzina', value: '3600000' },
  { label: '6 godzin', value: '21600000' },
  { label: '24 godziny', value: '86400000' },
  { label: '7 dni', value: '604800000' }
];

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
        { label: '🛒 Sklep', description: 'Kup przedmiot z naszego sklepu.', value: 'shop_menu' },
        { label: '🛡️ Panel Moderatora', description: 'Dostępne tylko dla moderatorów.', value: 'moderator_panel' }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await message.channel.send({ embeds: [embed], components: [row] });
  }

  // Zamknięcie ticketu z powodem
  if (message.content.startsWith('!zamknij')) {
    const reason = message.content.split(' ').slice(1).join(' ') || 'Brak powodu';
    if (!message.channel.name.includes('-')) return;

    const logChannel = message.guild.channels.cache.get(ticketLogChannelId);
    const embed = new EmbedBuilder()
      .setTitle('📁 Ticket Zamknięty')
      .addFields(
        { name: 'Kanał:', value: message.channel.name, inline: true },
        { name: 'Zamknięty przez:', value: message.author.tag, inline: true },
        { name: 'Powód:', value: reason },
        { name: 'Data:', value: new Date().toLocaleString() }
      )
      .setColor('#e74c3c');

    if (logChannel) logChannel.send({ embeds: [embed] });

    await message.channel.send('🗑️ Kanał zostanie usunięty za 5 sekund...');
    setTimeout(() => message.channel.delete().catch(console.error), 5000);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  const { guild, user, values } = interaction;
  const selection = values[0];

  const createTicketChannel = async (namePrefix, descriptionEmbed) => {
    const channel = await guild.channels.create({
      name: `${namePrefix}-${user.username}`,
      type: ChannelType.GuildText,
      parent: ticketCategoryId,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: '1300816251706409020', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels] }
      ]
    });
    await channel.send({ embeds: [descriptionEmbed] });
    return channel;
  };
if (interaction.customId === 'ticket_menu' && interaction.values[0] === 'moderator_panel') {
  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (!member.roles.cache.has('1358020500000000000')) {
    return interaction.reply({ content: '❌ Nie masz dostępu do Panelu Moderatora.', ephemeral: true });
  }

  const modEmbed = new EmbedBuilder()
    .setTitle('🛡️ Panel Moderatora')
    .setDescription('Wybierz akcję, którą chcesz wykonać.')
    .setColor('#e74c3c');

  const modMenu = new StringSelectMenuBuilder()
    .setCustomId('mod_action')
    .setPlaceholder('🛠️ Wybierz akcję')
    .addOptions([
      { label: '🔇 Wycisz użytkownika', value: 'mute_user' },
      { label: '❌ Wyrzuć użytkownika', value: 'kick_user' },
      { label: '🔨 Zbanuj użytkownika', value: 'ban_user' }
    ]);

  const row = new ActionRowBuilder().addComponents(modMenu);
  await interaction.reply({ embeds: [modEmbed], components: [row], ephemeral: true });
}
client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'mod_action') return;

  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (!member.roles.cache.has('1358020500000000000')) {
    return interaction.reply({ content: '❌ Nie masz uprawnień.', ephemeral: true });
  }

  const action = interaction.values[0];
  await interaction.reply({ content: `✏️ Napisz wiadomość: \`@użytkownik powód\``, ephemeral: true });

  const filter = m => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

  collector.on('collect', async m => {
    const args = m.content.split(' ');
    const target = m.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'Brak powodu';

    if (!target) return m.reply('❌ Nie podano użytkownika.');

    if (action === 'mute_user') {
      await target.timeout(60 * 60 * 1000, reason);
      m.reply(`🔇 Użytkownik ${target} został wyciszony. Powód: ${reason}`);
    } else if (action === 'kick_user') {
      await target.kick(reason);
      m.reply(`❌ Użytkownik ${target} został wyrzucony. Powód: ${reason}`);
    } else if (action === 'ban_user') {
      await target.ban({ reason });
      m.reply(`🔨 Użytkownik ${target} został zbanowany. Powód: ${reason}`);
    }

    const logChannel = interaction.guild.channels.cache.get('1358020433374482453');
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle(`🛡️ Akcja Moderacyjna`)
        .addFields(
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Użytkownik', value: `${target.user.tag}`, inline: true },
          { name: 'Akcja', value: action.replace('_', ' '), inline: true },
          { name: 'Powód', value: reason },
          { name: 'Czas', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
        )
        .setColor('#e67e22');

      logChannel.send({ embeds: [logEmbed] });
    }
collector.on('collect', async m => {
  const args = m.content.split(' ');
  const target = m.mentions.members.first();
  const reason = args.slice(1).join(' ') || 'Brak powodu';

  if (!target) return m.reply('❌ Nie podano użytkownika.');

  const confirmEmbed = new EmbedBuilder()
    .setTitle('❗ Potwierdzenie akcji')
    .setDescription(`Czy na pewno chcesz wykonać akcję **${action.replace('_', ' ')}** na **${target.user.tag}**?\n\n**Powód:** ${reason}`)
    .setColor('#f39c12');

  const confirmButton = new ButtonBuilder()
    .setCustomId('confirm_action')
    .setLabel('✅ Potwierdź')
    .setStyle(ButtonStyle.Success);

  const cancelButton = new ButtonBuilder()
    .setCustomId('cancel_action')
    .setLabel('❌ Anuluj')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

  const confirmationMsg = await m.reply({ embeds: [confirmEmbed], components: [row] });

  const buttonFilter = i => i.user.id === interaction.user.id;
  const buttonCollector = confirmationMsg.createMessageComponentCollector({ filter: buttonFilter, time: 30000 });

  buttonCollector.on('collect', async i => {
    await i.deferUpdate();

    if (i.customId === 'cancel_action') {
      await m.reply('❌ Akcja została anulowana.');
      return;
    }

    try {
      if (action === 'mute_user') {
        await target.timeout(60 * 60 * 1000, reason);
        await m.reply(`🔇 Użytkownik ${target} został wyciszony. Powód: ${reason}`);
      } else if (action === 'kick_user') {
        await target.kick(reason);
        await m.reply(`❌ Użytkownik ${target} został wyrzucony. Powód: ${reason}`);
      } else if (action === 'ban_user') {
        await target.ban({ reason });
        await m.reply(`🔨 Użytkownik ${target} został zbanowany. Powód: ${reason}`);
      }

      const logChannel = interaction.guild.channels.cache.get('1358020433374482453');
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('🛡️ Akcja Moderacyjna')
          .addFields(
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            { name: 'Użytkownik', value: `${target.user.tag}`, inline: true },
            { name: 'Akcja', value: action.replace('_', ' '), inline: true },
            { name: 'Powód', value: reason },
            { name: 'Czas', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
          )
          .setColor('#e67e22');

        logChannel.send({ embeds: [logEmbed] });
      }
    } catch (err) {
      console.error(err);
      await m.reply('❌ Nie udało się wykonać akcji. Sprawdź uprawnienia bota.');
    }
 

  buttonCollector.on('end', collected => {
    confirmationMsg.edit({ components: [] }).catch(() => {});
const timeMenu = new StringSelectMenuBuilder()
  .setCustomId('mute_duration')
  .setPlaceholder('⏱️ Wybierz czas wyciszenia')
  .addOptions(muteTimes);

const row = new ActionRowBuilder().addComponents(timeMenu);



const timeCollector = m.channel.createMessageComponentCollector({
  filter: i => i.user.id === interaction.user.id,
  time: 15000
}

timeCollector.on('collect', async i => {
  await i.deferUpdate();
  const duration = parseInt(i.values[0]);

  await target.timeout(duration, reason);
  await m.channel.send(`🔇 ${target} został wyciszony na ${Math.floor(duration / 60000)} min. Powód: ${reason}`);

  if (interaction.customId === 'ticket_menu') {
    if (selection === 'create_ticket') {
      const embed = new EmbedBuilder()
        .setTitle('🎟️ Ticket - Pomoc')
        .setDescription('Opisz swój problem poniżej.')
        .setColor('#3498db');
      const channel = await createTicketChannel('ticket', embed);
      await interaction.reply({ content: `📩 Ticket utworzony: ${channel}`, ephemeral: true });
    }

    if (selection === 'verification_ticket') {
      const code = Math.floor(100000 + Math.random() * 900000);
      verificationCodes.set(user.id, code);
      const embed = new EmbedBuilder()
        .setTitle('🔍 Weryfikacja')
        .setDescription(`Wpisz poniższy kod: \`${code}\``)
        .setColor('#e67e22');
      const channel = await createTicketChannel('weryfikacja', embed);
      await interaction.reply({ content: `🔍 Kanał weryfikacji utworzony: ${channel}`, ephemeral: true });
    }

    if (selection === 'regulation_test') {
      const member = guild.members.cache.get(user.id);
      if (!member.roles.cache.has('1300816261655302216')) {
        return interaction.reply({ content: '❌ Musisz mieć rangę zweryfikowany.', ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setTitle('📜 Test Regulaminu')
        .setDescription('Odpowiedz na pytania. Pisz "Tak"/"Nie" z wielkiej litery.')
        .setColor('#1abc9c');
      const channel = await createTicketChannel('regulamin', embed);

      const questions = [
        { question: 'Czy można spamić?', answer: 'Nie' },
        { question: 'Czy można prosić o rangę?', answer: 'Nie' },
        { question: 'Czy można podszywać się pod administrację?', answer: 'Nie' },
        { question: 'Czy administracja może wejść na kanał prywatny w celu kontroli?', answer: 'Tak' }
      ];
      regulationAnswers.set(user.id, { questions, currentIndex: 0, correct: 0 });
      await channel.send(questions[0].question);
      await interaction.reply({ content: `📜 Test rozpoczęty: ${channel}`, ephemeral: true });
    }

    if (selection === 'shop_menu') {
      const shopEmbed = new EmbedBuilder()
        .setTitle('🛒 Sklep')
        .setDescription('Wybierz produkt do zakupu.')
        .setColor('#f1c40f');

      const shopMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_selection')
        .setPlaceholder('🛒 Wybierz przedmiot')
        .addOptions(shopItems);

      const row = new ActionRowBuilder().addComponents(shopMenu);
      await interaction.reply({ embeds: [shopEmbed], components: [row], ephemeral: true });
    }
  }

  if (interaction.customId === 'shop_selection') {
    const item = shopItems.find(i => i.value === selection);
    const embed = new EmbedBuilder()
      .setTitle(`🛒 Zakup - ${item.label}`)
      .setDescription(`Opis: ${item.description}`)
      .setColor('#f39c12');

    const channel = await createTicketChannel('zakup', embed);
    await interaction.reply({ content: `🛒 Kanał zakupu utworzony: ${channel}`, ephemeral: true });
  }
});

client.on('messageCreate', async message => {
  const { author, channel, content, guild } = message;

  if (channel.name.startsWith('weryfikacja-') && verificationCodes.has(author.id)) {
    const code = verificationCodes.get(author.id);
    if (content === code.toString()) {
      const role = guild.roles.cache.get('1300816261655302216');
      await guild.members.cache.get(author.id).roles.add(role);
      verificationCodes.delete(author.id);
      await channel.send(`✅ Zweryfikowano! Zamykam za 10 sek.`);
      setTimeout(() => channel.delete().catch(console.error), 10000);
    } else {
      await channel.send('❌ Kod niepoprawny. Spróbuj ponownie.');
    }
  }

  if (channel.name.startsWith('regulamin-') && regulationAnswers.has(author.id)) {
    const userData = regulationAnswers.get(author.id);
    const { questions, currentIndex } = userData;

    if (content === questions[currentIndex].answer) {
      userData.correct++;
    } else {
      await message.member.timeout(60000, 'Błędna odpowiedź w teście');
      await channel.send('❌ Test niezaliczony. Spróbuj ponownie później.');
      regulationAnswers.delete(author.id);
      return setTimeout(() => channel.delete().catch(console.error), 5000);
    }

    userData.currentIndex++;
    if (userData.currentIndex < questions.length) {
      await channel.send(questions[userData.currentIndex].question);
    } else {
      const passed = userData.correct === questions.length;
      const finalRole = guild.roles.cache.get('1300816260573040680');
      if (passed && finalRole) {
        await guild.members.cache.get(author.id).roles.add(finalRole);
        await channel.send('✅ Gratulacje! Test zaliczony.');
      } else {
        await channel.send('❌ Test niezaliczony.');
      }
      regulationAnswers.delete(author.id);
      setTimeout(() => channel.delete().catch(console.error), 10000);
    }
  }
});

client.login(process.env.TOKEN);
