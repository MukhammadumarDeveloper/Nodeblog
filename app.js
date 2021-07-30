const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/nodekb', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

// Malumotlar omboriga ulanishni tekshirish
db.once('open', () => {
    console.log('MongoDBga ulandi!')
})

// Malumotlar omboridagi xatoliklarni aniqlash
db.on('error', (err) => {
    console.log(err)
})

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

// Express messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator Middleware
// app.use(expressValidator({
//     errorFormatter: function (param, msg, value) {
//         var namespace = param.split('.')
//             , root = namespace.shift()
//             , formParam = root;

//         while (namespace.length) {
//             formParam += '[' + namespace.shift() + ']';
//         }
//         return {
//             param: formParam,
//             msg: msg,
//             value: value
//         };
//     }
// }));

// Modellarni chaqirib olish 

let Article = require('./models/article');

// Load View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'Maqolalar',
                articles: articles
            });
        }
    })
});

// route qo'shish
app.get('/articles/add', (req, res) => {
    res.render('add_article', {
        title: 'Maqola qo\'shish'
    })
});

// Get single article
app.get('/article/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        res.render('article', {
            article: article
        })
    })
});

// Maqolani tahrirlash
app.get('/article/edit/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        res.render('edit_article', {
            title: 'Maqolani tahrirlash',
            article: article
        })
    })
});

// Maqolani yangilaymiz
app.post('/articles/edit/:id', (req, res) => {
    let article = {}
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = { _id: req.params.id }
    Article.update(query, article, (err) => {
        if (err) {
            console.log(err)
            return;
        } else {
            res.redirect('/');
        };
    })
});
// Maqolani qo'shish routini yaratamiz
app.post('/articles/add', (req, res) => {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save((err) => {
        if (err) {
            console.log(err)
            return;
        } else {
            res.redirect('/');
        };
    })
});

app.delete('/article/:id', (req, res) => {
    let query = { _id: req.params.id };

    Article.remove(query, (err) => {
        if (err) {
            console.log(err)
        }
        res.send('Muvofaqqiyatli bajarildi!');
    });
})

app.listen(3000, () => console.log('Server 3000chi portda ishga tushdi!...'));