const { Client, Intents } = require("discord.js");
const bot = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const config = require("./config.json");
var colorRoles = {}; //makes global object

// const version = require('./package.json').version;

bot.on("ready", () => {
	console.log(`Logged in as ${bot.user.tag}!`);
	bot.user.setActivity(`Use ${config.prefix}color!`);
	colorRoles = config.colorRoles; //fills global object
});
bot.on('messageCreate', async message => {
    console.log("message")

    const prefix = config.prefix
    const args = message.content.slice(prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()
    if (!message.content.startsWith(prefix)) return;

    if (command === 'color' || command === 'colors' || command == "colour" || command == "colours") {
        if (!config.allowedRoles.some(r => message.member.roles.cache.has(r))) {//if you dont have any allowedRoles
            const embed = {
                "description": "Sorry, this command is for VIPs and Nitro Boosters only. To get vip today visit [here](https://www.snksrv.com/donate).",
                "color": 299410,
                "timestamp": Date.now(),
                "footer": {
                    "icon_url": message.guild.member("134088598684303360").user.avatarURL(),
                    "text": `v${version} • Made by Frumpy#0072`
                }
            };
            message.channel.send(message.member, {
                embeds: [embed]
            }).then(m => {
                message.delete({ timeout: 5000 });
                m.delete({ timeout: 5000 })
            })
            return;
        }
        if (args.length === 0) {
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
                    "icon_url": message.guild.member("134088598684303360").user.avatarURL(),
                    "text": `v${version} • Made by Frumpy#0072`
                }
            };
            message.channel.send({
                embeds: [colorList]
            }).then(m => {
                message.delete()
                m.delete({ timeout: 20000 })
            })
            return;
        } else {
            if (isNaN(args[0]) || (Number(args[0]) > Object.keys(colorRoles).length)) {//checks if invalid number or no number
                message.delete()
                message.channel.send(`Please enter a valid number. To list the color choices do \`${config.prefix}colors\``).then(m => {
                    m.delete({ timeout: 5000 })
                })
                return;
            }
            var memberRoles = Array.from(message.member.roles.cache.keys())//Makes array of members role IDs
            var cRoles = Object.values(colorRoles)//Makes array of colorRole IDs
            var addRole = colorRoles[Object.keys(colorRoles)[Number(args[0]) - 1]]//Picks role out of colorRoles array depending on input
            if (memberRoles.includes(addRole)) {
                message.react(message.guild.emojis.cache.get("718604767022022666") || "♿")//easteregg
                message.delete({timeout: 5000})
                return;
            }
            cRoles.forEach(r => {//when new color is selected it removes the rest of the colorRoles
                r = message.guild.roles.cache.get(r)
                if (memberRoles.includes(r.id)) {
                    message.member.roles.remove(r.id)
                }
            })
            if (args[0] === '0') {
                message.react("🗑")
                message.delete({ timeout: 5000 })
            } else {
                message.member.roles.add(addRole).then(() => {
                    message.react("✅")
                    message.delete({ timeout: 5000 })
                }).catch(() => {
                    message.react("❌")
                    message.delete({ timeout: 5000 })
                    message.channel.send(`${message.guild.member('134088598684303360').toString()} I AM BROKEN!!`)
                })
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
                "icon_url": message.guild.member("134088598684303360").user.avatarURL(),
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

bot.on("guildMemberUpdate", (o, n) => {//Removes roles if you dont have any allowedRoles

    let check1 = config.allowedRoles.some(r => o.roles.cache.has(r));//checks if old member had any of the allowedRoles

    let check2 = !config.allowedRoles.some(r => n.roles.cache.has(r));//checks if new member doesnt have any of the allowedRoles.

    let ids = Object.values(colorRoles);

    if (check1 && check2) {//check if both checks are true

        n.roles.cache.array().map(r => r.id).forEach(r => {
            if (ids.includes(r)) {
                n.roles.remove(r)
            }
        })
    }
})

// bot.on("messageCreate", async (message) => {
// 	console.log("message");
// });

bot.login(config.token);
