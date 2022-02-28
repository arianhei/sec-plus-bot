try{
module.exports={
    name: "support",
    description: 'sec+ server and support <a:tik3:777128127804735518>',
    execute(message){
        message.channel.send({embed:{color:"GREEN",description:"Got It <a:tik4:777128881450647553>"}})//{name:"Bot Link",value:"[Sec+ Bot Link](https://discord.com/oauth2/authorize?client_id=680136567066853380&scope=bot&permissions=1945632250) <a:tik5:777840801136640012>",inline:true}
        message.author.send({embed: {color: 0x99ffcc, title:"SEC+ Support", fields:[{name: "Support server link", value: "[Sec+ Support Server](https://discord.gg/kWVVtgXHCx) <a:tik5:777840801136640012>",inline:true}]}})
    }
}
}catch(err){
    console.log(err)
}