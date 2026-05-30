import express from 'express'
import db from './db.js'
import { authenticateToken, requireAdmin } from './token.js'
import bcrypt from 'bcryptjs'

const router = express.Router()

// 获取当前登录用户信息
router.get('/user/info', authenticateToken, async (req, res) => {
  const { username } = req.user
  try {
    const [rows] = await db.query('SELECT id, username, created_at as createdAt FROM usersinfo WHERE username = ?', [username])
    if (rows.length === 0) {
      return res.status(404).send({ code: 404, message: '用户不存在' })
    }
    res.send({
      code: 200,
      message: '获取成功',
      data: rows[0],
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 重置密码
router.put('/user/password', authenticateToken, async (req, res) => {
  const { username } = req.user
  const { password } = req.body

  if (!password || password.length < 6) {
    return res.status(400).send({ code: 400, message: '密码长度至少为6位' })
  }

  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    await db.query('UPDATE usersinfo SET password = ? WHERE username = ?', [hashedPassword, username])
    res.send({
      code: 200,
      message: '密码重置成功',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 管理员获取用户列表（支持搜索）
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  const { keyword } = req.query
  try {
    let sql = 'SELECT id, username, status, created_at as createdAt FROM usersinfo'
    let params = []
    if (keyword) {
      sql += ' WHERE username LIKE ?'
      params.push(`%${keyword}%`)
    }
    sql += ' ORDER BY id ASC'
    const [rows] = await db.query(sql, params)
    // 将 status 转为整数
    const list = rows.map((row) => ({ ...row, status: Number(row.status) }))
    res.send({
      code: 200,
      message: '获取成功',
      data: list,
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 管理员修改用户状态（封禁/解封）
router.put('/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (status !== 0 && status !== 1) {
    return res.status(400).send({ code: 400, message: '状态值必须为 0 或 1' })
  }

  try {
    const [result] = await db.query('UPDATE usersinfo SET status = ? WHERE id = ?', [status, id])
    if (result.affectedRows === 0) {
      return res.status(404).send({ code: 404, message: '用户不存在' })
    }
    res.send({
      code: 200,
      message: status === 1 ? '用户已启用' : '用户已禁用',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 管理员删除用户
router.delete('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query('DELETE FROM usersinfo WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).send({ code: 404, message: '用户不存在' })
    }
    res.send({
      code: 200,
      message: '删除成功',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 管理员重置用户密码
router.put('/admin/users/:id/password', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { password } = req.body

  if (!password || password.length < 6) {
    return res.status(400).send({ code: 400, message: '密码长度至少为6位' })
  }

  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const [result] = await db.query('UPDATE usersinfo SET password = ? WHERE id = ?', [hashedPassword, id])
    if (result.affectedRows === 0) {
      return res.status(404).send({ code: 404, message: '用户不存在' })
    }
    res.send({
      code: 200,
      message: '密码重置成功',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

export default router
