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
        const verificationCodes = Array.from({ length: 6 }, () => Math.floor(10000000 + Math.random() * 90000000));
        const chosenCode = verificationCodes[Math.floor(Math.random() * verificationCodes.length)];
        
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
          .setDescription('Aby zweryfikować swoją tożsamość, podaj poniższy kod w wiadomości:')
          .addFields({ name: '🆔 Kod Weryfikacyjny:', value: `\`${chosenCode}\`` })
          .setColor('#ff5733')
          .setFooter({ text: 'Prosimy o przepisanie kodu dokładnie!' });

        await ticketChannel.send({ embeds: [verificationEmbed] });
        await interaction.reply({ content: `🔍 Ticket weryfikacyjny został utworzony: ${ticketChannel}`, ephemeral: true });
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

client.login(token);






  
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
