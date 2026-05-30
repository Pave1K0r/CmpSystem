import express from 'express'
import db from './db.js'
import { authenticateToken, requireAdmin } from './token.js'

const router = express.Router()

// 获取投诉列表
router.get('/complaints', authenticateToken, async (req, res) => {
  try {
    const { role, username } = req.user
    let sql =
      'SELECT id, username, complaint_info as complaintInfo, complaint_status as complaintStatus, complaint_content as complaintContent FROM complaintinfo'
    let params = []

    // 普通用户只能看到自己的投诉
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

// 新增投诉（普通用户提交自己的投诉）
router.post('/complaints', authenticateToken, async (req, res) => {
  const { complaintInfo } = req.body
  const { username } = req.user

  if (!complaintInfo) {
    return res.status(400).send({ code: 400, message: '反馈信息不能为空' })
  }

  try {
    const [result] = await db.query(
      'INSERT INTO complaintinfo (username, complaint_info, complaint_status) VALUES (?, ?, ?)',
      [username, complaintInfo, '待处理'],
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

// 更新投诉状态（仅管理员可用）
router.put('/complaints/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const validStatus = ['待处理', '处理中', '已完成']
  if (!validStatus.includes(status)) {
    return res.status(400).send({ code: 400, message: '状态值无效' })
  }

  try {
    const [result] = await db.query('UPDATE complaintinfo SET complaint_status = ? WHERE id = ?', [
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

// 管理员回复投诉（仅管理员可用）
router.put('/complaints/:id/reply', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { content } = req.body

  if (!content || content.trim().length === 0) {
    return res.status(400).send({ code: 400, message: '回复内容不能为空' })
  }

  try {
    const [result] = await db.query('UPDATE complaintinfo SET complaint_content = ? WHERE id = ?', [
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
