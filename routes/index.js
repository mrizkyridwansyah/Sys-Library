const express = require('express')
const router = express.Router()
const Mangas = require('../models/mangas')

router.get('/', async (req, res) => {
    const mangas = await Mangas.find().populate('author').exec()
    res.render('index', { mangas: mangas})
})

module.exports = router