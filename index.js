/*

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
                                                 
  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  
                    
DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         
                                                                       
☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆


*/

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

// TWORZENIE PANELU TICKETÓW NA KOMENDĘ !panel
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
        }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// OBSŁUGA WYBORU UŻYTKOWNIKA
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
          parent: '1302743323089309876', // ID kategorii
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: user.id,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            },
            {
              id: '1300816251706409020',
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
            }
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
  }
});

// OBSŁUGA BŁĘDÓW KLIENTA
client.on('error', error => {
  console.error('Błąd klienta:', error);
});

// Połączenie z bazą danych
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const UserSchema = new mongoose.Schema({ userId: String, verificationCode: String, verified: Boolean, attempts: Number });
const User = mongoose.model('User', UserSchema);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Bot ${client.user.tag} jest online!`);
});

client.on('messageCreate', async message => {
    if (message.content === '!weryfikacja') {
        let user = await User.findOne({ userId: message.author.id });

        if (user && user.verified) {
            return message.reply('✅ Jesteś już zweryfikowany!');
        }

        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        if (!user) {
            user = new User({ userId: message.author.id, verificationCode, verified: false, attempts: 3 });
        } else {
            user.verificationCode = verificationCode;
            user.verified = false;
            user.attempts = 3;
        }
        await user.save();

        const embed = new EmbedBuilder()
            .setTitle('🔒 Weryfikacja')
            .setDescription(`Twój kod weryfikacyjny: **${verificationCode}**. Wpisz \`!potwierdz <kod>\` aby się zweryfikować.`)
            .setColor('BLUE');

        message.author.send({ embeds: [embed] }).catch(() => {
            message.reply('Nie mogłem wysłać Ci wiadomości prywatnej. Upewnij się, że masz włączone DM.');
        });
    }
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith('!potwierdz ')) return;
    const inputCode = message.content.split(' ')[1];
    const user = await User.findOne({ userId: message.author.id });

    if (!user) return message.reply('❌ Nie masz aktywnej weryfikacji.');
    if (user.verified) return message.reply('✅ Jesteś już zweryfikowany!');
    if (user.verificationCode !== inputCode) {
        user.attempts -= 1;
        await user.save();

        if (user.attempts <= 0) {
            return message.reply('🚨 Przekroczyłeś limit prób! Skontaktuj się z administracją.');
        }

        return message.reply(`❌ Błędny kod! Pozostało prób: ${user.attempts}`);
    }

    user.verified = true;
    await user.save();

    const member = message.guild.members.cache.get(message.author.id);
    if (member) {
        await member.roles.add(verificationRoleId);
    }

    message.reply('✅ Weryfikacja zakończona sukcesem! Otrzymałeś rolę zweryfikowanego użytkownika.');
});


client.login(process.env.TOKEN);





  
/*

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
                                                 
  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  
                    
DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         
                                                                       
☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆


*/
