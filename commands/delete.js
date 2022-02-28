module.exports={
    name: "delete",
    description: 'Delete a number of messages <a:tik3:777128127804735518>',
    execute(message){
        const db = require('./../db');
        let json_log = db.data(message.guild.id);
        if(!(json_log.white_list.includes(message.author.id) || message.author.id === message.guild.ownerID))
        {
            return message.channel.send({embed: {title: "you arent a part of whitelist <a:qal:777127378253774858>", color: 0xfc2003}})
        }
        const args = message.content.slice(json_log.PREFIX).trim().split(/ +/);
        if(args.length === 1)
        {
            return message.channel.send({embed: {title: "Error 0x504: you forgot to enter how many message to delete <a:down:777128205991280640>", description :`Ex: ${json_log.PREFIX}delete 5`}})
        }
        let num = parseInt(args[1])
        delete args;
        if(num > 99)
        {
            for (let i = 0; i <= num; i+= 100)
            {
                if(num - i > 100){
                    message.channel.bulkDelete(100).catch(error => {message.channel.send({embed: {title : "Error happend while deleting message <a:qal:777127378253774858>"}}).then(msg => msg.delete({timeout: 600}))})
                }
                else{
                    if(num - i === 0) return;
                    message.channel.bulkDelete(num - i).catch(error => {message.channel.send({embed: {title : "Error happend while deleting message <a:qal:777127378253774858>"}}).then(msg => msg.delete({timeout: 600}))})
                }
            }
        }
        else {
            message.channel.bulkDelete(num).catch(error => {message.channel.send({embed: {title : "Error happend while deleting message <a:qal:777127378253774858>"}}).then(msg => msg.delete({timeout: 600}))})
        }
    }
}