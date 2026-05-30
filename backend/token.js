import jwt from 'jsonwebtoken'
import db from './db.js'

const secret = 'my_secret_key'

// 生成 token 函数
export const generateToken = (Info) => {
  // Info 是你要加密的用户信息
  return jwt.sign(Info, secret, { expiresIn: '24h' })
}

// 验证 Token 的中间件
export const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']
  if (!token) return res.status(401).send({ code: 401, message: '无权限访问' })

  try {
    const user = jwt.verify(token, secret)

    // 检查普通用户是否被禁用
    if (user.role === 'user') {
      const [rows] = await db.query('SELECT status FROM usersinfo WHERE username = ?', [user.username])
      if (rows.length > 0 && Number(rows[0].status) === 0) {
        return res.status(403).send({ code: 403, message: '账号已被禁用' })
      }
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(403).send({ code: 403, message: 'Token 已过期或无效' })
  }
}

// 管理员权限校验中间件
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ code: 403, message: '无权访问' })
  }
  next()
}
