import express from 'express'
import db from './db.js'
import { authenticateToken, requireAdmin } from './token.js'

const router = express.Router()

// 获取维修列表
router.get('/repairs', authenticateToken, async (req, res) => {
  try {
    const { role, username } = req.user
    let sql =
      'SELECT id, username, repairs_info as repairsInfo, repairs_status as repairsStatus, repairs_content as repairsContent FROM repairsinfo'
    let params = []

    // 普通用户只能看到自己的报修
    if (role === 'user') {
      sql += ' WHERE username = ?'
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

// 新增维修（普通用户提交自己的报修）
router.post('/repairs', authenticateToken, async (req, res) => {
  const { repairsInfo } = req.body
  const { username } = req.user

  if (!repairsInfo) {
    return res.status(400).send({ code: 400, message: '维修信息不能为空' })
  }

  try {
    const [result] = await db.query(
      'INSERT INTO repairsinfo (username, repairs_info, repairs_status) VALUES (?, ?, ?)',
      [username, repairsInfo, '待处理'],
    )
    res.send({
      code: 200,
      message: '提交成功',
      data: { id: result.insertId },
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 更新维修状态（仅管理员可用）
router.put('/repairs/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const validStatus = ['待处理', '处理中', '已完成']
  if (!validStatus.includes(status)) {
    return res.status(400).send({ code: 400, message: '状态值无效' })
  }

  try {
    const [result] = await db.query('UPDATE repairsinfo SET repairs_status = ? WHERE id = ?', [
      status,
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).send({ code: 404, message: '记录不存在' })
    }
    res.send({
      code: 200,
      message: '状态更新成功',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

// 管理员回复维修（仅管理员可用）
router.put('/repairs/:id/reply', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { content } = req.body

  if (!content || content.trim().length === 0) {
    return res.status(400).send({ code: 400, message: '回复内容不能为空' })
  }

  try {
    const [result] = await db.query('UPDATE repairsinfo SET repairs_content = ? WHERE id = ?', [
      content.trim(),
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).send({ code: 404, message: '记录不存在' })
    }
    res.send({
      code: 200,
      message: '回复成功',
    })
  } catch {
    res.status(500).send({ code: 500, message: '服务器内部错误' })
  }
})

export default router
