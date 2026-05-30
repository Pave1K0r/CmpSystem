import express from 'express'
import db from './db.js'
import { authenticateToken, requireAdmin } from './token.js'

const router = express.Router()

// 获取房屋列表
router.get('/houses', authenticateToken, async (req, res) => {
  try {
    const { role, username } = req.user
    let sql = 'SELECT id, user_house as username, location, total_area as totalArea, public_area as sharedArea, description as info, created_at as createdAt FROM houseinfo'
    let params = []

    // 普通用户只能看到自己的房屋
    if (role === 'user') {
      sql += ' WHERE user_house = ?'
      params.push(username)
    }

    sql += ' ORDER BY id DESC'
    const [rows] = await db.query(sql, params)
    res.send({
      code: 200,
      message: '获取成功',
      data: rows,
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 新增房屋（仅管理员可用，需指定用户）
router.post('/houses', authenticateToken, requireAdmin, async (req, res) => {
  const { username, location, totalArea, sharedArea, info } = req.body

  if (!username || username.trim().length === 0) {
    return res.status(400).send({ code: 400, message: '请选择用户' })
  }

  if (!location || !totalArea || !sharedArea || !info) {
    return res.status(400).send({ code: 400, message: '参数不完整' })
  }

  try {
    const [result] = await db.query(
      'INSERT INTO houseinfo (user_house, location, total_area, public_area, description) VALUES (?, ?, ?, ?, ?)',
      [username.trim(), location, totalArea, sharedArea, info]
    )
    res.send({
      code: 200,
      message: '新增成功',
      data: { id: result.insertId },
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 更新房屋（仅管理员可用）
router.put('/houses/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { username, location, totalArea, sharedArea, info } = req.body

  if (!username || username.trim().length === 0) {
    return res.status(400).send({ code: 400, message: '请选择用户' })
  }

  if (!location || !totalArea || !sharedArea || !info) {
    return res.status(400).send({ code: 400, message: '参数不完整' })
  }

  try {
    const [result] = await db.query(
      'UPDATE houseinfo SET user_house = ?, location = ?, total_area = ?, public_area = ?, description = ? WHERE id = ?',
      [username.trim(), location, totalArea, sharedArea, info, id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).send({ code: 404, message: '房屋不存在' })
    }
    res.send({
      code: 200,
      message: '更新成功',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 删除单个房屋（仅管理员可用）
router.delete('/houses/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query('DELETE FROM houseinfo WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).send({ code: 404, message: '房屋不存在' })
    }
    res.send({
      code: 200,
      message: '删除成功',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 批量删除房屋（仅管理员可用）
router.post('/houses/batch-delete', authenticateToken, requireAdmin, async (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).send({ code: 400, message: '参数错误' })
  }

  try {
    const placeholders = ids.map(() => '?').join(',')
    await db.query(`DELETE FROM houseinfo WHERE id IN (${placeholders})`, ids)
    res.send({
      code: 200,
      message: '删除成功',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

export default router
