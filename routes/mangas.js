const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Author = require('../models/author')
const Manga = require('../models/mangas')
//Setup Folder for uploaded file
const uploadPath = path.join('public', Manga.coverImageBasePath)
//Setup type file that can be uploaded
const imgMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
//Using multer dest (destination path), fileFilter = validating type file
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imgMimeTypes.includes(file.mimetype))
    }
})

router.get('/', async (req, res) => {
    let query = Manga.find();    
    if(req.query.title && req.query.title !== ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.published_before && req.query.published_before !== ''){
        query = query.lte('published_date', req.query.published_before)
    }
    if(req.query.published_after && req.query.published_after !== ''){
        query = query.gte('published_date', req.query.published_after)
    }

    let authorSearch = {}
    if(req.query.author && req.query.author !== ''){
        authorSearch.name = new RegExp(req.query.author, 'i')//'i' is for case insensitive
    }

    try{
        let mangas = await query.exec()
        if(req.query.author && req.query.author !== ''){            
            let authors = await Author.find(authorSearch).distinct('_id');      
            let newMangas = await [...mangas]
            mangas = newMangas.filter(n => String(authors).includes(n.author));
        }
        mangas.forEach(manga => {
            const createDate = new Date(manga.create_at).getTime();
            const today = Date.now();
            const diffTime = Math.abs(today - createDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24 )); 
            manga.diffDays = diffDays    
        })
        res.render('mangas/index', {
            mangas: mangas,
            search: req.query
        })
    }catch(error){
        console.log(error)
        res.redirect('/')
    }
})

router.get('/create', async (req, res) => {
    renderNewPage(res, new Manga())
})

//upload single return a request object file
router.post('/', upload.single('cover_image'), async (req, res) => {
    //Set file name for database
    const fileName = req.file != null ? req.file.filename : null;
    //Set published date if the manga was published
    const published_date = req.body.published_date ? new Date(req.body.published_date) : null;
    //Set Object as return value if error & for save database
    const manga = new Manga ({
        title: req.body.title,
        description: req.body.description,
        page_count: req.body.page_count,
        cover_image: fileName,
        is_publish: req.body.is_publish !== undefined,
        published_date: published_date,
        author: req.body.author,
    })

    if(req.body.is_publish !== undefined && (!req.body.published_date || req.body.published_date === '')) {
        renderNewPage(res, manga, true, 'Published Date invalid')
    }

    try{
        const newManga = await manga.save()//saving the manga object
        res.redirect('mangas');
    }catch(e) {
        //Remove the uploaded file when error
        if(manga.cover_image != null) {
            removeMangaCover(manga.cover_image)
        }
        //Return to form create manga with last input manga object
        renderNewPage(res, manga, true, 'Error Creating Manga')
    }
})

async function renderNewPage(res, manga, hasError = false, errorMessage) {
    try{
        const authors = await Author.find();
        const params = {
            authors: authors,  
            manga: manga
        }
        //hasError will be true when this function call from catch
        if(hasError) params.errorMessage = errorMessage
        res.render('mangas/create', params)
    } catch{
        res.render('/mangas')
    }
}

function removeMangaCover(filename) {
    //Remove the file which has uploaded while the data saved error
    //uploadPath = public/upload/mangaCovers
    //filename = name of file from returning value when upload.single
    fs.unlink(path.join(uploadPath, filename), err => {
        if(err) console.error(err)
    })
}

module.exports = router