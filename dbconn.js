const mysql =require('mysql2')

const pool = mysql.createPool({
    connectionLimit: 10,
    host        :'sql.freedb.tech',
    user        :'freedb_attdb',
    password    :'ya!CbE$&j!v66TG',
    database    :'freedb_Gameshop',

});

module.exports = pool;