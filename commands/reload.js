try{
module.exports = {
    name: 'reload',
    execute(message)
    {
        const db = require('./../db')
        const PREFIX = db.data(message.guild.id)
        const args = message.content.slice(PREFIX).trim().split(/ +/);
        delete db;
        if(message.author.id !== '462847922330140692' && message.author.id !== '553139953597677568')
        {
            return message.channel.send({embed: {fields: [{name: 'Error 0x403: this command isnt avaible for other peoples <a:qal:777127378253774858>',value: 'only DEV\'s',}]}})
        }
        if(args.length === 1)
        {
            return message.channel.send({embed: {title: "please enter which command to reload <a:qal:777127378253774858>"}})
        }
        if (!args.length) return message.channel.send(`You didn't pass any command to reload, ${message.author}! <a:qal:777127378253774858>`);
        const commandName = args[1].toLowerCase();
        const command = message.client.commands.get(commandName)

        if (!command) return message.channel.send(`There is no command with name \`${commandName}\`, ${message.author}! <a:qal:777127378253774858>`);
        delete require.cache[require.resolve(`./${command.name}.js`)];
        try {
            const newCommand = require(`./${command.name}`);
            message.client.commands.set(newCommand.name, newCommand);
            message.channel.send('reloaded successfully <a:tami:777128773480742932>')
        } catch (error) {
            console.error(error);
            message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\` <a:qal:777127378253774858>`);
        }
    }
}
}catch(err){
    console.log(err)
}