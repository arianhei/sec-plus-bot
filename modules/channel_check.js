module.exports = {
    getOverwrites: (channel) => {
        return channel.permissionOverwrites.map(overwrite => { const { allow, deny, type } = overwrite; return { allow, deny, type } });
    },
    compareOverwrites: (original, compare) => {
        if (original.size !== compare.size) return true;
        original.permissionOverwrites.forEach(perm =>{
            if(perm.deny !== compare.permissionOverwrites.get(perm.id).deny || perm.deny !== compare.permissionOverwrites.get(perm.id).deny)
            {
                return true
            }
        })
        return false;
    }
}