const { render } = require('ejs');
const mongoose = require('mongoose');
const path = require('path')
//Setup folder to save uploaded file
const coverImageBasePath = 'upload/mangaCovers'

const mangaSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    page_count: {
        type: Number,
        required: true
    },
    create_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    cover_image : {
        type: String,
        required: true
    },
    is_publish: {
        type: Boolean,
        required: true
    },    
    published_date: {
        type: Date
    },
    author : {
        type: mongoose.Schema.Types.ObjectId,//like a foreign key in sql 
        required: true,
        ref: 'Author'
    }
})

mangaSchema.virtual('coverImagePath').get(function () {
    if(this.cover_image !== null) {
        return path.join('/', coverImageBasePath, this.cover_image)
    }
})

module.exports = mongoose.model('Manga', mangaSchema)
//export the path not as default
module.exports.coverImageBasePath = coverImageBasePath