"use strict";
const Discord = require('discord.js');
const chalk = require('chalk');
const ParseTime = require('parse-ms');
const ms = require('ms');
const fs = require('fs');
const { exec } = require('child_process')
const downloadEngine = require('./downloadEngine');

const client = new Discord.Client({ maxCacheMessageSize: 15 });
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
delete commandFiles;
const db = require('./db');
let infoPrefix = chalk.hex("#57ff6b").bold("[INFO] ")
let starPrefix = chalk.hex("#34ebeb").bold("[START] ")
const mentionHook = new Discord.WebhookClient("785016064298975253", "M1Kn7S_G2SaMGWE2q8tnX_iUzImtJqLeFCAQBFLHtdh4ab4vVEbXZLBlegjz_4lrZCvh");
client.on('ready', () => {
    console.log(starPrefix + `Logged as ${client.user.tag} | Servers: ${client.guilds.cache.size}`);
    client.user.setActivity('SEC+', { type: 'PLAYING' })
    client.guilds.cache.forEach(guild => mentionHook.send(`${guild.name}  =  ${guild.iconURL()}`))
});


client.on('error', err => {
    console.log(err.message);
});

client.on('disconnect', (a, b) => {
    console.log('disconnected');
});

client.on('shardDisconnect', (e, d) => {
    console.log('disconnected from server');
});

client.on('shardReconnecting', a => {
    console.log('reconnecting');
});
client.on('messageUpdate', (old_message, message) => {
    delete old_message;
    if (!message.guild) return;
    let json_data = db.data(message.guild.id);
    if (!(json_data.white_list.includes(`${message.author.id}`)) && message.author.id !== message.guild.ownerID) {
        if (json_data.ANTI_AD === 1 && ((message.content.toLowerCase()).includes('discord.com/invite/') || message.content.toLowerCase()).includes('discord.gg/')) {
            if (message.deletable) {
                message.delete({ timeout: 500 });
            }
            message.channel.send(new Discord.MessageEmbed().setColor(0xe00000).setDescription(`Invite link detected <a:qal:777127378253774858>`).setFooter(`message sent by ${message.author.tag}`, `${message.author.displayAvatarURL({ Dynamic: true })}`))
            if (json_data.LOG_CHANNEL_ID !== "" && message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID) !== undefined) {
                message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> ${message.author.tag} has sent an invite link`))
            }
            let mute_role_id = json_data.MUTE_ID
            if (mute_role_id === "" || message.guild.roles.cache.get(mute_role_id) === null) {
                return;
            }

            message.member.roles.cache.forEach(role => { if (message.guild.me.hasPermission('ADMINISTRATOR') && role.id !== message.guild.roles.everyone.id && role.position < message.guild.me.roles.highest.position) { message.member.roles.remove(role) } })
            message.member.roles.add(message.guild.roles.cache.get(mute_role_id))
            if (json_data.MUTE_TIME !== "" && json_data.UNMUTE_ID !== "" && message.guild.roles.cache.get(json_data.UNMUTE_ID) !== undefined) {
                return setTimeout(function () {
                    if (message.member === null) { return; }
                    if (message.member.roles.cache.has(json_data.UNMUTE_ID)) {
                        return;
                    }
                    message.member.roles.remove(message.guild.roles.cache.get(mute_role_id))
                    message.member.roles.add(message.guild.roles.cache.get(json_data.UNMUTE_ID))
                }, ms(json_data.MUTE_TIME))
            }
        }
        else if (json_data.ANTI_LINK === 1 && message.content.match(/(https?:\/\/[^\s]+)/g) !== null) {
            if (message.deletable) {
                message.delete({ timeout: 1000 });
            }
            if (json_data.LOG_CHANNEL_ID !== "" && message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID) !== null) {
                message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> ${message.author.tag} has posted an invite link`))
            }
            message.channel.send(new Discord.MessageEmbed().setColor(0xe00000).setDescription(`Link detected <a:qal:777127378253774858>`).setFooter(`message sent by ${message.author.tag}`, `${message.author.displayAvatarURL()}`))
        }
        if (
            json_data.ANTI_MENTION === 1
            &&
            (
                message.content.includes('<@&')
                ||
                message.content.includes('@everyone')
            )
        ) {

            if (message.content.includes(`@everyone`)) {
                if (message.deletable) {
                    message.delete({ timeout: 1000 });
                }
                message.channel.send(new Discord.MessageEmbed().setColor(0xe00000).setDescription('Mention @everyone detected <a:qal:777127378253774858>').setFooter(`message sent by ${message.author.tag}`, `${message.author.displayAvatarURL()}`))
                let mute_role_id = json_data.MUTE_ID
                if (mute_role_id === "" || message.guild.roles.cache.get(mute_role_id) === undefined) {
                    return;
                }
                message.member.roles.cache.forEach(role => { if (message.guild.me.hasPermission('ADMINISTRATOR') && role.id !== message.guild.roles.everyone.id && role.position < message.guild.me.roles.highest.position) { message.member.roles.remove(role) } })
                message.member.roles.add(message.guild.roles.cache.get(mute_role_id))
                if (json_data.LOG_CHANNEL_ID !== "" && message.guild.channels.cache.get(json_data.log_channel) !== undefined) {
                    message.guild.channels.cache.get(json_data.log_channel).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> ${message.author.tag} has mentioned role @everyone`))
                }
                if (json_data.MUTE_TIME !== "" && json_data.UNMUTE_ID !== "" && message.guild.roles.cache.get(json_data.UNMUTE_ID) !== undefined) {
                    return setTimeout(function () {
                        if (message.member === null) { return; }
                        if (message.member.roles.cache.has(json_data.unmute_role)) {
                            return;
                        }
                        message.member.roles.remove(message.guild.roles.cache.get(mute_role_id))
                        message.member.roles.add(message.guild.roles.cache.get(json_data.UNMUTE_ID))
                    }, ms(json_data.MUTE_TIME))
                }
            }
        }
    }
});

client.on('message', message => {

    if (!message.guild) {
        return console.log(`from ${message.author.tag} content : ${message.content}`)
    }
    if (message.member === null) {
        return;
    }
    if (message.author.id === message.guild.me.id) {
        return;
    }
    db.get(message.guild.id, json_data => {
        if (!(json_data.white_list.includes(`${message.author.id}`)) && message.author.id !== message.guild.ownerID) {
            if (json_data.ANTI_AD === 1 && ((message.content.toLowerCase()).includes('discord.com/invite/') || message.content.toLowerCase()).includes('discord.gg/')) {
                if (message.deletable) {
                    message.delete({ timeout: 500 });
                }
                message.channel.send(new Discord.MessageEmbed().setColor(0xe00000).setDescription(`Invite link detected <a:qal:777127378253774858>`).setFooter(`message sent by ${message.author.tag}`, `${message.author.displayAvatarURL({ Dynamic: true })}`))
                if (json_data.LOG_CHANNEL_ID !== "" && message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID) !== undefined) {
                    message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> ${message.author.tag} has sent an invite link`))
                }
                let mute_role_id = json_data.MUTE_ID
                if (mute_role_id === "" || message.guild.roles.cache.get(mute_role_id) === null) {
                    return;
                }

                message.member.roles.cache.forEach(role => { if (message.guild.me.hasPermission('ADMINISTRATOR') && role.id !== message.guild.roles.everyone.id && role.position < message.guild.me.roles.highest.position) { message.member.roles.remove(role) } })
                message.member.roles.add(message.guild.roles.cache.get(mute_role_id))
                if (json_data.MUTE_TIME !== "" && json_data.UNMUTE_ID !== "" && message.guild.roles.cache.get(json_data.UNMUTE_ID) !== undefined) {
                    return setTimeout(function () {
                        if (message.member === null) { return; }
                        if (message.member.roles.cache.has(json_data.UNMUTE_ID)) {
                            return;
                        }
                        message.member.roles.remove(message.guild.roles.cache.get(mute_role_id))
                        message.member.roles.add(message.guild.roles.cache.get(json_data.UNMUTE_ID))
                    }, ms(json_data.MUTE_TIME))
                }
            }
            else if (json_data.ANTI_LINK === 1 && message.content.match(/(https?:\/\/[^\s]+)/g) !== null) {
                if (message.deletable) {
                    message.delete({ timeout: 1000 });
                }
                if (json_data.LOG_CHANNEL_ID !== "" && message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID) !== null) {
                    message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> ${message.author.tag} has posted an invite link`))
                }
                message.channel.send(new Discord.MessageEmbed().setColor(0xe00000).setDescription(`Link detected <a:qal:777127378253774858>`).setFooter(`message sent by ${message.author.tag}`, `${message.author.displayAvatarURL()}`))
            }
            if (
                json_data.ANTI_MENTION === 1
                &&
                (
                    message.content.includes('<@&')
                    ||
                    message.content.includes('@everyone')
                )
            ) {

                if (message.content.includes(`@everyone`)) {
                    if (message.deletable) {
                        message.delete({ timeout: 1000 });
                    }
                    message.channel.send(new Discord.MessageEmbed().setColor(0xe00000).setDescription('Mention @everyone detected <a:qal:777127378253774858>').setFooter(`message sent by ${message.author.tag}`, `${message.author.displayAvatarURL()}`))
                    let mute_role_id = json_data.MUTE_ID
                    if (mute_role_id === "" || message.guild.roles.cache.get(mute_role_id) === undefined) {
                        return;
                    }
                    message.member.roles.cache.forEach(role => { if (message.guild.me.hasPermission('ADMINISTRATOR') && role.id !== message.guild.roles.everyone.id && role.position < message.guild.me.roles.highest.position) { message.member.roles.remove(role) } })
                    message.member.roles.add(message.guild.roles.cache.get(mute_role_id))
                    if (json_data.LOG_CHANNEL_ID !== "" && message.guild.channels.cache.get(json_data.log_channel) !== undefined) {
                        message.guild.channels.cache.get(json_data.log_channel).send(new Discord.MessageEmbed().setColor(0x00d423).setTitle(`<a:__:777127532079742976> ${message.author.tag} has mentioned role @everyone`))
                    }
                    if (json_data.MUTE_TIME !== "" && json_data.UNMUTE_ID !== "" && message.guild.roles.cache.get(json_data.UNMUTE_ID) !== undefined) {
                        return setTimeout(function () {
                            if (message.member === null) { return; }
                            if (message.member.roles.cache.has(json_data.unmute_role)) {
                                return;
                            }
                            message.member.roles.remove(message.guild.roles.cache.get(mute_role_id))
                            message.member.roles.add(message.guild.roles.cache.get(json_data.UNMUTE_ID))
                        }, ms(json_data.MUTE_TIME))
                    }
                }
                if (message.mentions.roles.first() === undefined) return;
                message.mentions.roles.forEach(thing => {
                    if (json_data.role_mention_block.includes(thing.id)) {
                        if (message.deletable) {
                            message.delete({ timeout: 1000 });
                        }
                        message.channel.send(new Discord.MessageEmbed().setColor(0xe00000).setDescription('Mention BlockMention role detected').setFooter(`message sent by ${message.author.tag}`, `${message.author.displayAvatarURL()}`))
                        let mute_role_id = json_data.MUTE_ID
                        if (mute_role_id === "" || message.guild.roles.cache.get(mute_role_id) === undefined) {
                            return;
                        }
                        if (json_data.LOG_CHANNEL_ID !== "" && message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID) !== undefined) {
                            message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setTitle(`<a:__:777127532079742976> ${message.author.tag} has mentioned BlockMention role`))
                        }
                        message.member.roles.cache.forEach(role => { if (message.guild.me.hasPermission('ADMINISTRATOR') && role.id !== message.guild.roles.everyone.id && role.position < message.guild.me.roles.highest.position) { message.member.roles.remove(role) } })
                        message.member.roles.add(message.guild.roles.cache.get(mute_role_id))
                        if (json_data.MUTE_ID !== "" && json_data.UNMUTE_ID !== "" && message.guild.roles.cache.get(json_data.UNMUTE_ID) !== null) {
                            return setTimeout(function () {
                                if (message.member === null) { return; }
                                if (message.member.roles.cache.has(json_data.UNMUTE_ID)) {
                                    return;
                                }
                                message.member.roles.remove(message.guild.roles.cache.get(mute_role_id))
                                message.member.roles.add(message.guild.roles.cache.get(json_data.UNMUTE_ID))
                            }, ms(json_data.MUTE_TIME))
                        }
                    }
                })
            }

            if (
                json_data.ANTI_AT === 1
                &&
                message.attachments.size !== 0
            ) {
                if (message.deletable) {
                    message.delete({ timeout: 500 });
                }
                message.channel.send(new Discord.MessageEmbed().setColor(0xe00000).setDescription(`<a:__:777127532079742976> Attachement detected`).setFooter(`message sent by ${message.author.tag}`, `${message.author.displayAvatarURL()}`))
                if (json_data.LOG_CHANNEL_ID !== "" && message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID) !== undefined) {
                    message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).addField(`${message.author.tag} has sent an attachment`, `${message.attachments.map(attach => attach.url)}`))
                }
            }

            //if (json_data.ANTI_SPAM === 1 && message.channel.messages.cache.filter(msg => msg.author.id === message.author.id && `${message.createdAt.toDateString()}/${ParseTime(message.createdTimestamp).hours}/${ParseTime(message.createdTimestamp).minutes}/${ParseTime(message.createdTimestamp).seconds / 10}` === `${msg.createdAt.toDateString()}/${ParseTime(msg.createdTimestamp).hours}/${ParseTime(msg.createdTimestamp).minutes}/${ParseTime(message.createdTimestamp).seconds / 10}`).size === json_data.SPAM_LIMIT) {
            if (json_data.ANTI_SPAM === 1 && message.channel.messages.cache.filter(msg => { let time_message = ParseTime(msg.createdTimestamp); let now_time = ParseTime(message.createdTimestamp); if (msg.author.id === message.author.id && `${message.createdAt.toDateString()}/${now_time.hours}/${now_time.minutes}/${now_time.seconds / 12}` === `${msg.createdAt.toDateString()}/${time_message.hours}/${time_message.minutes}/${time_message.seconds / 12}`) { return true } else { return false } }).size === json_data.SPAM_LIMIT) {
                message.channel.send(new Discord.MessageEmbed().setColor(0xe00000).setDescription(`Spam Detected`).setFooter(`i will mute ${message.author.tag}`))
                let mute_role_id = json_data.MUTE_ID
                if (mute_role_id === "" || message.guild.roles.cache.get(mute_role_id) === null) {
                    return;
                }
                if (json_data.LOG_CHANNEL_ID !== "" && message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID) !== null) {
                    message.guild.channels.cache.get(json_data.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> ${message.author.tag} has spammed in ${message.channel.name}`))
                }
                message.member.roles.cache.forEach(role => { if (message.guild.me.hasPermission('ADMINISTRATOR') && role.id !== message.guild.roles.everyone.id && role.position < message.guild.me.roles.highest.position) { message.member.roles.remove(role) } })
                message.member.roles.add(message.guild.roles.cache.get(mute_role_id))
                if (json_data.MUTE_TIME !== "" && json_data.UNMUTE_ID !== "" && message.guild.roles.cache.get(json_data.UNMUTE_ID) !== null) {
                    setTimeout(function () {
                        if (message.member === null) { return; }
                        if (message.member.roles.cache.has(json_data.UNMUTE_ID)) {
                            return;
                        }
                        message.member.roles.remove(message.guild.roles.cache.get(mute_role_id))
                        message.member.roles.add(message.guild.roles.cache.get(json_data.UNMUTE_ID))
                    }, ms(json_data.MUTE_TIME))
                }
            }
        }
    })
    let prefix = db.data(message.guild.id).PREFIX
    if (!message.content.startsWith(prefix)) return;

    const command = message.content.slice(prefix.length).trim().split(' ').shift().toLowerCase();
    let cmd = client.commands.get(`${command}`);
    if (cmd) {
        cmd.execute(message);
    }

});

client.on('guildUpdate', (old_guild, guild) => {

    guild.fetchAuditLogs({ type: 'GUILD_UPDATE', limit: 1 })
        .then(logs => logs.entries.find(entry => entry.target.id == guild.id))
        .then(entry => {
            let user = entry.executor;
            console.log(`Sever ${guild.name} Updated by <@${user.id}>`);
            if (user.id === guild.ownerID || user.id === guild.me.id) {
                return
            }
            let json_log = db.data(guild.id);
            if (json_log.allow_action.includes("UPDATE SERVER") && (json_log.allow_users[json_log.allow_action.indexOf("UPDATE SERVER")] === null || json_log.allow_users[json_log.allow_action.indexOf("UPDATE SERVER")] === user.id)) return;
            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.OTHERS === 1) {
                if (json_log.LOG_CHANNEL_ID !== "" && guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== undefined) {
                    guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Updated server datas`))
                }
                if (guild.me.hasPermission('ADMINISTRATOR')) {
                    if (guild.name !== old_guild.name) {
                        guild.setName(old_guild.name)
                    }
                    if ((old_guild.icon !== null) && guild.iconURL() !== old_guild.iconURL()) {
                        if (json_log.LOG_CHANNEL_ID !== "" && guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== undefined) {
                            guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(`your previous server icon : ${old_guild.iconURL()}`)
                        }
                    }
                    if ((guild.afkChannel !== null) && guild.afkChannelID !== old_guild.afkChannelID) {
                        guild.setAFKChannel(old_guild.afkChannel)
                    }
                    if (guild.afkTimeout !== old_guild.afkTimeout) {
                        guild.setAFKTimeout(old_guild.afkTimeout)
                    }
                    if (guild.systemChannel !== null && (guild.systemChannel.id !== old_guild.systemChannel.id)) {
                        guild.setSystemChannel(old_guild.systemChannel)
                    }
                    if (guild.region !== old_guild.region) {
                        guild.setRegion(old_guild.region)
                    }
                    if (guild.verificationLevel !== old_guild.verificationLevel) {
                        guild.setVerificationLevel(old_guild.verificationLevel)
                    }
                }
                if (user.bot) {
                    if (guild.member(user).kickable) {
                        guild.member(user).kick();
                    }
                }
                else {
                    let member = guild.member(user);
                    member.roles.cache.forEach(role => { if (guild.me.hasPermission('ADMINISTRATOR') && role.id !== guild.roles.everyone.id && role.position < guild.me.roles.highest.position) { member.roles.remove(role, "Ban more than ban limit") } })
                }
            }
        })
        .catch(error => console.error(error));

});
client.on('roleCreate', role => {

    role.guild.fetchAuditLogs({ type: 'ROLE_CREATE', limit: 1 })
        .then(logs => logs.entries.find(entry => entry.target.id == role.id))
        .then(entry => {
            if (entry === undefined) {
                return;
            }
            let user = entry.executor;
            console.log(`role ${role.name} Create by <@${user.id}>`);
            if (user.id === role.guild.ownerID || user.id === role.guild.me.id) {
                return
            }
            let json_log = db.data(role.guild.id)
            if (json_log.allow_action.includes("MANAGE ROLE") && (json_log.allow_users[json_log.allow_action.indexOf("MANAGE ROLE")] === null || json_log.allow_users[json_log.allow_action.indexOf("MANAGE ROLE")] === user.id)) return;
            if (json_log.OTHERS !== 1) {
                return
            }
            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.LOG_CHANNEL_ID !== "" && role.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                role.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Created role called ${role.name}`))
            }
            if (role.position < role.guild.me.roles.highest.position) {
                role.delete();
            }
            if (user.bot) {
                if (role.guild.member(user).kickable) {
                    role.guild.member(user).kick();
                }
            }
            else {
                let member = role.guild.member(user);
                member.roles.cache.forEach(role_ => { if (role.guild.me.hasPermission('ADMINISTRATOR') && role_.id !== role.guild.roles.everyone.id && role_.position < role.guild.me.roles.highest.position) { member.roles.remove(role_, "deleted a role") } })
            }
        })
        .catch(error => console.error(error));
});
client.on('roleDelete', role => {
    role.guild.fetchAuditLogs({ type: 'ROLE_DELETE', limit: 1 })
        .then(logs => logs.entries.find(entry => entry.target.id == role.id))
        .then(entry => {
            if (entry === undefined) {
                return;
            }
            let user = entry.executor;
            console.log(`role ${role.name} Deleted by <@${user.id}>`);
            if (user.id === role.guild.ownerID || user.id === role.guild.me.id) {
                return
            }
            let json_log = db.data(role.guild.id)
            if (json_log.allow_action.includes("MANAGE ROLE") && (json_log.allow_users[json_log.allow_action.indexOf("MANAGE ROLE")] === null || json_log.allow_users[json_log.allow_action.indexOf("MANAGE ROLE")] === user.id)) return;

            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.OTHERS !== 1) {
                return
            }
            if (json_log.LOG_CHANNEL_ID !== "" && role.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                role.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Deleted role called ${role.name}`))
            }
            if (role.guild.me.hasPermission('ADMINISTRATOR')) {
                role.guild.roles.create({ data: { name: role.name, color: role.color, position: role.position, permissions: role.permissions } })
            }
            if (user.bot) {
                if (role.guild.member(user).kickable) {
                    role.guild.member(user).kick();
                }
            }
            else {
                let member = role.guild.member(user);
                member.roles.cache.forEach(role_ => { if (role.guild.me.hasPermission('ADMINISTRATOR') && role_.id !== role.guild.roles.everyone.id && role_.position < role.guild.me.roles.highest.position) { member.roles.remove(role_, "Deleted a channel") } })
            }
        })
        .catch(error => console.error(error));

});
client.on('roleUpdate', (old_Role, role) => {
    const now = Date.now()
    role.guild.fetchAuditLogs({ type: 'ROLE_UPDATE' })
        .then(logs => logs.entries.first())
        .then(entry => {
            if (entry === undefined) return;
            let user = entry.executor;
            const dat = ParseTime(entry.createdTimestamp)
            const now_date = ParseTime(now)
            if (`${dat.days}${dat.hours}${dat.minutes}${dat.seconds}${dat.milliseconds / 5}` !== `${now_date.days}${now_date.hours}${now_date.minutes}${now_date.seconds}${dat.milliseconds / 5}`) return;
            delete now; delete dat; delete now_date;
            console.log(`role ${role.name} Updated by <@${user.id}>`);
            if (user === undefined) {
                return;
            }
            if (user.id === role.guild.ownerID || user.id === role.guild.me.id) {
                return
            }
            let json_log = db.data(role.guild.id)
            if (json_log.allow_action.includes("MANAGE ROLE") && (json_log.allow_users[json_log.allow_action.indexOf("MANAGE ROLE")] === null || json_log.allow_users[json_log.allow_action.indexOf("MANAGE ROLE")] === user.id)) return;
            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.OTHERS !== 1) {
                return;
            }
            if (json_log.LOG_CHANNEL_ID !== "" && role.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                role.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Updated role called ${role.name}`))
            }
            if (old_Role.name !== role.name) {
                role.setName(old_Role.name);
            }
            if (old_Role.permissions !== role.permissions) {
                console.log(JSON.stringify(old_Role.permissions))
                role.setPermissions(old_Role.permissions)
            }
            if (user.bot) {
                if (role.guild.member(user).kickable) {
                    role.guild.member(user).kick();
                }
            }
            else {
                let member = role.guild.member(user);
                member.roles.cache.forEach(role_ => { if (role.guild.me.hasPermission('ADMINISTRATOR') && role_.id !== role.guild.roles.everyone.id && role_.position < role.guild.me.roles.highest.position) { member.roles.remove(role_, "Updated Role") } })
            }
        })
        .catch(error => console.error(error));
});
client.on('guildMemberRemove', member => {
    let json_log = db.data(member.guild.id)
    if (json_log.ANTI_KICK !== 1) {
        return
    }
    let now = Date.now();
    member.guild.fetchAuditLogs({
        type: 'MEMBER_KICK',
        limit: 1
    }).then(fetchedLogs => {
        const kickLog = fetchedLogs.entries.first();
        const dat = ParseTime(kickLog.createdTimestamp)
        const now_date = ParseTime(now)
        if (`${dat.days}${dat.hours}${dat.minutes}${dat.seconds}${dat.milliseconds / 5}` !== `${now_date.days}${now_date.hours}${now_date.minutes}${now_date.seconds}${dat.milliseconds / 5}`) { return; }

        if (!kickLog) return console.log(`${member.user.tag} left the guild, most likely of their own will.`);
        if (kickLog.target.id === member.id) {
            console.log(`${member.user.tag} left the guild; kicked by ${kickLog.executor.tag}?`);
            let user = kickLog.executor;
            if (user.id === member.guild.ownerID || user.id === member.guild.me.id) {
                return
            }

            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.LOG_CHANNEL_ID !== "" && member.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                member.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> kicked ${member.user.tag}`))
            }
            if (user.bot) {
                if (member.guild.member(user).kickable) {
                    member.guild.member(user).kick();
                }
            }
            else {
                let member_ = member.guild.member(user);
                member_.roles.cache.forEach(role => { if (member.guild.me.hasPermission('ADMINISTRATOR') && role.id !== member.guild.roles.everyone.id && role.position < member.guild.me.roles.highest.position) { member_.roles.remove(role, "kick more that kick limit") } })
            }
        } else {
            console.log(`${member.user.tag} left the guild, audit log fetch was inconclusive.`);
        }
    });
});
client.on('channelUpdate', (old_channel, channel) => {
    let now = Date.now();
    let json_log = db.data(channel.guild.id)
    if (json_log.OTHERS !== 1) return;
    channel.guild.fetchAuditLogs({ type: 'CHANNEL_UPDATE' })
        .then(logs => {
            const entry = logs.entries.first()
            if (entry === undefined) { return }
            const dat = ParseTime(entry.createdTimestamp)
            const now_date = ParseTime(now)
            if (`${dat.days}${dat.hours}${dat.minutes}${dat.seconds}${dat.milliseconds / 5}` !== `${now_date.days}${now_date.hours}${now_date.minutes}${now_date.seconds}${dat.milliseconds / 5}`) { return; } let user = entry.executor;
            if (user.id === channel.guild.me.id) {
                return;
            }
            console.log(`channel ${channel.name} created by <@${user.id}>`);
            if (user.id === channel.guild.ownerID) {
                return
            }

            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.allow_action.includes("CHANNEL UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("CHANNEL UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("CHANNEL UPDATE")] === user.id)) return;
            if (json_log.LOG_CHANNEL_ID !== "" && channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Updated Channel: ${old_channel.name}`))
            }
            if (channel.guild.me.hasPermission('ADMINISTRATOR')) {
                if (old_channel.name !== channel.name) {
                    channel.setName(old_channel.name)
                }
                if (old_channel.parent !== channel.parent) {
                    channel.setParent(old_channel.parent)
                }
                if (channel.nsfw !== old_channel.nsfw) {
                    channel.setNSFW(old_channel.nsfw)
                }
            }
            if (channel)
                if (user.bot) {
                    if (channel.guild.member(user).kickable) {
                        channel.guild.member(user).kick();
                    }
                }
                else {
                    let member = channel.guild.member(user);
                    member.roles.cache.forEach(role => { if (channel.guild.me.hasPermission('ADMINISTRATOR') && role.id !== channel.guild.roles.everyone.id && role.position < channel.guild.me.roles.highest.position) { member.roles.remove(role, "created channel") } })
                }
        })
        .catch(error => console.error(error));
    if (channel.guild.me.hasPermission('ADMINISTRATOR')) {
        //if (compareOverwrites(old_channel, channel)) {
        channel.guild.fetchAuditLogs({ type: 'CHANNEL_OVERWRITE_CREATE' })
            .then(logs => {
                const entry = logs.entries.first()
                if (entry === undefined) { return }
                const dat = ParseTime(entry.createdTimestamp)
                const now_date = ParseTime(now)
                if (`${dat.days}${dat.hours}${dat.minutes}${dat.seconds}${dat.milliseconds / 5}` !== `${now_date.days}${now_date.hours}${now_date.minutes}${now_date.seconds}${dat.milliseconds / 5}`) { return; }
                let user = entry.executor;
                if (user.id === channel.guild.me.id) {
                    return;
                }
                if (json_log.allow_action.includes("CHANNEL PERMISSION UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("CHANNEL PERMISSION UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("CHANNEL PERMISSION UPDATE")] === user.id)) return;
                console.log(`channel ${channel.name} updated by <@${user.id}>`);
                if (user.id === channel.guild.ownerID) {
                    return
                }
                if (json_log.white_list.includes(user.id)) {
                    return
                }
                if (json_log.LOG_CHANNEL_ID !== "" && channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                    channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Created permission overwrite in channel: ${channel.name}`))
                }
                channel.permissionOverwrites.forEach(permission => {
                    if (!(old_channel.permissionOverwrites.keyArray().includes(permission.id))) {
                        channel.permissionOverwrites.get(permission.id).delete();
                    }
                });
                if (user.bot) {
                    if (channel.guild.member(user).kickable) {
                        channel.guild.member(user).kick();
                    }
                }
                else {
                    let member = channel.guild.member(user);
                    member.roles.cache.forEach(role => { if (channel.guild.me.hasPermission('ADMINISTRATOR') && role.id !== channel.guild.roles.everyone.id && role.position < channel.guild.me.roles.highest.position) { member.roles.remove(role, "created channel") } })
                }
            })
            .catch(error => console.error(error));
        channel.guild.fetchAuditLogs({ type: 'CHANNEL_OVERWRITE_DELETE' })
            .then(logs => {
                const entry = logs.entries.first()
                if (entry === undefined) return;
                const dat = ParseTime(entry.createdTimestamp)
                const now_date = ParseTime(now)
                if (`${dat.days}${dat.hours}${dat.minutes}${dat.seconds}${dat.milliseconds / 5}` !== `${now_date.days}${now_date.hours}${now_date.minutes}${now_date.seconds}${dat.milliseconds / 5}`) { return; }
                if (entry === undefined) {
                    return;
                }
                if (parseInt(entry.createdTimestamp) - now > 400) { return };
                let user = entry.executor;
                if (json_log.allow_action.includes("CHANNEL PERMISSION UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("CHANNEL PERMISSION UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("CHANNEL PERMISSION UPDATE")] === user.id)) return;
                if (user.id === channel.guild.me.id) {
                    return;
                }
                console.log(`channel ${channel.name} delete overwrite by <@${user.id}>`);
                if (user.id === channel.guild.ownerID) {
                    return
                }
                if (json_log.white_list.includes(user.id)) {
                    return
                }
                if (json_log.LOG_CHANNEL_ID !== "" && channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== undefined) {
                    channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Deleted permission overwrite in channel: ${channel.name}`))
                }
                old_channel.permissionOverwrites.forEach(permission => {
                    if (!(channel.permissionOverwrites.keyArray().includes(permission.id))) {
                        const deny = new Discord.Permissions(permission.deny).toArray()
                        const allow = new Discord.Permissions(permission.allow).toArray()
                        console.log(allow)
                        if (channel.type === "voice") {
                            channel.updateOverwrite((channel.guild.roles.cache.get(permission.id) !== null) ? channel.guild.roles.cache.get(permission.id) : channel.guild.members.cache.get(permission.id), {
                                CREATE_INSTANT_INVITE: (deny.includes("CREATE_INSTANT_INVITE")) ? false : (allow.includes("CREATE_INSTANT_INVITE")) ? true : null,
                                MANAGE_CHANNELS: (deny.includes("MANAGE_CHANNELS")) ? false : (allow.includes("MANAGE_CHANNELS")) ? true : null,
                                PRIORITY_SPEAKER: (deny.includes("PRIORITY_SPEAKER")) ? false : (allow.includes("PRIORITY_SPEAKER")) ? true : null,
                                STREAM: (deny.includes("STREAM")) ? false : (allow.includes("STREAM")) ? true : null,
                                VIEW_CHANNEL: (deny.includes("VIEW_CHANNEL")) ? false : (allow.includes("VIEW_CHANNEL")) ? true : null,
                                CONNECT: (deny.includes("CONNECT")) ? false : (allow.includes("CONNECT")) ? true : null,
                                SPEAK: (deny.includes("SPEAK")) ? false : (allow.includes("SPEAK")) ? true : null,
                                MUTE_MEMBERS: (deny.includes("MUTE_MEMBERS")) ? false : (allow.includes("MUTE_MEMBERS")) ? true : null,
                                DEAFEN_MEMBERS: (deny.includes("DEAFEN_MEMBERS")) ? false : (allow.includes("DEAFEN_MEMBERS")) ? true : null,
                                MOVE_MEMBERS: (deny.includes("MOVE_MEMBERS")) ? false : (allow.includes("MOVE_MEMBERS")) ? true : null,
                                MANAGE_ROLES: (deny.includes("MANAGE_ROLES")) ? false : (allow.includes("MANAGE_ROLES")) ? true : null,
                                MANAGE_ROLES: (deny.includes("MANAGE_ROLES")) ? false : (allow.includes("MANAGE_ROLES")) ? true : null,
                                MANAGE_WEBHOOKS: (deny.includes("MANAGE_WEBHOOKS")) ? false : (allow.includes("MANAGE_WEBHOOKS")) ? true : null
                            });
                        }
                        else {
                            channel.updateOverwrite((channel.guild.roles.cache.get(permission.id) !== null) ? channel.guild.roles.cache.get(permission.id) : channel.guild.members.cache.get(permission.id), {
                                CREATE_INSTANT_INVITE: (deny.includes("CREATE_INSTANT_INVITE")) ? false : (allow.includes("CREATE_INSTANT_INVITE")) ? true : null,
                                MANAGE_CHANNELS: (deny.includes("MANAGE_CHANNELS")) ? false : (allow.includes("MANAGE_CHANNELS")) ? true : null,
                                ADD_REACTIONS: (deny.includes("ADD_REACTIONS")) ? false : (allow.includes("ADD_REACTIONS")) ? true : null,
                                VIEW_CHANNEL: (deny.includes("VIEW_CHANNEL")) ? false : (allow.includes("VIEW_CHANNEL")) ? true : null,
                                SEND_MESSAGES: (deny.includes("SEND_MESSAGES")) ? false : (allow.includes("SEND_MESSAGES")) ? true : null,
                                SEND_TTS_MESSAGES: (deny.includes("SEND_TTS_MESSAGES")) ? false : (allow.includes("SEND_TTS_MESSAGES")) ? true : null,
                                MANAGE_MESSAGES: (deny.includes("MANAGE_MESSAGES")) ? false : (allow.includes("MANAGE_MESSAGES")) ? true : null,
                                EMBED_LINKS: (deny.includes("EMBED_LINKS")) ? false : (allow.includes("EMBED_LINKS")) ? true : null,
                                ATTACH_FILES: (deny.includes("ATTACH_FILES")) ? false : (allow.includes("ATTACH_FILES")) ? true : null,
                                READ_MESSAGE_HISTORY: (deny.includes("READ_MESSAGE_HISTORY")) ? false : (allow.includes("READ_MESSAGE_HISTORY")) ? true : null,
                                ENTION_EVERYONES: (deny.includes("ENTION_EVERYONE")) ? false : (allow.includes("ENTION_EVERYONE")) ? true : null,
                                USE_EXTERNAL_EMOJIS: (deny.includes("USE_EXTERNAL_EMOJIS")) ? false : (allow.includes("USE_EXTERNAL_EMOJIS")) ? true : null,
                                MANAGE_ROLES: (deny.includes("MANAGE_ROLES")) ? false : (allow.includes("MANAGE_ROLES")) ? true : null,
                                MANAGE_WEBHOOKS: (deny.includes("MANAGE_WEBHOOKS")) ? false : (allow.includes("MANAGE_WEBHOOKS")) ? true : null
                            })
                        }
                    }
                });
                if (user.bot) {
                    if (channel.guild.member(user).kickable) {
                        channel.guild.member(user).kick();
                    }
                }
                else {
                    let member = channel.guild.member(user);
                    member.roles.cache.forEach(role => { if (channel.guild.me.hasPermission('ADMINISTRATOR') && role.id !== channel.guild.roles.everyone.id && role.position < channel.guild.me.roles.highest.position) { member.roles.remove(role, "created channel") } })
                }
            })
            .catch(error => console.error(error));
        channel.guild.fetchAuditLogs({ type: 'CHANNEL_OVERWRITE_UPDATE' })
            .then(logs => {
                const entry = logs.entries.first()
                if (entry === undefined) {
                    return;
                }
                const dat = ParseTime(entry.createdTimestamp)
                const now_date = ParseTime(now)
                if (`${dat.days}${dat.hours}${dat.minutes}${dat.seconds}${dat.milliseconds / 5}` !== `${now_date.days}${now_date.hours}${now_date.minutes}${now_date.seconds}${dat.milliseconds / 5}`) { return };
                let user = entry.executor;
                if (user.id === channel.guild.me.id) {
                    return;
                }
                console.log(`channel ${channel.name} update overwrite by <@${user.id}>`);
                if (user.id === channel.guild.ownerID) {
                    return
                }
                if (json_log.allow_action.includes("CHANNEL PERMISSION UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("CHANNEL PERMISSION UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("CHANNEL PERMISSION UPDATE")] === user.id)) return;
                if (json_log.white_list.includes(user.id)) {
                    return
                }
                if (json_log.LOG_CHANNEL_ID !== "" && channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                    channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Updated permission overwrite in channel: ${channel.name}`))
                }
                old_channel.permissionOverwrites.forEach(permission => {
                    const deny = new Discord.Permissions(permission.deny).toArray()
                    const allow = new Discord.Permissions(permission.allow).toArray()
                    if (permission.deny !== channel.permissionOverwrites.get(permission.id).deny || permission.allow !== channel.permissionOverwrites.get(permission.id).allow) {
                        if (channel.type === "voice") {
                            channel.updateOverwrite((channel.guild.roles.cache.get(permission.id) !== null) ? channel.guild.roles.cache.get(permission.id) : channel.guild.members.cache.get(permission.id), {
                                CREATE_INSTANT_INVITE: (deny.includes("CREATE_INSTANT_INVITE")) ? false : (allow.includes("CREATE_INSTANT_INVITE")) ? true : null,
                                MANAGE_CHANNELS: (deny.includes("MANAGE_CHANNELS")) ? false : (allow.includes("MANAGE_CHANNELS")) ? true : null,
                                PRIORITY_SPEAKER: (deny.includes("PRIORITY_SPEAKER")) ? false : (allow.includes("PRIORITY_SPEAKER")) ? true : null,
                                STREAM: (deny.includes("STREAM")) ? false : (allow.includes("STREAM")) ? true : null,
                                VIEW_CHANNEL: (deny.includes("VIEW_CHANNEL")) ? false : (allow.includes("VIEW_CHANNEL")) ? true : null,
                                CONNECT: (deny.includes("CONNECT")) ? false : (allow.includes("CONNECT")) ? true : null,
                                SPEAK: (deny.includes("SPEAK")) ? false : (allow.includes("SPEAK")) ? true : null,
                                MUTE_MEMBERS: (deny.includes("MUTE_MEMBERS")) ? false : (allow.includes("MUTE_MEMBERS")) ? true : null,
                                DEAFEN_MEMBERS: (deny.includes("DEAFEN_MEMBERS")) ? false : (allow.includes("DEAFEN_MEMBERS")) ? true : null,
                                MOVE_MEMBERS: (deny.includes("MOVE_MEMBERS")) ? false : (allow.includes("MOVE_MEMBERS")) ? true : null,
                                MANAGE_ROLES: (deny.includes("MANAGE_ROLES")) ? false : (allow.includes("MANAGE_ROLES")) ? true : null,
                                MANAGE_ROLES: (deny.includes("MANAGE_ROLES")) ? false : (allow.includes("MANAGE_ROLES")) ? true : null,
                                MANAGE_WEBHOOKS: (deny.includes("MANAGE_WEBHOOKS")) ? false : (allow.includes("MANAGE_WEBHOOKS")) ? true : null
                            });
                        }
                        else {
                            channel.updateOverwrite((channel.guild.roles.cache.get(permission.id) !== null) ? channel.guild.roles.cache.get(permission.id) : channel.guild.members.cache.get(permission.id), {
                                CREATE_INSTANT_INVITE: (deny.includes("CREATE_INSTANT_INVITE")) ? false : (allow.includes("CREATE_INSTANT_INVITE")) ? true : null,
                                MANAGE_CHANNELS: (deny.includes("MANAGE_CHANNELS")) ? false : (allow.includes("MANAGE_CHANNELS")) ? true : null,
                                ADD_REACTIONS: (deny.includes("ADD_REACTIONS")) ? false : (allow.includes("ADD_REACTIONS")) ? true : null,
                                VIEW_CHANNEL: (deny.includes("VIEW_CHANNEL")) ? false : (allow.includes("VIEW_CHANNEL")) ? true : null,
                                SEND_MESSAGES: (deny.includes("SEND_MESSAGES")) ? false : (allow.includes("SEND_MESSAGES")) ? true : null,
                                SEND_TTS_MESSAGES: (deny.includes("SEND_TTS_MESSAGES")) ? false : (allow.includes("SEND_TTS_MESSAGES")) ? true : null,
                                MANAGE_MESSAGES: (deny.includes("MANAGE_MESSAGES")) ? false : (allow.includes("MANAGE_MESSAGES")) ? true : null,
                                EMBED_LINKS: (deny.includes("EMBED_LINKS")) ? false : (allow.includes("EMBED_LINKS")) ? true : null,
                                ATTACH_FILES: (deny.includes("ATTACH_FILES")) ? false : (allow.includes("ATTACH_FILES")) ? true : null,
                                READ_MESSAGE_HISTORY: (deny.includes("READ_MESSAGE_HISTORY")) ? false : (allow.includes("READ_MESSAGE_HISTORY")) ? true : null,
                                ENTION_EVERYONES: (deny.includes("ENTION_EVERYONE")) ? false : (allow.includes("ENTION_EVERYONE")) ? true : null,
                                USE_EXTERNAL_EMOJIS: (deny.includes("USE_EXTERNAL_EMOJIS")) ? false : (allow.includes("USE_EXTERNAL_EMOJIS")) ? true : null,
                                MANAGE_ROLES: (deny.includes("MANAGE_ROLES")) ? false : (allow.includes("MANAGE_ROLES")) ? true : null,
                                MANAGE_WEBHOOKS: (deny.includes("MANAGE_WEBHOOKS")) ? false : (allow.includes("MANAGE_WEBHOOKS")) ? true : null
                            })
                        }
                    }
                });
                if (user.bot) {
                    if (channel.guild.member(user).kickable) {
                        channel.guild.member(user).kick();
                    }
                }
                else {
                    let member = channel.guild.member(user);
                    member.roles.cache.forEach(role => { if (channel.guild.me.hasPermission('ADMINISTRATOR') && role.id !== channel.guild.roles.everyone.id && role.position < channel.guild.me.roles.highest.position) { member.roles.remove(role, "created channel") } })
                }
            })
            .catch(error => console.error(error));
    }
    //}
})
client.on('channelDelete', channel => {
    if (channel.guild === undefined) return true;
    channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE', limit: 1 })
        .then(logs => logs.entries.first())
        .then(entry => {
            let user = entry.executor;
            if (user.id === channel.guild.me.id) {
                return;
            }
            console.log(`channel ${channel.name} created by ${user.tag}`);
            if (user.id === channel.guild.ownerID) {
                return
            }
            let json_log = db.data(channel.guild.id);
            if (json_log.allow_action.includes("CHANNEL UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("CHANNEL UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("CHANNEL UPDATE")] === user.id)) return;
            if (json_log.OTHERS !== 1) return;
            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.LOG_CHANNEL_ID !== "" && channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Deleted Channel called ${channel.name}`))
            }
            if (channel.guild.me.hasPermission('ADMINISTRATOR')) {
                channel.guild.channels.create(channel.name, { type: channel.type })
                    .then(channel_created => {
                        if (channel.parent !== null) {
                            channel_created.setParent(channel.parent)
                        }
                    })
            }
            if (user.bot) {
                if (channel.guild.member(user).kickable) {
                    channel.guild.member(user).kick();
                }
            }
            else {
                let member = channel.guild.member(user);
                member.roles.cache.forEach(role => { if (channel.guild.me.hasPermission('ADMINISTRATOR') && role.id !== channel.guild.roles.everyone.id && role.position < channel.guild.me.roles.highest.position) { member.roles.remove(role, "created channel") } })
            }
        })
        .catch(error => console.error(error));

});
client.on('channelCreate', channel => {
    if (channel.guild === undefined) return;
    channel.guild.fetchAuditLogs({ type: 'CHANNEL_CREATE', limit: 1 })
        .then(logs => logs.entries.first())
        .then(entry => {

            let user = entry.executor;
            if (user.id === channel.guild.me.id) {
                return;
            }
            console.log(`channel ${channel.name} created by ${user.tag}`);
            if (user.id === channel.guild.ownerID || user.id === channel.guild.me.id) {
                return
            }
            let json_log = db.data(channel.guild.id)
            if (json_log.allow_action.includes("CHANNEL UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("CHANNEL UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("CHANNEL UPDATE")] === user.id)) return;
            if (json_log.OTHERS !== 1) return;
            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.LOG_CHANNEL_ID !== "" && channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Created Channel called ${channel.name}`))
            }
            if (channel.deletable) {
                channel.delete()
            }
            if (user.bot) {
                if (channel.guild.member(user).kickable) {
                    channel.guild.member(user).kick();
                }
            }
            else {
                let member = channel.guild.member(user);
                member.roles.cache.forEach(role => { if (channel.guild.me.hasPermission('ADMINISTRATOR') && role.id !== channel.guild.roles.everyone.id && role.position < channel.guild.me.roles.highest.position) { member.roles.remove(role, "created channel") } })
            }
        })
        .catch(error => console.error(error));

});
client.on('webhookUpdate', channel => {

    channel.guild.fetchAuditLogs({ type: 'WEBHOOK_CREATE', limit: 1 })
        .then(logs => logs.entries.first())
        .then(entry => {
            const dat = ParseTime(entry.createdTimestamp)
            const now_date = ParseTime(now)
            if (`${dat.days}${dat.hours}${dat.minutes}${dat.seconds}${dat.milliseconds / 5}` === `${now_date.days}${now_date.hours}${now_date.minutes}${now_date.seconds}${dat.milliseconds / 5}`) {
                let user = entry.executor;
                console.log(infoPrefix + `Webhook: Create by: <@${user.id}> | In Channel: ${channel.name}`);
                if (user.id === channel.guild.ownerID || user.id === channel.guild.me.id) {
                    return
                }
                let json_log = db.data(channel.guild.id)
                if (json_log.allow_action.includes("WEBHOOK UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("WEBHOOK UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("WEBHOOK UPDATE")] === user.id)) return;
                if (json_log.OTHERS !== 1) {
                    return;
                }
                if (json_log.white_list.includes(user.id)) {
                    return
                }
                if (json_log.LOG_CHANNEL_ID !== "" && channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                    channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Created Webhook ${entry.target.name} in channel ${channel.name}`))
                }
                if (user.bot) {
                    if (channel.guild.member(user).kickable) {
                        if (channel.guild.me.hasPermission('ADMINISTRATOR')) {
                            entry.target.delete()
                        }
                        return channel.guild.member(user).kick();
                    }
                }
                else {
                    let member = channel.guild.member(user);
                    if (channel.guild.me.hasPermission('ADMINISTRATOR')) {
                        entry.target.delete()
                    }
                    return member.roles.cache.forEach(role => { if (channel.guild.me.hasPermission('ADMINISTRATOR') && role.id !== channel.guild.roles.everyone.id && role.position < channel.guild.me.roles.highest.position) { member.roles.remove(role, "Ban more than ban limit") } })
                }
                delete entry;
            }
            channel.guild.fetchAuditLogs({ type: 'WEBHOOK_DELETE', limit: 1 })
                .then(logs => logs.entries.first())
                .then(entry => {
                    let user = entry.executor;

                    console.log(infoPrefix + `Webhook: Channel: ${channel.name} | Deleted by: ${user.tag}`);
                    if (user.id === channel.guild.ownerID || user.id === channel.guild.me.id) {
                        return
                    }
                    let json_log = db.data(channel.guild.id)
                    if (json_log.allow_action.includes("WEBHOOK UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("WEBHOOK UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("WEbHOOK UPDATE")] === user.id)) return;
                    if (json_log.white_list.includes(user.id)) {
                        return
                    }
                    if (json_log.LOG_CHANNEL_ID !== "" && channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                        channel.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Delected Webhook ${entry.target.name} in channel ${channel.name}`))
                    }
                    if (channel.guild.me.hasPermission('ADMINISTRATOR')) {
                        if (entry.target.avatarURL()) {
                            downloadEngine.downloadEngine(entry.target.avatarURL(), data => {
                                channel.createWebhook(entry.target.name, { avatar: `./${data}.png` })
                                    .then(webhook => {
                                        exec(`del ${data}.png`)
                                    })
                            })
                        }
                        else {
                            channel.createWebhook(entry.target.name)
                        }

                    }
                    if (user.bot) {
                        if (channel.guild.member(user).kickable) {
                            return channel.guild.member(user).kick();
                        }
                    }
                    else {
                        let member = channel.guild.member(user);
                        return member.roles.cache.forEach(role => { if (channel.guild.me.hasPermission('ADMINISTRATOR') && role.id !== channel.guild.roles.everyone.id && role.position < channel.guild.me.roles.highest.position) { member.roles.remove(role, "deleted webhook") } })
                    }
                })
        })
        .catch(error => console.error(error));

});
client.on('emojiCreate', emoji => {
    emoji.guild.fetchAuditLogs({ type: 'EMOJI_CREATE' })
        .then(logs => logs.entries.find(entry => entry.target.id == emoji.id))
        .then(entry => {
            let user = entry.executor;
            console.log(`emoji ${emoji.name} Created by ${user.tag}`);
            if (user.id === emoji.guild.ownerID || user.id === emoji.guild.me.id) {
                return
            }
            let json_log = db.data(emoji.guild.id)
            if (json_log.allow_action.includes("EMOJI UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("EMOJI UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("EMOJI UPDATE")] === user.id)) return;
            if (json_log.OTHERS !== 1) {
                return;
            }
            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.LOG_CHANNEL_ID !== "" && emoji.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                emoji.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Created EMOJI ${emoji.name}`))
            }
            if (emoji.deletable) {
                emoji.delete()
            }
            if (user.bot) {
                if (emoji.guild.member(user).kickable) {
                    emoji.guild.member(user).kick();
                }
            }
            else {
                let member = emoji.guild.member(user);
                member.roles.cache.forEach(role => { if (emoji.guild.me.hasPermission('ADMINISTRATOR') && role.id !== emoji.guild.roles.everyone.id && role.position < emoji.guild.me.roles.highest.position) { member.roles.remove(role, "Created Emoji and wasn't in whitelist") } })
            }
        })
        .catch(error => console.error(error));
});
client.on('emojiDelete', emoji => {
    emoji.guild.fetchAuditLogs({ type: 'EMOJI_DELETE' })
        .then(logs => logs.entries.find(entry => entry.target.id == emoji.id))
        .then(entry => {
            let user = entry.executor;
            console.log(`emoji ${emoji.name} Deleted by ${user.id}`);
            if (user.id === emoji.guild.ownerID || user.id === emoji.guild.me.id) {
                return
            }
            let json_log = db.data(emoji.guild.id)
            if (json_log.allow_action.includes("EMOJI UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("EMOJI UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("EMOJI UPDATE")] === user.id)) return;
            if (json_log.OTHERS !== 1) {
                return;
            }
            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.LOG_CHANNEL_ID !== "" && emoji.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                emoji.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Deleted EMOJI ${emoji.name}`))

            }
            if (emoji.guild.me.hasPermission('ADMINISTRATOR')) {
                downloadEngine.downloadEngine(emoji.url, data => {
                    emoji.guild.emojis.create(`./${data}.png`, emoji.name, { reason: "because someone removed this emoji" })
                        .then(emo => {
                            exec(`del ${data}.png`)
                        })
                })
            }
            if (user.bot) {
                if (emoji.guild.member(user).kickable) {
                    emoji.guild.member(user).kick();
                }
            }
            else {
                let member = emoji.guild.member(user);
                member.roles.cache.forEach(role => { if (emoji.guild.me.hasPermission('ADMINISTRATOR') && role.id !== emoji.guild.roles.everyone.id && role.position < emoji.guild.me.roles.highest.position) { member.roles.remove(role, "Created Emoji and wasn't in whitelist <a:qal:777127378253774858>") } })
            }
        })
        .catch(error => console.error(error));
})
client.on('guildBanAdd', guild => {
    let json_log = db.data(guild.id)
    if (json_log.ANTI_BAN !== 1) {
        return;
    }

    guild.fetchAuditLogs({ type: "MEMBER_BAN_ADD" })
        .then(Logs => {
            let user = Logs.entries.first().executor;
            if (user.id === guild.ownerID) {
                return
            }
            let json_log = db.data(guild.id)
            if (JSON.ANTI_BAN !== 1) {
                return;
            }
            if (json_log.white_list.includes(user.id)) {
                return
            }
            if (json_log.LOG_CHANNEL_ID !== "" && guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> kicked ${Logs.entries.first().target.tag}`))
            }
            if (user.bot) {
                if (guild.member(user).kickable) {
                    guild.member(user).kick();
                }
            }
            else {
                let member = guild.member(user);
                member.roles.cache.forEach(role => { if (guild.me.hasPermission('ADMINISTRATOR') && role.id !== guild.roles.everyone.id && role.position < guild.me.roles.highest.position) { member.roles.remove(role, "Ban more than ban limit") } })
            }
        })

});
client.on('guildMemberUpdate', (oldMember, member) => {
    const now = Date.now()
    if (oldMember.roles.cache.size === member.roles.cache.size) {
        return;
    }
    member.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" })
        .then(Logs => {
            let json_log = db.data(member.guild.id)
            let user = Logs.entries.first().executor;
            const dat = ParseTime(Logs.entries.first().createdTimestamp)
            const now_date = ParseTime(now)
            if (json_log.allow_action.includes("MEMBER ROLE UPDATE") && (json_log.allow_users[json_log.allow_action.indexOf("MEMBER ROLE UPDATE")] === null || json_log.allow_users[json_log.allow_action.indexOf("MEMBER ROLE UPDATE")] === user.id)) return;
            if (`${dat.days}${dat.hours}${dat.minutes}${dat.seconds}${dat.milliseconds / 5}` !== `${now_date.days}${now_date.hours}${now_date.minutes}${now_date.seconds}${dat.milliseconds / 5}`) return;
            if (user.id === member.guild.ownerID || user.id === client.user.id) {
                return
            }
            delete dat; delete now_date;
            if (json_log.OTHERS !== 1) return;
            if (json_log.white_list.includes(user.id)) {
                return;
            }
            if (json_log.LOG_CHANNEL_ID !== "" && member.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                member.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> Updated roles of ${member.user.tag}`))
            }
            if (oldMember.roles.cache.size > member.roles.cache.size) {
                oldMember.roles.cache.forEach(rol => {
                    if (!member.roles.cache.has(rol.id)) {
                        member.roles.add(rol)
                    }
                })
            }
            if (oldMember.roles.cache.size < member.roles.cache.size) {
                member.roles.cache.forEach(rol => {
                    if (!oldMember.roles.cache.has(rol.id)) {
                        member.roles.remove(rol)
                    }
                })
            }
            if (user.bot) {
                if (member.guild.member(user).kickable) {
                    member.guild.member(user).kick();
                }
            }
            else {
                let member_ = member.guild.member(user);
                member_.roles.cache.forEach(role => { if (member.guild.me.hasPermission('ADMINISTRATOR') && role.id !== member.guild.roles.everyone.id && role.position < member.guild.me.roles.highest.position) { member_.roles.remove(role, "Ban more than ban limit") } })
            }
        })
});
client.on('guildMemberAdd', member => {
    if (member.user.bot) {
        member.guild.fetchAuditLogs({ type: "BOT_ADD" })
            .then(Logs => {
                let json_log = db.data(member.guild.id)
                let user = Logs.entries.first().executor;
                if (user.id === member.guild.ownerID || user.id === client.user.id) {
                    return
                }
                if (json_log.OTHERS !== 1) return;
                if (json_log.white_list.includes(user.id)) {
                    return;
                }
                if (member.kickable) {
                    member.kick()
                }
                if (json_log.LOG_CHANNEL_ID !== "" && member.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                    member.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> added bot called ${member.user.tag}`))
                }
                let member_ = member.guild.member(user);
                member_.roles.cache.forEach(role => { if (member.guild.me.hasPermission('ADMINISTRATOR') && role.id !== member.guild.roles.everyone.id && role.position < member.guild.me.roles.highest.position) { member_.roles.remove(role, "Added bot") } })
            })
    }
});
/*client.on("voiceStateUpdate", (old_channel, channel) => {
    if (old_channel.id === channel.id) {
        return;
    }
    let json_ = db.data(channel.guild.id)
    if (json_.OTHERS !== 1) return;
    if (!channel) {
        channel.guild.fetchAuditLogs({ type: "MEMBER_DISCONNECT", limit: 1 })
            .then(log => {
                const entry = log.entries.first()
                const json_log = db.data(channel.guild.id)
                if (json_log.LOG_CHANNEL_ID !== "" && member.guild.channels.cache.get(json_log.LOG_CHANNEL_ID) !== null) {
                    const user = entry.executor;
                    member.guild.channels.cache.get(json_log.LOG_CHANNEL_ID).send(new Discord.MessageEmbed().setColor(0x00d423).setDescription(`<a:__:777127532079742976> <@${user.id}> disconnected ${entry.target.tag} from ${old_channel.name}`))
                }
            })
    }
});*/
client.on("guildCreate", guild => {
    guild.members.cache.get(guild.ownerID).send({ embed: { color: 0x99ffcc, title: "Thanks for adding me in your server!", fields: [{ name: "Support server link", value: "[Sec+ Support Server](https://discord.gg/4bQfYfyxJr)" }] } })
    db.create(guild.id)
});
client.on("guildDelete", guild => {
    db.delete(guild.id)
});
client.login("TOKEN")
