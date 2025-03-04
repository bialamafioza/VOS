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
        // Tworzenie nowego kanału ticketowego
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
              id: '1300816251706409020', // ID roli, która może zarządzać kanałami
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
            }
          ]
        });

        // Wysyłanie formularza do kanału ticketowego
        const formEmbed = new EmbedBuilder()
          .setTitle('🎟️ **Ticket - Potrzebuję Pilnej Pomocy!** 🎟️')
          .setColor('#3498db')
          .setDescription(`
            **🔧 Problem:**  
            👉 **Opis:**  
            Opisuj jak najdokładniej, co się dzieje! Im więcej szczegółów, tym szybciej pomożemy! 🙌  
            Przykład:  
            _"Nie mogę dołączyć do kanału głosowego, chociaż próbuję kliknąć. Ekran jakby się zawiesza!"_ 😩  
            Jeśli pojawił się jakiś komunikat o błędzie, dodaj go też. Im więcej info, tym lepiej! 🔍

            **📅 Kiedy wystąpił problem?**  
            📌 **Data/Godzina:**  
            Przypomnij sobie, kiedy to się stało. 🕒  
            Przykład:  
            _"Po ostatniej aktualizacji Discorda (wczoraj, 18:30)"_  
            Kiedy dokładnie wystąpił problem? Im dokładniej podasz, tym szybciej znajdziemy rozwiązanie! ⏳

            **💥 Szczegóły:**  
            📋 **Co próbowałeś zrobić, aby rozwiązać problem?**  
            Jeśli podjąłeś jakiekolwiek próby naprawy, napisz o nich! To pomoże nam oszczędzić czas na rozwiązanie Twojego problemu. ⏰  
            Przykład:  
            _"nic nie zrobiłem ."_ 🛠️   
            Każdy detal się liczy, nawet jeśli wydaje się mały! 👀

            **📌 Priorytet zgłoszenia:**  
            🔴 **Wysoki priorytet** – np. "Nie mogę korzystać z kanałów głosowych i nie mam jak się połączyć z innymi." 😱  
            🟡 **Średni priorytet** – np. "Mój status na serwerze jest zablokowany, ale ogólnie mogę korzystać z serwera." 😅  
            🟢 **Niski priorytet** – np. "Chciałbym zmienić kolor czcionki na serwerze." 🎨

            **👤 Twoja rola na serwerze:**  
            🤖 **Jaka jest Twoja rola na serwerze?**  
            Napisz, czy jesteś:  
            - **Członkiem** 🧑‍🤝‍🧑  
            - **Moderatora** 🛡️  
            - **Administratorem** 🏅  
            Pomoże nam to lepiej zrozumieć kontekst Twojego zgłoszenia! 💡

            **📸 Dodatkowe informacje (opcjonalnie):**  
            Masz screenshoty? Logi? Inne materiały, które mogą pomóc rozwiązać problem? 🔎  
            Załącz je tutaj! Dzięki temu będziemy mogli szybciej działać i rozwiązać Twój problem! 📸  
            (W razie potrzeby możesz również opisać problem, jeśli zrzut ekranu nie oddaje pełnego obrazu!) 🎯

            **Dziękujemy za zgłoszenie!** 🙏  
            **Jestemy na to gotowi!** 💪  
            Postaramy się odpowiedzieć jak najszybciej. Będziemy na Ciebie czekać! ⏳
          `)
          .setFooter({ text: 'Ticket System - Formularz Zgłoszenia' });

        await ticketChannel.send({ content: `📩 Witaj w swoim ticketcie, ${user.tag}!`, embeds: [formEmbed] });

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

// KOMENDA WERYFIKACJI !weryfikacja
client.on('messageCreate', async message => {
  if (message.content === '!weryfikacja') {
    const embed = new EmbedBuilder()
      .setTitle('🔒 Weryfikacja')
      .setDescription('Kliknij przycisk poniżej, aby się zweryfikować!')
      .setColor('#ffcc00');

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('verify')
        .setPlaceholder('✅ Zweryfikuj się')
        .addOptions([
          { label: 'Zweryfikuj', value: 'verify' }
        ])
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.login(process.env.BOT_TOKEN);

  
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
