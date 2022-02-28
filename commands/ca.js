module.exports = {
    name: 'ca',
    description: 'Close all channels',
    execute(message) {
        const db = require('../db')
        const json_log = db.data(message.guild.id)
        delete db;
        if (!(json_log.white_list.includes(message.author.id) || message.author.id === message.guild.ownerID)) {
            return message.channel.send({ embed: { title: "you arent a part of whitelist <a:down:777128205991280640>", color: 0xfc2003 } })
        }
        message.channel.send({ embed: { fields: [{ name: 'Do you want hide channels ?', value: "type 1 (yes) or 0 (no)" }] } }).then(() => {
            const filter = m => m.author.id === message.author.id || m.content === "1" || m.content === "0";
            message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] }).then(collected => {
                message.guild.channels.cache.filter(channel => channel.type === "voice" || channel.type === "text").forEach(channel => {
                    channel.updateOverwrite(message.guild.roles.everyone, { 
                        SEND_MESSAGES: false,
                        CONNECT: false
                    })
                })
                if (collected.first().content === "1") {
                    message.guild.channels.cache.filter(channel => channel.type === "voice" || channel.type === "text").forEach(channel => {
                        channel.updateOverwrite(message.guild.roles.everyone, { VIEW_CHANNEL: false })
                    })
                }
                message.channel.send({embed : {title:"completed <a:tik4:777128881450647553>"}})
            }).catch(collected => {
                message.channel.send('your time finished <a:qal:777127378253774858>');
            });
        });
    }
}
