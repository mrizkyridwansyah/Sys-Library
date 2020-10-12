const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Manga = require('../models/mangas')
//Setup type file that can be uploaded
const imgMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//Index Manga
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

//Create Manga
router.get('/create', async (req, res) => {
    renderNewPage(res, new Manga())
})

//Save Manga
router.post('/', async (req, res) => {
    //Set published date if the manga was published
    const published_date = req.body.published_date ? new Date(req.body.published_date) : null;
    //Set Object as return value if error & for save database
    const manga = new Manga ({
        title: req.body.title,
        description: req.body.description,
        page_count: req.body.page_count,
        is_publish: req.body.is_publish !== undefined,
        published_date: published_date,
        author: req.body.author,
    })

    if(req.body.is_publish !== undefined && (!req.body.published_date || req.body.published_date === '')) {
        renderNewPage(res, manga, true, 'Published Date invalid')
    }

    saveCover(manga, req.body.cover_image)

    try{
        const newManga = await manga.save()//saving the manga object
        res.redirect('mangas');
    }catch(e) {
        //Return to form create manga with last input manga object
        renderNewPage(res, manga, true, 'Error Creating Manga')
    }
})

//Show Manga
router.get('/:id', async (req, res) => {
    try{
        let manga = await Manga.findById(req.params.id)
                               .populate('author')
                               .exec(); 
        res.render('mangas/show', { manga : manga })
    } catch {
        res.redirect('/')
    }
})

//Edit Manga
router.get('/:id/edit', async (req, res) => {
    let manga
    try{
        manga = await Manga.findById(req.params.id); 
        renderEditPage(res, manga);
    } catch {
        renderEditPage(res, manga, true, 'Error Showing Manga');
    }
})

router.put('/:id', async (req, res) => {
    const published_date = req.body.published_date ? new Date(req.body.published_date) : null;
    let manga
    try {
        manga = await Manga.findById(req.params.id);
        manga.title= req.body.title;
        manga.description= req.body.description;
        manga.page_count= req.body.page_count;
        manga.is_publish= req.body.is_publish !== undefined;
        manga.published_date= published_date;
        manga.author= req.body.author;

        if(req.body.is_publish !== undefined && (!req.body.published_date || req.body.published_date === '')) {
            renderEditPage(res, manga, true, 'Published Date invalid')
        }
        
        if(req.body.cover_image != null && req.body.cover_image != '') {
            saveCover(manga, req.body.cover_image)
        }

        await manga.save()
        res.redirect(`/mangas/${manga.id}`);
    } catch {
        renderEditPage(res, manga, true, 'Error Updating Manga')
    }
})

router.delete('/:id', async (req, res) => {
    let manga
    try{
        manga = await Manga.findById(req.params.id)
                           .populate('author')
                           .exec();
        await manga.remove();
        res.redirect('/mangas')
    } catch{
        if(manga == null) {
            res.redirect('/')
        } else {
            res.redirect('mangas/show', { mangas: mangas, errorMessage: err})
        }
    }
})

async function renderNewPage(res, manga, hasError = false, errorMessage) {
    renderFormPage(res, manga, 'create', hasError, errorMessage)
}

async function renderEditPage(res, manga, hasError = false, errorMessage) {
    renderFormPage(res, manga, 'edit', hasError, errorMessage)
}

async function renderFormPage(res, manga, form, hasError = false, errorMessage) {
    try{
        const authors = await Author.find();
        const params = {
            authors: authors,  
            manga: manga
        }
        //hasError will be true when this function call from catch
        if(hasError) params.errorMessage = errorMessage
        res.render(`mangas/${form}`, params)
    } catch{
        res.render('/mangas')
    }
}

function saveCover(manga, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imgMimeTypes.includes(cover.type)) {
        manga.cover_image = new Buffer.from(cover.data, 'base64')
        manga.cover_image_type = cover.type
    }
}

module.exports = router