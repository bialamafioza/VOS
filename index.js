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
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32m SH : http://localhost:${port} ✅\x1b[0m`);
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

  console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${currentStatus} (${statusType})`);
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
}

function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
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
              id: '1300816251706409020', // ID roli, która ma dostęp do zarządzania kanałem
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
            }
          ]
        });

        // Wysłać formularz w nowym kanale ticketu
        const ticketFormEmbed = new EmbedBuilder()
          .setTitle('🎟️ **Ticket - Potrzebuję Pomocy!** 🎟️')
          .setDescription('Proszę wypełnić poniższy formularz, abyśmy mogli Ci pomóc szybciej!')
          .addFields(
            { name: '🔧 Problem:', value: '👉 **Opis:**\Napisz jak najdokładniej, co się dzieje! Im więcej szczegółów, tym szybciej pomożemy!' },
            { name: '📅 Kiedy wystąpił problem?', value: '📌 **Data/Godzina:**\Przypomnij sobie, kiedy to się stało. 🕒' },
            { name: '💥 Szczegóły:', value: '📋 **Co próbowałeś zrobić, aby rozwiązać problem?**' },
            { name: '📌 Priorytet zgłoszenia:', value: '🔴🟡🟢' },
            { name: '👤 Twoja rola na serwerze:', value: 'Jaką masz rangę na serwerze?' },
            { name: '📸 Dodatkowe informacje (opcjonalnie):', value: 'Masz screenshoty? Logi? Inne materiały, które mogą pomóc rozwiązać problem?' },
          )
          .setColor('#ffcc00')
          .setFooter({ text: 'Prosimy o dokładne informacje!' });

        await ticketChannel.send({ embeds: [ticketFormEmbed] });

        await interaction.reply({ content: `📩 Ticket został utworzony: ${ticketChannel}`, ephemeral: true });
      } catch (error) {
        console.error('Błąd podczas tworzenia kanału:', error);
        await interaction.reply({ content: '❌ Wystąpił błąd podczas tworzenia ticketu.', ephemeral: true });
      }
    } else if (interaction.values[0] === 'custom_ticket') {
      await interaction.reply({ content: '🛠️ Proszę opisać swój problem. Administracja odpowie najszybciej, jak to możliwe!', ephemeral: true });
    }
  }
});

// OBSŁUGA BŁĘDÓW KLIENTA
client.on('error', error => {
  console.error('Błąd klienta:', error);
});

client.on('messageCreate', async message => {
  if (message.content === '!weryfikacja') {
    const embed = new EmbedBuilder()
      .setTitle('🔒 Weryfikacja')
      .setDescription('Kliknij przycisk poniżej, aby rozpocząć weryfikację!')
      .setColor('#ffcc00');

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('verify_start')
        .setPlaceholder('✅ Rozpocznij weryfikację')
        .addOptions([
          { label: 'Rozpocznij', value: 'start_verification' }
        ])
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// Obsługa rozpoczęcia weryfikacji
client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'verify_start' && interaction.values[0] === 'start_verification') {
    const guild = interaction.guild;
    const user = interaction.user;

    // Tworzymy prywatny kanał dla użytkownika na czas weryfikacji
    const verificationChannel = await guild.channels.create({
      name: `weryfikacja-${user.username}`,
      type: ChannelType.GuildText,
      parent: '1300816399161229403', // ID kategorii na kanały weryfikacyjne
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ],
    });

    // Etap 1: Wybór liczby
    const correctNumberStage1 = '3'; // Poprawna odpowiedź
    const numbers = ['1', '2', '3', '4', '5'];

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Etap 1 Weryfikacji')
      .setDescription('Wybierz poprawną liczbę, aby przejść dalej.')
      .setColor('#3498db');

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`verification_stage1_${user.id}`)
      .setPlaceholder('🔢 Wybierz liczbę')
      .addOptions(numbers.map(num => ({ label: num, value: num })));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await verificationChannel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `📩 Weryfikacja rozpoczęta w kanale ${verificationChannel}`, ephemeral: true });
  }
});

// Obsługa wyboru liczby w etapie 1
client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId.startsWith('verification_stage1_')) {
    const user = interaction.user;
    const correctNumberStage1 = '3';

    if (interaction.values[0] === correctNumberStage1) {
      const correctNumberStage2 = '7'; // Poprawna odpowiedź dla etapu 2
      const numbersStage2 = ['6', '7', '8', '9', '10'];

      const embed = new EmbedBuilder()
        .setTitle('🛡️ Etap 2 Weryfikacji')
        .setDescription('Brawo! Teraz wybierz poprawną liczbę w drugim etapie.')
        .setColor('#27ae60');

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`verification_stage2_${user.id}`)
        .setPlaceholder('🔢 Wybierz liczbę')
        .addOptions(numbersStage2.map(num => ({ label: num, value: num })));

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.update({ embeds: [embed], components: [row] });
    } else {
      await interaction.reply({ content: '❌ Niepoprawna odpowiedź! Spróbuj ponownie.', ephemeral: true });
    }
  }
});

// Obsługa wyboru liczby w etapie 2
client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId.startsWith('verification_stage2_')) {
    const user = interaction.user;
    const correctNumberStage2 = '7';

    if (interaction.values[0] === correctNumberStage2) {
      const role = interaction.guild.roles.cache.get('1300816261655302216'); // ID roli weryfikacyjnej

      if (role) {
        await interaction.member.roles.add(role);
      }

      await interaction.update({ content: '✅ Gratulacje! Pomyślnie zweryfikowano.', embeds: [], components: [] });

      // Usuń kanał weryfikacji po 10 sekundach
      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 10000);
    } else {
      await interaction.reply({ content: '❌ Niepoprawna odpowiedź! Spróbuj ponownie.', ephemeral: true });
    }
  }
});


  
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
