import express from 'express'
import { getWorld } from './controller.js'

const router = express.Router()

router.route('/').get(getWorld)

export default router