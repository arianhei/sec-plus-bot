try{
module.exports = {
    name: "config",
    description: 'Config your server data | Use options to see help',
    execute(message) {
        const db = require('./../db');
        let json_log = db.data(message.guild.id);
        delete db;
        if (!(json_log.white_list.includes(message.author.id) || message.author.id === message.guild.ownerID)) {
            return message.channel.send({ embed: { title: "you arent a part of whitelist", color: 0xfc2003 } })
        }
        const args = message.content.slice(json_log.PREFIX).trim().split(/ +/);
        if (args.length === 1) {
            return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter options", description: `Ex: ${json_log.PREFIX}config options` } })
        }
        if (args[1] === "options") {
            //return message.channel.send({ embed: { color: 0x000000, description: `options: \nprefix \`!\`\nwhitelist \`@member\`\nchannellog \`#channel\`\nmuterole \`@role\`\nunmuterole \`@role\`\nmutetime \`2s\`\nblockmention \`@role\`\nspam \`on\`\nlink \`on\`\nattachment \`on\`\nothers \`on\`\nadd \`on\`\nantikick \`on\`\nantiban \`on\`\nsetup` } })
            return message.channel.send({ embed: { title: "Bot Config", color: 0xff00ff, fields: [{ name: "prefix ", value: "Like This : prefix s!", inline: true }, { name: "whitelist", value: "whitelist @Ehsan", inline: true }, { name: "whitelist remove", value: "whitelist remove @Ehsan", inline: true }, { name: "channellog", value: "#channel", inline: true }, { name: "muterole <a:oo:777877574977716245>", value: "@role", inline: true }, { name: "unmuterole", value: "@role", inline: true }, { name: "blockmention", value: "@role", inline: true }, { name: "spam", value: "on or off", inline: true },{ name: "spamlimit", value: "0,100 %", inline: true }, { name: "link", value: "on or off", inline: true }, { name: "add", value: "on or off", inline: true }, { name: "attachment", value: "on or off", inline: true }, { name: "others", value: "on or off", inline: true }, { name: "kick", value: "on or off", inline: true }, { name: "ban", value: "on or off", inline: true }, { name: "setup", value: "create muted role and..", inline: true }, { name: "mention", value: "on or off", inline: true }] } })
        }
        if (args[1] === "prefix") {
            if (args[2] === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter prefix to set", description: `Ex: ${json_log.PREFIX}config prefix !` } });
            if (args[2].length > 3) return message.channel.send({ embed: { title: "Error 0x704: the prefix length limit is 3", description: `Ex: ${json_log.PREFIX}config prefix !` } });
            db.set_data('prefix', args[2], message.guild.id)
            return message.channel.send('updated')
        }
        if (args[1] === "whitelist") {
            const user = message.mentions.users.first()
            if (!user) return message.channel.send({ embed: { title: "Error 0x504: you forgot to mention member", description: `Ex: ${json_log.PREFIX}config whitelist @member` } });
            if (!message.guild.member(user)) return message.channel.send({ embed: { title: "User isnt in this server" } });
            if (!message.guild.member(user).hasPermission("ADMINISTRATOR")) return message.channel.send({ embed: { title: `Error 0x604: ${user.tag} dont have administrator permission` } });

            if (args[2] === "remove") {
                if (!json_log.white_list.includes(user.id)) return message.channel.send({ embed: { title: "Error 0x209: this user isn't in whitelist" } })
                db.set_data('whitelist remove', user.id, message.guild.id)
            }
            else {
                if (json_log.white_list.includes(user.id)) return message.channel.send({ embed: { title: "Error 0x209: this user is already in whitelist" } })
                db.set_data('whitelist', user.id, message.guild.id)
            }
            return message.channel.send('updated')
        }
        if (args[1] === "channellog") {
            const channel = message.mentions.channels
            if (channel.first() === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to mention channnel", description: `Ex: ${json_log.PREFIX}config channellog \`#channel\`` } });
            if (!message.guild.channels.cache.get(channel.first().id)) return message.channel.send({ embed: { title: "Channel isn't in server", description: `Ex: ${json_log.PREFIX}config channellog \`#channel\`` } });
            db.set_data('channellog', channel.first().id, message.guild.id)
            return message.channel.send('updated')
        }
        if (args[1] === "muterole") {
            const role = message.mentions.roles;
            if (role.first() === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to mention role", description: `Ex: ${json_log.PREFIX}config muterole \`@role\`` } });
            if (!message.guild.roles.cache.get(role.first().id)) return message.channel.send({ embed: { title: "Role isn't in server", description: `Ex: ${json_log.PREFIX}config muterole \`@role\`` } });
            if (role.first().managed) {
                return message.channel.send({ embed: { title: `Error 0x707: i cant set ${role.first().name} because i detected its for bot` } })
            }
            if (role.first().position >= message.guild.me.roles.highest.position) return message.channel.send({ embed: { title: "Error 0x304: role is higher than me" } });
            db.set_data('muterole', role.first().id, message.guild.id)
            return message.channel.send('updated')
        }
        if (args[1] === "blockmention") {
            const role = message.mentions.roles;
            if (role.first() === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to mention role", description: `Ex: ${json_log.PREFIX}config muterole \`@role\`` } });
            if (!message.guild.roles.cache.get(role.first().id)) return message.channel.send({ embed: { title: "Role isn't in server", description: `Ex: ${json_log.PREFIX}config muterole \`@role\`` } });
            if (role.first().managed) {
                return message.channel.send({ embed: { title: `Error 0x707: i cant set ${role.first().name} because i detected its for bot` } })
            }
            if (args[2] === "remove") {
                db.set_data('blockmention remove', role.first().id, message.guild.id)
            }
            else {
                db.set_data('blockmention', role.first().id, message.guild.id)
            }
            return message.channel.send('updated')
        }
        if (args[1] === "unmuterole") {
            const role = message.mentions.roles;
            if (role.first() === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to mention role", description: `Ex: ${json_log.PREFIX}config unmuterole \`@role\`` } });
            if (!message.guild.roles.cache.get(role.first().id)) return message.channel.send({ embed: { title: "Role isn't in server", description: `Ex: ${json_log.PREFIX}config unmuterole \`@role\`` } });
            if (role.first().managed) {
                return message.channel.send({ embed: { title: `Error 0x707: i cant set ${role.first().name} because i detected its for bot` } })
            }
            if (role.first().position >= message.guild.me.roles.highest.position) return message.channel.send({ embed: { title: "Error 0x304: role is higher than me" } });
            db.set_data('unmuterole', role.first().id, message.guild.id)
            return message.channel.send('updated')
        }
        if (args[1] === "mutetime") {
            const time = args.join().match(/(\d{1,2})(s|m)/g);
            if (time === null) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter time", description: `Ex: ${json_log.PREFIX}config mutetime \`1s\`` } });
            db.set_data('unmuterole', time[0], message.guild.id)
            return message.channel.send('updated')
        }
        if (args[1] === "spam") {
            if (args[2] === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter on|off", description: `Ex: ${json_log.PREFIX}config spam \`on\`` } });
            if (args[2] === "on") {
                db.set_data("spam", 1, message.guild.id)
            }
            else if (args[2] === "off") {
                db.set_data("spam", 0, message.guild.id)
            }
            else {
                return message.channel.send('only on or off')
            }
            return message.channel.send('updated')
        }
        if (args[1] === "link") {
            if (args[2] === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter on|off", description: `Ex: ${json_log.PREFIX}config link \`on\`` } });
            if (args[2] === "on") {
                db.set_data("link", 1, message.guild.id)
            }
            else if (args[2] === "off") {
                db.set_data("link", 0, message.guild.id)
            }
            else {
                return message.channel.send('only on or off')
            }
            return message.channel.send('updated')
        }
        if (args[1] === "attachment") {
            if (args[2] === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter on|off", description: `Ex: ${json_log.PREFIX}config attachment \`on\`` } });
            if (args[2] === "on") {
                db.set_data("attachment", 1, message.guild.id)
            }
            else if (args[2] === "off") {
                db.set_data("attachment", 0, message.guild.id)
            }
            else {
                return message.channel.send('only on or off')
            }
            return message.channel.send('updated')
        }
        if (args[1] === "add") {
            if (args[2] === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter on|off", description: `Ex: ${json_log.PREFIX}config add \`on\`` } });
            if (args[2] === "on") {
                db.set_data("add", 1, message.guild.id)
            }
            else if (args[2] === "off") {
                db.set_data("add", 0, message.guild.id)
            }
            else {
                return message.channel.send('only on or off')
            }
            return message.channel.send('updated')
        }
        if (args[1] === "mention") {
            if (args[2] === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter on|off", description: `Ex: ${json_log.PREFIX}config mention \`on\`` } });
            if (args[2] === "on") {
                db.set_data("mention", 1, message.guild.id)
            }
            else if (args[2] === "off") {
                db.set_data("mention", 0, message.guild.id)
            }
            else {
                return message.channel.send('only on or off')
            }
            return message.channel.send('updated')
        }
        if (args[1] === "antiban") {
            if (args[2] === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter on|off", description: `Ex: ${json_log.PREFIX}config antiban \`on\`` } });
            if (args[2] === "on") {
                db.set_data("antiban", 1, message.guild.id)
            }
            else if (args[2] === "off") {
                db.set_data("antiban", 0, message.guild.id)
            }
            else {
                return message.channel.send('only on or off')
            }
            return message.channel.send('updated')
        }
        if (args[1] === "antikick") {
            if (args[2] === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter on|off", description: `Ex: ${json_log.PREFIX}config antikick \`on\`` } });
            if (args[2] === "on") {
                db.set_data("antikick", 1, message.guild.id)
            }
            else if (args[2] === "off") {
                db.set_data("antikick", 0, message.guild.id)
            }
            else {
                return message.channel.send('only on or off')
            }
            return message.channel.send('updated')
        }
        if (args[1] === "others") {
            if (args[2] === undefined) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter on|off", description: `Ex: ${json_log.PREFIX}config others \`on\`` } });
            if (args[2] === "on") {
                db.set_data("others", 1, message.guild.id)
            }
            else if (args[2] === "off") {
                db.set_data("others", 0, message.guild.id)
            }
            else {
                return message.channel.send('only on or off')
            }
            return message.channel.send('updated ')
        }
        if (args[1].toLowerCase() === "spamlimit") {
            const limit = args.join().match(/(\d{1,3})%/g)
            if (limit === null) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter spam limit", description: `Ex: ${json_log.PREFIX}config spamLimit \`100%\`` } });
            if (parseInt(limit[0].slice(0, limit[0].search("%"))) > 100) return message.channel.send({ embed: { title: "do we have higher than 100%??" } });
            db.set_data('limit', (5 - (parseInt(limit[0].slice(0, limit[0].search("%"))) / 20)) + 2, message.guild.id)
            return message.channel.send('updated')
        }
        if (args[1].toLowerCase() === "setup") {

            try {
                message.guild.roles.create({ data: { name: 'muted', color: 0xff0000 } }).then(r => {
                    db.set_data("muterole", r.id, message.guild.id);
                    message.guild.channels.cache.filter(channel => channel.type === "voice" || channel.type === "text").forEach(channel => {
                        if (channel.type === "text") channel.updateOverwrite(r, { SEND_MESSAGES: false });
                        if (channel.type === "voice") channel.updateOverwrite(r, { CONNECT: false });
                        /*channel.overwritePermissions([{
                            id: r.id,
                            type:'role',
                            deny: ["SEND_MESSAGES"]["CONNECT"]
                        }])*/
                    });
                    message.channel.send('updated')
                });
            }
            catch (err) {
                console.log(err);
                message.channel.send({ embed: { title: "I cant do that" } })
            }
        }
        if (args[1] === "allow") {
            if (args[2] === "delete") {
                if (json_log.allow_action.length === 0) return message.channel.send({ embed: { title: "No allow action avaible" } })
                const em = { title: "Type the number that you want delete it", description: "" };
                for (let i = 0; i < json_log.allow_action.length; i++) {
                    em.description += `${i + 1}- ${json_log.allow_action[i]} by `
                    if (json_log.allow_users[i] !== null) em.description += `<@${json_log.allow_users[i]}>\n`
                    else em.description += `ALL\n`
                }
                message.channel.send({ embed: em })
                delete em;
                message.channel.awaitMessages(m => m.author.id === message.author.id && !isNaN(m.content), { max: 1, time: 20000, errors: ['time'] })
                    .then(collected => {
                        if (parseInt(collected.first().content) > json_log.allow_action.length) return message.channel.send({ embed: { title: "Error 0x1010: your entry isnt in list" } })
                        db.allow("delete", message.author.id, message.guild.id, "mode", parseInt(collected.first().content) - 1)
                        message.channel.send('updated')
                    }).catch(collected => {
                        message.channel.send('your time finished');
                    });
            }
            if (args[2] === "edit") {
                if (json_log.allow_action.length === 0) return message.channel.send({ embed: { title: "No allow action avaible" } })
                const em = { title: "Type the number that you want edit it", description: "" };
                for (let i = 0; i < json_log.allow_action.length; i++) {
                    em.description += `${i + 1}- ${json_log.allow_action[i]} by `
                    if (json_log.allow_users[i] !== null) em.description += `<@${json_log.allow_users[i]}>\n`
                    else em.description += `ALL\n`
                }
                message.channel.send({ embed: em })
                delete em;
                message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 20000, errors: ['time'] }).then(collected => {
                    const __message__ = collected.first()
                    const num = parseInt(__message__.content.slice(0, 1)) - 1
                    if (num > json_log.allow_action.length) return message.channel.send({ embed: { title: "Error 0x1010: your entry isnt in list" } })
                    //message.channel.send({embed : {title:"completed"}})


                    const arg = __message__.content.trim().split(/ +/)

                    if (arg[1].toUpperCase() === "UPDATE_EMOJI") {
                        if (__message__.mentions.users.first() !== undefined) db.allow("edit", __message__.mentions.users.first().id, message.guild.id, "EMOJI UPDATE", num)
                        else if (arg[3].toLowerCase() === "all") db.allow("edit", null, message.guild.id, "EMOJI UPDATE", num)
                    }
                    if (arg[1].toUpperCase() === "UPDATE_SERVER") {
                        if (__message__.mentions.users.first() !== undefined) db.allow("edit", __message__.mentions.users.first().id, message.guild.id, "UPDATE SERVER", num)
                        else if (arg[3].toLowerCase() === "all") db.allow("edit", null, message.guild.id, "UPDATE SERVER", num)
                    }
                    if (arg[1].toUpperCase() === "MANAGE_ROLE") {
                        if (__message__.mentions.users.first() !== undefined) db.allow("edit", __message__.mentions.users.first().id, message.guild.id, "MANAGE ROLE", num)
                        else if (arg[2].toLowerCase() === "all") db.allow("edit", null, message.guild.id, "MANAGE ROLE", num)
                    }
                    if (arg[1].toUpperCase() === "CHANNEL_UPDATE") {
                        if (__message__.mentions.users.first() !== undefined) db.allow("edit", __message__.mentions.users.first().id, message.guild.id, "CHANNEL UPDATE", num)
                        else if (arg[2].toLowerCase() === "all") db.allow("edit", null, message.guild.id, "CHANNEL UPDATE", num)
                    }
                    if (arg[1].toUpperCase() === "CHANNEL_PERMISSION_UPDATE") {
                        if (__message__.mentions.users.first() !== undefined) db.allow("edit", __message__.mentions.users.first().id, message.guild.id, "CHANNEL PERMISSION UPDATE", num)
                        else if (arg[2].toLowerCase() === "all") db.allow("edit", null, message.guild.id, "CHANNEL PERMISSION UPDATE", num)
                    }
                    if (arg[1].toUpperCase() === "WEBHOOK_UPDATE") {
                        if (__message__.mentions.users.first() !== undefined) db.allow("edit", __message__.mentions.users.first().id, message.guild.id, "WEBHOOK UPDATE", num)
                        else if (arg[2].toLowerCase() === "all") db.allow("edit", null, message.guild.id, "WEBHOOK UPDATE", num)
                    }
                    if (arg[1].toUpperCase() === "MEMBER_ROLE_UPDATE") {
                        if (__message__.mentions.users.first() !== undefined) db.allow("edit", message.mentions.users.first().id, message.guild.id, "MEMBER_ROLE_UPDATE", num)
                        else if (arg[2].toLowerCase() === "all") db.allow("edit", null, message.guild.id, "MEMBER ROLE UPDATE", num)
                    }
                }).catch(collected => {
                    message.channel.send('your time finished');
                });
            }
            if (args[2] === "create") {
                if (args.length !== 6) return message.channel.send({ embed: { title: "Error 0x504: you forgot to enter options" } })
                if (args[3].toUpperCase() === "UPDATE_EMOJI") {
                    if (message.mentions.users.first() !== undefined) db.allow("create", message.mentions.users.first().id, message.guild.id, "EMOJI UPDATE", 0)
                    else if (args[5].toLowerCase() === "all") db.allow("create", null, message.guild.id, "EMOJI UPDATE", 0)
                }
                if (args[3].toUpperCase() === "UPDATE_SERVER") {
                    if (message.mentions.users.first() !== undefined) db.allow("create", message.mentions.users.first().id, message.guild.id, "UPDATE SERVER", 0)
                    else if (args[5].toLowerCase() === "all") db.allow("create", null, message.guild.id, "UPDATE SERVER", 0)
                }
                if (args[3].toUpperCase() === "MANAGE_ROLE") {
                    if (message.mentions.users.first() !== undefined) db.allow("create", message.mentions.users.first().id, message.guild.id, "MANAGE ROLE", 0)
                    else if (args[5].toLowerCase() === "all") db.allow("create", null, message.guild.id, "MANAGE ROLE", 0)
                }
                if (args[3].toUpperCase() === "CHANNEL_UPDATE") {
                    if (message.mentions.users.first() !== undefined) db.allow("create", message.mentions.users.first().id, message.guild.id, "CHANNEL UPDATE", 0)
                    else if (args[5].toLowerCase() === "all") db.allow("create", null, message.guild.id, "CHANNEL UPDATE", 0)
                }
                if (args[3].toUpperCase() === "CHANNEL_PERMISSION_UPDATE") {
                    if (message.mentions.users.first() !== undefined) db.allow("create", message.mentions.users.first().id, message.guild.id, "CHANNEL PERMISSION UPDATE", 0)
                    else if (args[5].toLowerCase() === "all") db.allow("create", null, message.guild.id, "CHANNEL PERMISSION UPDATE", 0)
                }
                if (args[3].toUpperCase() === "WEBHOOK_UPDATE") {
                    if (message.mentions.users.first() !== undefined) db.allow("create", message.mentions.users.first().id, message.guild.id, "WEBHOOK UPDATE", 0)
                    else if (args[5].toLowerCase() === "all") db.allow("create", null, message.guild.id, "WEBHOOK UPDATE", 0)
                }
                if (args[3].toUpperCase() === "MEMBER_ROLE_UPDATE") {
                    if (message.mentions.users.first() !== undefined) db.allow("create", message.mentions.users.first().id, message.guild.id, "MEMBER_ROLE_UPDATE", 0)
                    else if (args[5].toLowerCase() === "all") db.allow("create", null, message.guild.id, "MEMBER_ROLE_UPDATE", 0)
                }
            }
            if (args[2] === "delete") { }
        }
    }
}
}catch(err){
    console.log("config : "+err)
}
