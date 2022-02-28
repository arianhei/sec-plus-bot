try{
module.exports = {
    name: 'rr',
    description: 'Remove role of member or everyone <a:tik3:777128127804735518>',
    execute(message)
    {
        const db = require('../db')
        const json_log = db.data(message.guild.id)
        if (!(json_log.white_list.includes(message.author.id) || message.author.id === message.guild.ownerID)) {
            return message.channel.send({ embed: { title: "you arent a part of whitelist <a:down:777128205991280640>", color: 0xfc2003 } })
        }
        
        const args = message.content.slice(json_log.PREFIX).trim().split(/ +/);
        delete db;
        if (args.length === 1) {
            return message.channel.send({ embed: { title: "Error 0x504: you forgot to mention member <a:qal:777127378253774858>", description: `Ex: ${json_log.PREFIX}rg \`@everyone\` \`@role\`` } })
        }
        if (args[1] === "all" || args[1] === "@everyone") {
            const r = message.mentions.roles
            if (r.first() === undefined) {
                return message.channel.send({ embed: {title: "ERROR 0x505: you forgot to mention role! <a:qal:777127378253774858>", description: `Ex: ${json_log.PREFIX}rg \`@everyone\` \`@role\``} })
            }
            r.forEach(ro=>{
                if(ro.managed){
                    return message.channel.send({embed: {title: `Error 0x707: i cant give a ${ro.name} because i detected its for bot <a:qal:777127378253774858>`}})
                }
                if(ro.position < message.guild.me.roles.highest.position)
                {
                    message.guild.members.cache.forEach(member => {
                        if(member.roles.cache.get(ro.id) !== null)
                        {
                            member.roles.remove(ro)
                        }
                    })
                    message.channel.send({embed: {title: `Removed ${ro.name} successfully <a:tik4:777128881450647553>`}})
                }
                else{
                    return message.channel.send({embed: {description: `Error 0x506: i cant remove a ${ro.name} because its higher than my role <a:qal:777127378253774858>`}})
                }
            });
        }
        else {
            const r = message.mentions.roles
            if (r.first() === undefined) {
                return message.channel.send({embed: {title: "Error 0x505: you forgot to mention role! <a:qal:777127378253774858>", description: `Ex: ${json_log.PREFIX}gr \`@everyone\` \`@role\``}})
            }
            let user = message.mentions.users.first()
            if(!user)
            {
                return message.channel.send({embed: {title: "user not found <a:qal:777127378253774858>"}})
            }
            if(!member)
            {
                return message.channel.send({embed: {title: "member not found <a:qal:777127378253774858>"}})
            }
            if(member.user.id === message.author.id)
            {
                return message.channel.send({embed: {title: 'Error 0x204: you can\'t give role to your self <a:qal:777127378253774858>'}})
            }
            if(member.id === message.guild.me.id)
            {
                return message.channel.send({embed: {title: "i cant give role to myself <a:qal:777127378253774858>"}})
            }
            let t = false;
            message.members.cache.filter(m => m.user.bot).forEach()
            if(t)
            {
                return message.channel.send({embed: {title: "Error 0x303: detected that the role is for a bot <a:qal:777127378253774858>"}})
            }
            let member = message.guild.member(user)
            r.forEach(ro => {
                if(ro.managed){
                    return message.channel.send({embed: {title: `Error 0x707: i cant give a ${ro.name} because i detected its for bot <a:qal:777127378253774858>`}})
                }
                if(ro.position < message.guild.me.roles.highest.position)
                {
                    if(member.roles.cache.has(ro.id)){
                        member.roles.remove(ro)
                    }
                    message.channel.send({embed: {title: `Removed ${ro.name} successfully <a:tik4:777128881450647553>`}})
                }
                else{
                    return message.channel.send({embed: {description: `Error 0x506: i cant remove a ${ro.name} because its higher than my role <a:qal:777127378253774858>`}})
                }
            });
        }
    }
}
}catch(err){
    console.log(err)
}