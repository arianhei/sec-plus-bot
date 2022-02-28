const {readFileSync, writeFile} = require('fs');
const {exec} = require('child_process');
const sqlite = require('better-sqlite3')('logs.db');
const db = require('sqlite3');
const sql = new db.Database('./logs.db');
module.exports = {
    get: (x, callback) =>
    {
        let xy = JSON.parse(readFileSync(`./logs/${x}.json`));
        let row = sqlite.prepare(`SELECT * FROM sec WHERE GUILD_ID=${x}`).get();
        row.white_list = xy.white_list;
        row.role_mention_block = xy.role_mention_block;
        callback(row)
    },
    data : x =>
    {
        let xy = JSON.parse(readFileSync(`./logs/${x}.json`));
        let row = sqlite.prepare(`SELECT * FROM sec WHERE GUILD_ID=${x}`).get();
        row.white_list = xy.white_list;
        row.role_mention_block = xy.role_mention_block;
        row.allow_action = xy.allow_action;
        row.allow_users = xy.allow_users;
        return row;
    },
    set_data: (y, x, id) => {
        if(y === "prefix")
        {
            sqlite.prepare(`UPDATE sec SET PREFIX=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "blockmention")
        {
            let j = JSON.parse(readFileSync(`./logs/${id}.json`))
            j.role_mention_block.push(x)
            writeFile(`./logs/${id}.json`, JSON.stringify(j), function(err){
                if(err)console.log(err);
            })
        }
        if(y === "blockmention remove"){
            let j = JSON.parse(readFileSync(`./logs/${id}.json`))
            let me = j.role_mention_block.indexOf(x)
            let role_mention_block = j.role_mention_block;
            delete j.role_mention_block;
            j.role_mention_block = []
            for (let i = 1; i<= role_mention_block.length; i++)
            {
                if(i !== me + 1)
                {
                    j.role_mention_block.push(role_mention_block[i - 1])
                }
            }
            writeFile(`./logs/${id}.json`, JSON.stringify(j), function(err){
                if(err)console.log(err);
            })
        }
        if(y === "whitelist")
        {
            let j = JSON.parse(readFileSync(`./logs/${id}.json`))
            j.white_list.push(x)
            writeFile(`./logs/${id}.json`, JSON.stringify(j), function(err){
                if(err)console.log(err);
            })
        }
        if(y === "whitelist remove")
        {
            let j = JSON.parse(readFileSync(`./logs/${id}.json`))
            let whitelist = j.white_list;
            delete j.white_list;
            j.white_list = []
            for (let i = 0; i< whitelist.length; i++)
            {
                if(whitelist[i] !== x)
                {
                    j.white_list.push(whitelist[i])
                }
            }
            writeFile(`./logs/${id}.json`, JSON.stringify(j), function(err){
                if(err)console.log(err);
            })
        }
        if(y === "channellog")
        {
            sqlite.prepare(`UPDATE sec SET LOG_CHANNEL_ID=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "muterole")
        {
            sqlite.prepare(`UPDATE sec SET MUTE_ID=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "unmuterole")
        {
            sqlite.prepare(`UPDATE sec SET UNMUTE_ID=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "mutetime")
        {
            sqlite.prepare(`UPDATE sec SET MUTE_TIME=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "spam")
        {
            sqlite.prepare(`UPDATE sec SET ANTI_SPAM=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "mention")
        {
            sqlite.prepare(`UPDATE sec SET ANTI_MENTION=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "antikick")
        {
            sqlite.prepare(`UPDATE sec SET ANTI_KICK=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "antiban")
        {
            sqlite.prepare(`UPDATE sec SET ANTI_BAN=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "others")
        {
            sqlite.prepare(`UPDATE sec SET OTHERS=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "link")
        {
            sqlite.prepare(`UPDATE sec SET ANTI_LINK=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "attachment")
        {
            sqlite.prepare(`UPDATE sec SET ANTI_AT=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "add")
        {
            sqlite.prepare(`UPDATE sec SET ANTI_AD=? WHERE GUILD_ID=?`).run(x, id)
        }
        if(y === "limit")
        {
            sqlite.prepare(`UPDATE sec SET SPAM_LIMIT=? WHERE GUILD_ID=?`).run(x, id)
        }
    },
    allow: (y, id, g_id , mode, num) => {
        if(y === "edit")
        {
            let __d__ = JSON.parse(readFileSync(`./logs/${g_id}.json`));
            __d__.allow_action[num] = mode
            __d__.allow_users[num] = id
            writeFile(`./logs/${g_id}.json`, JSON.stringify(__d__), function(err){
                if(err) console.log(err)
            })
        }if(y === "delete")
        {
            let __d__ = JSON.parse(readFileSync(`./logs/${g_id}.json`));
            let d = {};d.allow_action = __d__.allow_action;d.allow_users = __d__.allow_users;
            delete __d__.allow_users; delete __d__.allow_action;
            __d__.allow_action = []; __d__.allow_users=[]
            for(let i =0; i< d.allow_action.length; i++)
            {
                if(i !== num) {
                    __d__.allow_action.push(d.allow_action[i]);
                    __d__.allow_users.push(d.allow_users[i])
                }
            }
            writeFile(`./logs/${g_id}.json`, JSON.stringify(__d__), function(err){
                if(err) console.log(err)
            })
        }

        if(y === "create")
        {
            let __d__ = JSON.parse(readFileSync(`./logs/${g_id}.json`))
            __d__.allow_action.push(mode)
            __d__.allow_users.push(id)
            writeFile(`./logs/${g_id}.json`, JSON.stringify(__d__), function(err){
                if(err) console.log(err)
            })
        }
    },
    create : id => {
        sql.run(`INSERT INTO sec(GUILD_ID, LOG_CHANNEL_ID, MUTE_ID, UNMUTE_ID, MUTE_TIME, ANTI_SPAM, SPAM_LIMIT, ANTI_AD, ANTI_AT, ANTI_LINK, ANTI_MENTION, ANTI_KICK, ANTI_BAN, OTHERS, PREFIX) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [id, "", "", "", "50s", 0, 1,0,0,0,0,1,1,0,"s!"])
        exec(`echo {"role_mention_block":[],"white_list":[], "allow_action":[], "allow_users":[]} > logs/${id}.json`)
    },
    delete : id => {
        exec(`del logs\\${id}.json`)
        sqlite.prepare(`DELETE FROM sec WHERE GUILD_ID=?`).run(id)
    }
};