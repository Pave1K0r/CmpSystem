import express from 'express'
import db from './db.js'
import { authenticateToken, requireAdmin } from './token.js'

const router = express.Router()

// 获取公告列表（管理员和普通用户均可访问）
router.get('/notices', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, content FROM notice ORDER BY id DESC'
    )
    res.send({
      code: 200,
      message: '获取成功',
      data: rows,
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 发布公告（仅管理员可用）
router.post('/notices', authenticateToken, requireAdmin, async (req, res) => {
  const { content } = req.body

  if (!content || content.trim().length === 0) {
    return res.status(400).send({ code: 400, message: '公告内容不能为空' })
  }

  try {
    const [result] = await db.query(
      'INSERT INTO notice (content) VALUES (?)',
      [content.trim()]
    )
    res.send({
      code: 200,
      message: '发布成功',
      data: { id: result.insertId },
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 删除公告（仅管理员可用）
router.delete('/notices/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params

  try {
    const [result] = await db.query('DELETE FROM notice WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).send({ code: 404, message: '公告不存在' })
    }
    res.send({
      code: 200,
      message: '删除成功',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

export default router
