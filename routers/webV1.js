const express = require('express')
const router = express.Router()
const LastUpdateAnimeController = require('../controllers/V1/Scrap/LastUpdateAnimeController')
const ListAnimeController = require('../controllers/V1/Scrap/ListAnimeController')
const DetailAnimeController = require('../controllers/V1/Scrap/DetailAnimeController')
const StreamingAnimeController = require('../controllers/V1/Scrap/StreamingAnimeController')

router.route('/Scrap-ListAnime')
    .post(ListAnimeController.ListAnime);
router.route('/Scrap-DetailAnime')
    .post(DetailAnimeController.DetailAnime);
router.route('/Scrap-StremAnime')
    .post(StreamingAnimeController.StreamingAnime);
router.route('/Scrap-LastUpdate')
    .post(LastUpdateAnimeController.LastUpdateAnime);

module.exports = router;