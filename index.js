
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

client.on('messageCreate', async message => {
  if (message.content === '!panel') {
    const embed = new EmbedBuilder()
      .setTitle('📩 **Witaj!**')
      .setDescription('Wybierz opcję z listy, aby utworzyć ticket.')
      .setColor('#3498db')
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/4712/4712031.png')
      .setFooter({ text: 'Ticket Panel' });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket_menu')
      .setPlaceholder('📩 W czym możemy pomóc?')
      .addOptions([
        {
          label: '📩 Ticket',
          description: 'Stwórz standardowy ticket.',
          value: 'create_ticket'
        },
        {
          label: '🛠️ Stwórz własny',
          description: 'Podaj własny powód zgłoszenia.',
          value: 'custom_ticket'
        },
        {
          label: '🔍 Weryfikacja',
          description: 'Zweryfikuj się podając kod.',
          value: 'verification_ticket'
        },
        {
          label: '📜 Test Regulaminu',
          description: 'Odpowiedz na pytania regulaminowe.',
          value: 'regulation_test'
        }
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
      try {
        const ticketChannel = await guild.channels.create({
          name: `ticket-${user.username}`,
          type: ChannelType.GuildText,
          parent: '1302743323089309876', // ID kategorii, możesz zmienić to
          permissionOverwrites: [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: '1300816251706409020', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels] }
          ]
        });

        const ticketFormEmbed = new EmbedBuilder()
          .setTitle('🎟️ **Ticket - Potrzebuję Pomocy!** 🎟️')
          .setDescription('Proszę wypełnić poniższy formularz, abyśmy mogli Ci pomóc szybciej!')
          .addFields(
            { name: '🔧 Problem:', value: '👉 **Opis:**\nNapisz jak najdokładniej, co się dzieje! Im więcej szczegółów, tym szybciej pomożemy!' },
            { name: '📅 Kiedy wystąpił problem?', value: '📌 **Data/Godzina:**\nPrzypomnij sobie, kiedy to się stało. 🕒' }
          )
          .setColor('#ffcc00')
          .setFooter({ text: 'Prosimy o dokładne informacje!' });

        await ticketChannel.send({ embeds: [ticketFormEmbed] });
        await interaction.reply({ content: `📩 Ticket został utworzony: ${ticketChannel}`, ephemeral: true });
      } catch (error) {
        console.error('Błąd podczas tworzenia kanału:', error);
        await interaction.reply({ content: '❌ Wystąpił błąd podczas tworzenia ticketu.', ephemeral: true });
      }
    }
    if (interaction.values[0] === 'verification_ticket') {
      try {
        const code = Math.floor(10000000 + Math.random() * 90000000);
        verificationCodes.set(user.id, code);

        const ticketChannel = await guild.channels.create({
          name: `weryfikacja-${user.username}`,
          type: ChannelType.GuildText,
          parent: '1302743323089309876', // ID kategorii, możesz zmienić to
          permissionOverwrites: [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: '1300816251706409020', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels] }
          ]
        });

        const verificationEmbed = new EmbedBuilder()
          .setTitle('🔍 **Weryfikacja**')
          .setDescription('Aby zweryfikować swoją tożsamość, wpisz poniższy kod w wiadomości na tym kanale:')
          .addFields({ name: '🆔 Kod Weryfikacyjny:', value: `\`${code}\`` })
          .setColor('#ff5733')
          .setFooter({ text: 'Prosimy o przepisanie kodu dokładnie!' });

        await ticketChannel.send({ embeds: [verificationEmbed] });
        await interaction.reply({ content: `🔍 Ticket weryfikacyjny został utworzony: ${ticketChannel}`, ephemeral: true });
      } catch (error) {
        console.error('Błąd podczas tworzenia kanału:', error);
        await interaction.reply({ content: '❌ Wystąpił błąd podczas tworzenia ticketu.', ephemeral: true });
      }
    }
    if (interaction.values[0] === 'regulation_test') {
      try {
        const member = guild.members.cache.get(user.id);
        if (member.roles.cache.has('1300816261655302216')) {
          await member.roles.remove('1300816261655302216');
        }

        const ticketChannel = await guild.channels.create({
          name: `regulamin-${user.username}`,
          type: ChannelType.GuildText,
          parent: '1302743323089309876', // ID kategorii, możesz zmienić to
          permissionOverwrites: [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: '1300816251706409020', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels] }
          ]
        });

        const questions = [
          { question: 'Czy można spamić? ', answer: 'Nie' , 'nie' },
          { question: 'Czy można prosić o rangę?', answer: 'Nie' },
          { question: 'Czy można podszywać się pod administrację?', answer: 'Nie', 'nie' },
          { question: 'Czy Administracja ma prawo wejść na kanał prywatny bądź Max (x) w celu skontrolowania graczy?', answer: 'Tak', 'tak'  }
        ];

        regulationAnswers.set(user.id, { questions, currentIndex: 0, correct: 0 });

        await ticketChannel.send(`📜 **Regulamin** - Odpowiedz na pytania poprawnie, aby uzyskać rangę.`);
        await ticketChannel.send(questions[0].question);

        await interaction.reply({ content: `📜 Test regulaminu został rozpoczęty: ${ticketChannel}`, ephemeral: true });
      } catch (error) {
        console.error('Błąd podczas tworzenia kanału:', error);
        await interaction.reply({ content: '❌ Wystąpił błąd podczas tworzenia ticketu.', ephemeral: true });
      }
    }
  }
});

client.on('messageCreate', async message => {
  if (message.channel.name.startsWith('weryfikacja-') && verificationCodes.has(message.author.id)) {
    const correctCode = verificationCodes.get(message.author.id);
    if (message.content === correctCode.toString()) {
      const role = message.guild.roles.cache.get('1300816261655302216');
      if (role) {
        const member = message.guild.members.cache.get(message.author.id);
        if (member) {
          await member.roles.add(role);
          await message.channel.send(`✅ Gratulacje ${message.author}, pomyślnie zweryfikowano! Kanał zostanie usunięty za 10 sekund.`);
          verificationCodes.delete(message.author.id);
          setTimeout(() => {
            message.channel.delete().catch(console.error);
          }, 10000);
        }
      }
    } else {
      await message.channel.send('❌ Kod niepoprawny, spróbuj ponownie.');
    }
  }

  if (message.channel.name.startsWith('regulamin-') && regulationAnswers.has(message.author.id)) {
    const userData = regulationAnswers.get(message.author.id);
    if (!userData) return;

    const { questions, currentIndex, correct } = userData;
    if (message.content === questions[currentIndex].answer) {
      userData.correct++;
    } else {
      // Kara za błędną odpowiedź - time mute na 1 minutę
      const member = message.guild.members.cache.get(message.author.id);
      if (member) {
        await member.timeout(60000, 'Niepoprawna odpowiedź na pytanie regulaminowe');
      }
      await message.channel.send(`❌ Błędna odpowiedź. Jesteś wyciszony na 1 minutę.`);
    }

    userData.currentIndex++;

    if (userData.currentIndex < questions.length) {
      await message.channel.send(questions[userData.currentIndex].question);
    } else {
      if (userData.correct === questions.length) {
        const role = message.guild.roles.cache.get('1300816260573040680');
        if (role) {
          const member = message.guild.members.cache.get(message.author.id);
          if (member) {
            await member.roles.add(role);
            await message.channel.send(`✅ Gratulacje ${message.author}, zdałeś test regulaminu! Kanał zostanie usunięty za 10 sekund.`);
          }
        }
      } else {
        await message.channel.send(`❌ Niepoprawne odpowiedzi. Musisz poczekać minutę przed ponowną próbą.`);
        regulationAnswers.delete(message.author.id);
      }
      setTimeout(() => {
        message.channel.delete().catch(console.error);
      }, 10000);
    }
  }
});


// OBSŁUGA BŁĘDÓW KLIENTA
client.on('error', error => {
  console.error('Błąd klienta:', error);
});

client.login(process.env.TOKEN);
