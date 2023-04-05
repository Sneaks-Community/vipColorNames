const { Client, Intents } = require("discord.js");
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const config = require("./config.json");
var colorRoles = {}; //makes global object

// const version = require('./package.json').version;

bot.on("ready", () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    bot.user.setActivity(`Use ${config.prefix}color!`);
    colorRoles = config.colorRoles; //fills global object
});

const version = require("./package.json").version;

bot.on('messageCreate', async message => {

    if (message.author.bot) return; //if message is from bot, ignore
    const prefix = config.prefix
    const args = message.content.slice(prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()
    if (!message.content.startsWith(prefix)) return;

    if (['color', 'colors', 'colour', 'colours'].includes(command)) {
        if (!config.allowedRoles.some(role => message.member.roles.cache.has(role))) {
            const embed = {
                "description": "Sorry, this command is for VIPs and Nitro Boosters only. To get vip today visit [here](https://www.snksrv.com/donate).",
                "color": 299410,
                "timestamp": Date.now(),
                "footer": {
                    "icon_url": (await message.guild.members.fetch("134088598684303360")).user.avatarURL(),
                    "text": `v${version} • Made by Frumpy#0072`
                }
            };
            message.channel.send(message.member, { embeds: [embed] })
                .then(msg => setTimeout(() => { message.delete(); msg.delete(); }, 5000));
            return;
        }

        const roleString = args.length === 0
            ? Object.values(colorRoles).reduce((list, roleId, idx) => list + `${idx + 1}: ${message.guild.roles.cache.get(roleId)}\n`, '0: Reset Color\n')
            : null;

        if (roleString) {
            const colorList = {
                "description": `Please select a color from the list below.\n\n${roleString}\nTo set a color please use \`${config.prefix}color <Color Number>\``,
                "color": 299410,
                "timestamp": Date.now(),
                "footer": {
                    "icon_url": (await message.guild.members.fetch("134088598684303360")).user.avatarURL(),
                    "text": `v${version} • Made by Frumpy#0072`
                }
            };
            message.channel.send({ embeds: [colorList] })
                .then(msg => { message.delete(); setTimeout(() => msg.delete(), 20000); });
        } else {
            const index = Number(args[0]) - 1;
            const colorRolesArray = Object.values(colorRoles);
            if (isNaN(args[0]) || index >= colorRolesArray.length) {
                message.delete();
                message.channel.send(`Please enter a valid number. To list the color choices do \`${config.prefix}colors\``)
                    .then(msg => setTimeout(() => msg.delete(), 5000));
                return;
            }

            const memberRoles = message.member.roles.cache;
            const addRole = colorRolesArray[index];

            if (memberRoles.has(addRole)) {
                message.react(message.guild.emojis.cache.get("718604767022022666") || "♿");
                setTimeout(() => message.delete(), 5000);
                return;
            }

            colorRolesArray.forEach(roleId => memberRoles.has(roleId) && message.member.roles.remove(roleId));

            if (args[0] === '0') {
                message.react("🗑");
                setTimeout(() => message.delete(), 5000);
            } else {
                message.member.roles.add(addRole)
                    .then(() => { message.react("✅"); setTimeout(() => message.delete(), 5000); })
                    .catch(() => {
                        message.react("❌");
                        setTimeout(() => message.delete(), 5000);
                        message.channel.send(`${message.guild.member('134088598684303360')} I AM BROKEN!!`);
                    });
            }
        }
    }

});

//Admin commands

bot.on("messageCreate", async message => {//requires ops team role
    const prefix = config.prefix
    const args = message.content.slice(prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()
    if (!message.content.startsWith(prefix)) return;
    if (!message.member.roles.cache.has("490757099534548995")) return;

    if (command == "id") {
        message.channel.send(message.guild.emojis.cache.get("718604767022022666") || "OK").then(m => {
            m.edit(m.id);
        })
    }

    if (command == "updatepin") {
        function rolesToString() {//makes a list of all the colorRoles with a corresponding number
            var list = '0: Reset Color\n';
            var num = 1
            Object.keys(colorRoles).forEach(i => {
                list += (num + ": " + message.guild.roles.cache.get(colorRoles[i]).toString() + "\n")
                num++
            })
            return list;
        }
        var roleString = await rolesToString()
        const colorList = {
            "description": `Please select a color from the list below.\n\n${roleString}\nTo set a color please use \`${config.prefix}color <Color Number>\``,
            "color": 299410,
            "timestamp": Date.now(),
            "footer": {
                "icon_url": (await message.guild.members.fetch("134088598684303360")).user.avatarURL(),
                "text": `v${version} • Made by Frumpy#0072`
            }
        };
        message.channel.send({
            embeds: [colorList]
        }).then(m => {
            if (args[0]) message.channel.messages.fetch(args[0]).then(oldM => oldM.unpin());
            message.delete();
            m.pin();
        })
    }

})

// Event handler for when a guild member's roles are updated
bot.on("guildMemberUpdate", (oldMember, newMember) => {
    // Check if the old member had any of the allowedRoles
    let hadAllowedRole = config.allowedRoles.some(role => oldMember.roles.cache.has(role));

    // Check if the new member doesn't have any of the allowedRoles
    let lacksAllowedRole = !config.allowedRoles.some(role => newMember.roles.cache.has(role));

    // Get an array of color role IDs
    let colorRoleIds = Object.values(colorRoles);

    // If the member had an allowed role and now lacks one, remove any color roles they had
    if (hadAllowedRole && lacksAllowedRole) {
        // Iterate through the member's role IDs and remove any color roles
        newMember.roles.cache.map(role => role.id).forEach(roleId => {
            if (colorRoleIds.includes(roleId)) {
                newMember.roles.remove(roleId);
            }
        });
    }
});


bot.login(config.token);
