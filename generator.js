module.exports = {
    gen(length)
    {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}