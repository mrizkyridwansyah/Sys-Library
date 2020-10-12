const { render } = require('ejs');
const mongoose = require('mongoose');
const path = require('path')

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
        type: Buffer,
        required: true
    },
    cover_image_type: {
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
    if(this.cover_image !== null && this.cover_image_type != null) {
        return `data:${this.cover_image_type};charset=utf-8;base64,${this.cover_image.toString('base64')}`
    }
})

module.exports = mongoose.model('Manga', mangaSchema)
