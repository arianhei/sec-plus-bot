module.exports = {
    name: 'gr',
    description: 'Give role to member or everyone',
    execute(message) {
        const db = require('../db');
        const json_log = db.data(message.guild.id);
        if (!(json_log.white_list.includes(message.author.id) || message.author.id === message.guild.ownerID)) {
            return message.channel.send({ embed: { title: "you arent a part of whitelist", color: 0xfc2003 } })
        }
        
        const args = message.content.slice(json_log.PREFIX).trim().split(/ +/);
        delete db;
        if (args.length === 1) {
            return message.channel.send({ embed: { title: "Error 0x504: you forgot to mention member", description: `Ex: ${json_log.PREFIX}rg \`@everyone\` \`@role\` ` } })
        }
        if (args[1] === "all" || args[1] === "@everyone") {
            const ro = message.mentions.roles
            if (ro === null) {
                return message.channel.send({ embed: {title: "ERROR 0x505: you forgot to mention role!", description: `Ex: ${json_log.PREFIX}rg \`@everyone\` \`@role\``} })
            }
            ro.forEach(ro => {
                if(ro.managed){
                    return message.channel.send({embed: {title: `Error 0x707: i cant give a ${ro.name} because i detected its for bot`}})
                }
                if(ro.position < message.guild.me.roles.highest.position)
                {
                    message.guild.members.cache.forEach(member => {
                        if(member.id !== message.guild.me.id)
                        {
                            member.roles.add(ro)
                        }
                    })
                    message.channel.send({embed: {title: `Gave ${ro.name} Successfully <a:tik4:777128881450647553>`}})
                }
                else{
                    return message.channel.send({embed: {description: `Error 0x506: i cant give a ${ro.name} because its higher than my role <a:qal:777127378253774858>`}})
                }
            });
        }
        else {
            let r = message.mentions.roles;
            if (r.first() === undefined) {
                return message.channel.send({embed: {title: "Error 0x505: you forgot to mention role!", description: `Ex: ${json_log.PREFIX}gr \`@everyone\` \`@role\``}})
            }
            let user = message.mentions.users.first()
            if(!user)
            {
                return message.channel.send()
            }
            let member = message.guild.member(user)
            if(!member)
            {
                return message.channel.send({embed: {title: "member not found"}})
            }
            if(member.user.id === message.author.id)
            {
                return message.channel.send({embed: {title: 'Error 0x204: you can\'t give role to your self'}})
            }
            if(member.id === message.guild.me.id)
            {
                return message.channel.send({embed: {title: "i cant give role to myself"}})
            }
            
            r.forEach(ro => {
                if(ro.managed){
                    return message.channel.send({embed: {title: `Error 0x707: i cant give a ${ro.name} because i detected its for bot`}})
                }
                if(ro.position < message.guild.me.roles.highest.position)
                {
                    member.roles.add(ro);
                }
                else{
                    return message.channel.send({embed: {description: `Error 0x506: i cant give a ${ro.name} because its higher than my role`}});
                }
                message.channel.send({embed: {title: `Gave ${ro.name} Successfully`}});
            });
        }
    }
}
