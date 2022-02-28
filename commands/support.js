module.exports={
    name: "support",
    description: 'sec+ server and support',
    execute(message){
        message.channel.send({embed:{color:"GREEN",description:"Got It"}})
        message.author.send({embed: {color: 0x99ffcc, title:"SEC+ Support", fields:[{name: "Support server link", value: "[Sec+ Support Server](https://discord.gg/kWVVtgXHCx)",inline:true}]}})
    }
}
