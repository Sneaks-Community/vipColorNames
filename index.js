const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');
var colorRoles = {}
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    bot.user.setActivity(`Use ${config.prefix}color!`)
    colorRoles = config.colorRoles
});
bot.on('message', async message => {
    const prefix = config.prefix
    const args = message.content.slice(prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()
    if (!message.content.startsWith(prefix)) return;
    
    if (command === 'color' || command === 'colors') {
        if (!message.member.roles.cache.has(config.vipRole) && !message.member.roles.cache.has(config.boostRole)) {
            const embed = {
                "description": "Sorry, this command is for VIPs and Nitro Boosters only. To get vip today visit [here](https://www.snksrv.com/donate).",
                "color": 299410,
                "timestamp": Date.now(),
                "footer": {
                    "icon_url": message.guild.member("134088598684303360").user.avatarURL(),
                    "text": "Made by Frumpy#0072"
                  }
            };
            message.channel.send(message.member,{
                embed: embed
            }).then(m => {
                message.delete({timeout: 5000});
                m.delete({timeout: 5000})
            })
            return;
        }
        if (args.length === 0) {
            function rolesToString() {
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
                "description": `Please select a color from the list below.\n\n${roleString}\nTo set a color please use \`${config.prefix}color <Color>\``,
                "color": 299410,
                "timestamp": Date.now()
            };
            message.channel.send({
                embed: colorList
            }).then(m => {
                m.delete({timeout: 8000})
            })
            return;
        } else {
            if (isNaN(args[0]) || (Number(args[0]) > Object.keys(colorRoles).length)) {
                message.delete()
                message.channel.send(`Please enter a valid number. To list the color choices do \`${config.prefix}colors\``).then(m => {
                    m.delete({timeout: 5000})
                })
                return;
            }
            var memberRoles = Array.from(message.member.roles.cache.keys())
            var cRoles = Object.values(colorRoles)
            var addRole = colorRoles[Object.keys(colorRoles)[Number(args[0]) - 1]]
            if (memberRoles.includes(addRole)) {
                message.react("👌")
                return;
            }
            cRoles.forEach(r => {
                r = message.guild.roles.cache.get(r)
                if (memberRoles.includes(r.id)) {
                    message.member.roles.remove(r.id)
                }
            })
            if (args[0] === '0') {
                message.react("🗑")
                message.delete({timeout: 5000})
            } else {
                message.member.roles.add(addRole).then(() => {
                    message.react("✅")
                    message.delete({timeout: 5000})
                }).catch(() => {
                    message.react("❌")
                    message.delete({timeout: 5000})
                    message.channel.send(`${message.guild.member('134088598684303360').toString()} I AM BROKEN!!`)
                })
            }
        }
    }
});

bot.on("guildMemberUpdate", (o, n) => {
    let check1 = o.roles.cache.has(config.vipRole) || o.roles.cache.has(config.boostRole);
    let check2 = !n.roles.cache.has(config.vipRole) && !n.roles.cache.has(config.boostRole);
    let ids = Object.values(colorRoles);
    
    if(check1 && check2){
        
            n.roles.cache.array().map(r => r.id).forEach(r => {
            if(ids.includes(r)){
                n.roles.remove(r)
            }
        })
    }
})


bot.login(config.token);
