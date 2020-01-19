var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
var db;

MongoClient.connect('mongodb://localhost:27017', (err, database) => {
    if (err) return console.log(err);
    db = database.db('productdb');
})

/* GET product listing. */
router.get('/', function (req, res, next) {
    db.collection('producten').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('list.ejs', { producten: result })
    })
});

/* Get add option */
router.get('/add', (req, res) => {
    res.render('add.ejs', {})
})

/* ADD product TO DB */
router.post('/add', (req, res) => {
    let product = { naam: req.body.naam, smaak: req.body.smaak, kleur: req.body.kleur, vorm: req.body.vorm };

    db.collection('producten').findOne(product, (err, result) => {
        if (result) {
            res.render('bestaat_al.ejs', {})
        }
        else{
            db.collection('producten').insertOne({ naam: req.body.naam, smaak: req.body.smaak, kleur: req.body.kleur, vorm: req.body.vorm, vervaldatum: new Date() }, (err, result) => {
                if (err) return
                res.redirect('/')
            })
        }
    }) 
})

/* SEARCH FORM */
router.get('/search', (req, res) => {
    res.render('search.ejs', {})
})

/* FIND product */
router.post('/search', (req, res) => {
    var query = { naam: req.body.naam }
    db.collection('producten').find(query).toArray((err, result) => {
        result = result.sort(function(a,b){ 
            var x = a.kleur < b.kleur? -1:1; 
            return x; 
        });
        if (err) return console.log(err)
        if (result == '')
            res.render('search_not_found.ejs', {})
        else
            res.render('search_result.ejs', { producten: result })
    })
})
module.exports = router;