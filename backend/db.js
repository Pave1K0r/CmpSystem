import mysql from 'mysql2'

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'Graduation',
  waitForConnections: true, // 当无连接池可用时等待
  connectionLimit: 10, // 最大连接数限制
  queueLimit: 0,
})

const promisePool = pool.promise()

pool.getConnection((err, connection) => {
  if (err) {
    console.error('数据库连接失败! 错误信息:', err.message)
  } else {
    console.log('成功连接到 MySQL 数据库')
    connection.release() // 释放连接回连接池
  }
})

export default promisePool
