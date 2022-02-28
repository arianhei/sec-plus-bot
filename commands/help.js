module.exports = {
    name: 'help',
    description: 'Get bot help menu',
    execute(message){
        let colorran = [0xccffcc,0x66ff99,0xffffff,0xff99ff,0x99ff99,0x00ffff,0xffccff]
        let json_log = require('./../db').data(message.guild.id)
        const com = message.content.slice(json_log.PREFIX).trim().split(/ +/)[1];
        if(com === null || com === undefined)
        {
            let d = {image:"https://cdn.discordapp.com/attachments/749979396051435571/777193772840255488/help.gif",color:colorran[Math.floor(Math.random() * colorran.length)],title: "HELP",fields: []}
            message.client.commands.forEach(c => {
                if(c.name !== "reload") d.fields.push({name: c.name, value: c.description,inline:true});
            })
            d.fields.push({name: "Support server link", value: "[Sec+ Support Server](https://discord.gg/9xFRDEZXmu)",inline:true},{name:"Bot Invite Link",value:"[Click Here](https://YOUR_INVITE_LINK)",inline:true});
            message.channel.send({embed : d})
        }
        else{
            let d = {color:0x99ff99,title: "HELP",fields: []}
            let c =message.client.commands.get(com)
            if(c)
            {
                if(c.name !== "reload") d.fields.push({name: c.name, value: c.description,inline:true});
                message.channel.send({embed: d})
            }
            else{
                message.channel.send({embed : {title:`Error 0x304: No command found with this name`}})
            }
        }
    }
}
