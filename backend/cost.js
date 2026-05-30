import express from 'express'
import db from './db.js'
import { authenticateToken, requireAdmin } from './token.js'

const router = express.Router()

// 获取费用列表
router.get('/costs', authenticateToken, async (req, res) => {
  try {
    const { role, username } = req.user
    // 注意：price 表实际字段为 user_price，使用别名 username 返回
    let sql =
      'SELECT id, user_price as username, property_fee as propertyFee, water_fee as waterFee, electricity_fee as electricityFee, created_at as createdAt FROM price'
    let params = []

    // 普通用户只能看到自己的费用
    if (role === 'user') {
      sql += ' WHERE user_price = ?'
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

// 新增费用（仅管理员可用，需指定用户）
router.post('/costs', authenticateToken, requireAdmin, async (req, res) => {
  const { username, propertyFee, waterFee, electricityFee } = req.body

  if (!username || username.trim().length === 0) {
    return res.status(400).send({ code: 400, message: '请选择用户' })
  }

  if (
    propertyFee === undefined ||
    propertyFee === '' ||
    waterFee === undefined ||
    waterFee === '' ||
    electricityFee === undefined ||
    electricityFee === ''
  ) {
    return res.status(400).send({ code: 400, message: '费用参数不完整' })
  }

  try {
    const [result] = await db.query(
      'INSERT INTO price (user_price, property_fee, water_fee, electricity_fee) VALUES (?, ?, ?, ?)',
      [username.trim(), propertyFee, waterFee, electricityFee],
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

// 更新费用（仅管理员可用）
router.put('/costs/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { username, propertyFee, waterFee, electricityFee } = req.body

  if (!username || username.trim().length === 0) {
    return res.status(400).send({ code: 400, message: '请选择用户' })
  }

  if (
    propertyFee === undefined ||
    propertyFee === '' ||
    waterFee === undefined ||
    waterFee === '' ||
    electricityFee === undefined ||
    electricityFee === ''
  ) {
    return res.status(400).send({ code: 400, message: '费用参数不完整' })
  }

  try {
    const [result] = await db.query(
      'UPDATE price SET user_price = ?, property_fee = ?, water_fee = ?, electricity_fee = ? WHERE id = ?',
      [username.trim(), propertyFee, waterFee, electricityFee, id],
    )
    if (result.affectedRows === 0) {
      return res.status(404).send({ code: 404, message: '费用记录不存在' })
    }
    res.send({
      code: 200,
      message: '更新成功',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

export default router
