module.exports = {
    name: "ping",
    description : "get bot ping legacy",
    execute(message) {
            const ping = require('jjg-ping');
            ping.system.ping('discord.com', function (latency, status) {
                if (status) {
                    // Host is reachable/up. Latency must have a value.
                    message.channel.send({ embed: { title: 'Ping (' + latency + ' ms ping).', color: "GREEN" } });
                }
                else {
                    // Host is down.
                    console.log({ embed: { title: 'Ping is unreachable.' } });
                }

            })
    }
};
