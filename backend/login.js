import express from 'express'
import { generateToken } from './token.js'
import bcrypt from 'bcryptjs'
import db from './db.js'

const router = express.Router()

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body
  const userRole = role

  try {
    // 根据角色选择对应的表
    const tableName = userRole === 'admin' ? 'admininfo' : 'usersinfo'

    // 1. 查询数据库中是否存在该用户
    const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE username = ?`, [username])
    const user = rows[0]

    if (user) {
      // 2. 检查用户是否被禁用（仅普通用户）
      if (userRole === 'user' && Number(user.status) === 0) {
        return res.status(403).send({ code: 403, message: '账号已被禁用，请联系管理员' })
      }

      // 3. 用户存在，进行密码比对
      const isMatch = await bcrypt.compare(password, user.password)

      if (isMatch) {
        // 验证成功，生成 Token
        const token = generateToken({ username, role: userRole })

        res.send({
          code: 200,
          message: '登录成功',
          token,
        })
      } else {
        // 密码错误
        res.status(401).send({ code: 401, message: '账号或密码错误' })
      }
    } else {
      // 3. 管理员不允许注册
      if (userRole === 'admin') {
        return res.status(401).send({ code: 401, message: '管理员无法注册' })
      }

      // 4. 普通用户不存在，无账号登录即注册
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // 将新用户存入对应的数据表，默认启用状态(status=1)
      await db.query(`INSERT INTO ${tableName} (username, password, status) VALUES (?, ?, ?)`, [
        username,
        hashedPassword,
        '1',
      ])

      // 注册成功后，直接为其生成并下发 Token，实现"注册即登录"
      const token = generateToken({ username, role: userRole })

      res.send({
        code: 200,
        message: '注册并登录成功',
        token,
      })
    }
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

export default router
