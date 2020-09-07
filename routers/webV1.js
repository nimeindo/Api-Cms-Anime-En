const express = require('express')
const router = express.Router()
const ListAnimeController = require('../controllers/V1/ListAnimeController')

router.route('/ListAnime')
    .post(ListAnimeController.ListAnime);

module.exports = router;