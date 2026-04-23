import express from 'express'
import { getWorld, getProfiles, searchProfilesNL } from './controller.js'

const router = express.Router()

router.route('/').get(getWorld)
router.route('/profiles').get(getProfiles)
router.route('/profiles/search').get(searchProfilesNL)

export default router