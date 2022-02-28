const { RichEmbed } = require('discord.js');
const { Embed } = require('./utils');
let Theme_Color = parseInt("#fffff", 16);
let Error_Color = parseInt("#f52c2c", 16);

module.exports = embedOptions => {
    const format = (text, max) => {
        return text
            .toString()
            .slice(0, max);
    }
    const embed = {}
    if(embedOptions.Title)
    {
        embed.title = embedOptions.title;
    }
    if(embedOptions.color)
    {
        embed.color = parseInt(embed.color.replace(/#/g, ''), 16);
    }
    if(embedOptions.footer && typeof footer === "string")
    {
        embed.footer = { text: embedOptions.footer}
        if(embedOptions.footer_icon && typeof footer === "string")
        {
            embed.footer.icon_url = embedOptions.footer_icon
        }
    }
    return embed
}
