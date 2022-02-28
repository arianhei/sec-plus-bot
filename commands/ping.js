module.exports = {
    name: "ping",
    description : "get bot ping legacy <a:tik3:777128127804735518>",
    execute(message) {
            const ping = require('jjg-ping')
            ping.system.ping('discord.com', function (latency, status) {
                if (status) {
                    // Host is reachable/up. Latency should have a value.
                    message.channel.send({ embed: { title: 'Ping (' + latency + ' ms ping).', color: "GREEN" } });
                }
                else {
                    // Host is down. Latency should be 0.
                    console.log({ embed: { title: 'Ping is unreachable.' } });
                }

            })
    }
};