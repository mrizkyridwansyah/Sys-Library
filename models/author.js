const mongoose = require('mongoose')
const Mangas = require('./mangas')

const authorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('remove', function (next) {
    Mangas.find({ author: this.id}, (err, mangas) => {
        if(err) {
            next(err)  
        } else if(mangas.length > 0) {
            next(new Error('Author has manga'))
        } else{
            next()
        }
    })
})

module.exports = mongoose.model('Author', authorSchema)