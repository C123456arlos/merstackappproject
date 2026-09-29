import express from 'express'
import { createChat, deleteChat, getChats } from '../controllers/chatController.js'
import { protect } from '../middleware/auth.js'
const router = express.Router()
router.get('/create', protect, createChat)
router.get('/get',protect, getChats)
router.post('/delete', protect, deleteChat)
export default router