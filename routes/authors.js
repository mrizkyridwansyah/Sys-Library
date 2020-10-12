const { response } = require('express');
const express = require('express');
const router = express.Router()
const Author = require('../models/author');
const Mangas = require('../models/mangas');

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

//Show Author
router.get('/:id', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id);
        const mangas = await Mangas.find({ author: author.id });
        mangas.forEach(manga => {
            const createDate = new Date(manga.create_at).getTime();
            const today = Date.now();
            const diffTime = Math.abs(today - createDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24 )); 
            manga.diffDays = diffDays    
        })
        res.render('authors/show', { author: author, mangas: mangas })
    } catch {
        res.redirect('/', {
            errorMessage: 'Error Showing author'
        })
    }

})

router.get('/:id/edit', async (req, res) => {    
    const author = await Author.findById(req.params.id);
    res.render('authors/edit', { author: author })
})

router.put('/:id', async (req, res) => {
    let author
    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        const newAuthor = await author.save();
        res.redirect(`/authors/${author.id}`)
    } catch {
        if(author == null) {
            res.redirect('/')
        } else{
            res.render('authors/edit', {
                author : author,
                errorMessage: "Error Updating Author"
            })
        }
    }
})

router.delete('/:id', async (req, res) => {    
    let author
    let mangas
    try{
        author = await Author.findById(req.params.id)
        mangas = await Mangas.find({ author: author.id })
        await author.remove()
        res.redirect('/authors')
    } catch (err) {
        if(author == null) {
            res.redirect('/')
        } else {
            res.render('authors/show', { author: author,mangas: mangas, errorMessage: err})
        }
    }
})

module.exports = router