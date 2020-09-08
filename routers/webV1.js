const express = require('express')
const router = express.Router()
const ListAnimeController = require('../controllers/V1/Scrap/ListAnimeController')
const DetailAnimeController = require('../controllers/V1/Scrap/DetailAnimeController')

router.route('/ListAnime')
    .post(ListAnimeController.ListAnime);
router.route('/DetailAnime')
    .post(DetailAnimeController.DetailAnime);

module.exports = router;