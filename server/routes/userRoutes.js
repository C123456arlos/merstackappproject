import express from 'express'
import { getPublishedImages, getUser, loginUser, registerUser } from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'
const router = express.Router()
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/data', protect, getUser)
router.get('/published-images', getPublishedImages)
export default router