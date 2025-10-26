const mysql =require('mysql2')

const pool = mysql.createPool({
    connectionLimit: 10,
    host        :'202.28.34.203',
    user        :'mb68_65011212116',
    password    :'4fs5$$qozC^O',
    database    :'mb68_65011212116',

});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', err.message);
    } else {
        console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');
        connection.release();
    }
});

module.exports = pool;
