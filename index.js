const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');
var colorRoles = {}
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    bot.user.setActivity("Use ,color!")
    colorRoles = config.colorRoles
});
bot.on('message', async message => {
    const prefix = config.prefix
    const args = message.content.slice(prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()
    if (!message.content.startsWith(prefix)) return;
    if (command === 'color' || command === 'colors') {
        if (!bot.guilds.get(config.serverID).member(message.author.id).roles.has(config.vipRole)) {
            const embed = {
                "description": "Sorry, this command is for VIPs only. To get vip today visit [here](https://www.snksrv.com/donate).",
                "color": 299410,
                "timestamp": Date.now()
            };
            message.channel.send({
                embed: embed
            })
            return;
        }
        if (args.length === 0) {
            function rolesToString() {
                var list = '0: Reset Color\n';
                var num = 1
                Object.keys(colorRoles).forEach(i => {
                    list += (num + ": " + bot.guilds.get(config.serverID).roles.get(colorRoles[i]).toString() + "\n")
                    num++
                })
                return list;
            }
            var roleString = await rolesToString()
            const colorList = {
                "description": `Please select a color from the list below.\n\n${roleString}\nTo enable please use \`--color <Color>\``,
                "color": 299410,
                "timestamp": Date.now()
            };
            message.channel.send({
                embed: colorList
            }).then(m => {
                m.delete(120000)
            })
            return;
        } else {
            if (isNaN(args[0]) || (Number(args[0]) > Object.keys(colorRoles).length)) {
                message.delete()
                message.channel.send('Please enter a valid number. To list the color choices do `--colors`').then(m => {
                    m.delete(2500)
                })
                return;
            }
            var memberRoles = Array.from(bot.guilds.get(config.serverID).member(message.author.id).roles.keys())
            var cRoles = Object.values(colorRoles)
            var addRole = colorRoles[Object.keys(colorRoles)[Number(args[0]) - 1]]
            if (memberRoles.includes(addRole)) {
                message.react("👌")
                return;
            }
            cRoles.forEach(r => {
                r = bot.guilds.get(config.serverID).roles.get(r)
                if (memberRoles.includes(r.id)) {
                    bot.guilds.get(config.serverID).member(message.author.id).removeRole(r.id)
                }
            })
            if (args[0] === '0') {
                message.react("🗑")
                message.delete(3000)
            } else {
                bot.guilds.get(config.serverID).member(message.author.id).addRole(addRole).then(() => {
                    message
                    message.delete(3000)
                }).catch(() => {
                    message.react("❌")
                    message.delete(3000)
                    message.channel.send(`${bot.guilds.get(config.serverID).member('134088598684303360').toString()} I AM BROKEN!!`)
                })
            }
        }
    }
});
bot.login(config.token);