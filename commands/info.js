try{
module.exports ={
    name: "info",
    description: "Get all info about data's in your server <a:tik3:777128127804735518>",
    execute(message){
        const db = require('./../db')
        let data = db.data(`${message.guild.id}`)
        message.channel.send({embed: {color:0xf2f2f2,title:"information of bot config <a:set:777128025132236820>",footer: {text: `info created by: ${message.author.tag}`,icon_url: message.author.avatarURL()},fields:[{name: "LOG CHANNEL", value:(data.LOG_CHANNEL_ID !== "")?`<#${data.LOG_CHANNEL_ID}>`:`NONE`, inline: true}, {name :"MUTE ROLE", value: (data.MUTE_ID !== "")?`<@&${data.MUTE_ID}>`:`NONE`, inline: true},{name :"UNMUTE ROLE", value: (data.UNMUTE_ID !== "")?`<@&${data.UNMUTE_ID}>`:`NONE`, inline: true}, {name:"MUTE TIME", value:(data.ANTI_SPAM === 1 || data.ANTI_AD ===1 || data.ANTI_LINK === 1 || data.ANTI_AT ===1)?`${data.MUTE_TIME}`:`mute time is useless`, inline : true}, {name:"SPAM LIMIT", value:(data.ANTI_SPAM === 1)?`${((data.SPAM_LIMIT -2) + 5) * 20}%`:`antispam is off`, inline : true}, {name:"ANTI SPAM", value:(data.ANTI_SPAM===1)?`\`on\``:`\`off\``, inline : true},{name:"ANTI LINK", value:(data.ANTI_LINK===1)?`\`on\``:`\`off\``, inline:true},{name:"ATTACHMENT", value:(data.ANTI_AT===1)?`\`on\``:`\`off\``, inline:true},{name:"ANTI ADD", value:(data.ANTI_AD===1)?`\`on\``:`\`off\``, inline:true},{name:"ANTI MENTION", value:(data.ANTI_MENTION===1)?`\`on\``:`\`off\``, inline:true},{name:"ANTI KICK", value:(data.ANTI_KICK===1)?`\`on\``:`\`off\``, inline:true},{name:"ANTI BAN", value:(data.ANTI_BAN===1)?`\`on\``:`\`off\``, inline:true},{name:"OTHERS", value:(data.OTHERS===1)?`\`on\``:`\`off\``, inline:true},{name:"WHITE LIST", value:(data.white_list.length!==0)?`${data.white_list.map(n => `\n<@${n}>`)}`:`NO MEMBER`, inline:true},{name:"MENTION BLOCK", value:(data.role_mention_block.length!==0)?`${data.role_mention_block.map(n => `\n<@&${n}>`)}`:`NONE`, inline:true}]}})
    }
}
}catch(err){
    console.log(err)
}