const { response } = require('express');
const express = require('express');
const router = express.Router()
const Author = require('../models/author')

router.get('/', async (req, res) => {
    let search = {}
    if(req.query.name && req.query.name !== ''){
        search.name = new RegExp(req.query.name, 'i')//'i' is for case insensitive
    }

    try{
        const authors = await Author.find(search)
        res.render('authors/index', { authors: authors, search: req.query });
    }catch{
        res.redirect('/')
    }
})  

//New Author Route
router.get('/create', (req, res) => {
    res.render('authors/create', { author: new Author() })
})

//Save Create Author Route
router.post('/', async (req, res) => {
    const author = new Author ({
      name: req.body.name  
    })

    try{
        const newAuthor = await author.save()
        // res.redirect(`authors/${author.name}`)
        res.redirect('authors/')
    } catch{
        res.render('authors/create', { author : author, errorMessage: 'Error creating author' })
    }
})

module.exports = router