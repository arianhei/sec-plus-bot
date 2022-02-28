module.exports = {
    name: 'oa',
    description: 'Open all channels',
    execute(message) {
        const db = require('../db');
        const json_log = db.data(message.guild.id);
        delete db;
        if (!(json_log.white_list.includes(message.author.id) || message.author.id === message.guild.ownerID)) {
            return message.channel.send({ embed: { title: "you arent a part of whitelist <a:down:777128205991280640>", color: 0xfc2003 } });
        }
        message.guild.channels.cache.filter(channel => channel.type === "voice" || channel.type === "text").forEach(channel => {
            channel.updateOverwrite(message.guild.roles.everyone, {
                SEND_MESSAGES: null,
                VIEW_CHANNEL: null,
            })
        });
        return message.channel.send({embed : {title: "completed"}});
    }
}
