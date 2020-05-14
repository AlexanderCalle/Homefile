const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const { ensureAuthenticated } = require('./middleware/auth');

// App express
const app = express();

// BodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MethodOverride middleware
app.use(methodOverride('_method'));

// Ejs and public folder middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', 'views');

// Morgan server logs
app.use(morgan('short'));

// ExpressSession middleware
app.use(session({
    secret: '1503',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash middleware
app.use(flash());

app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Default route
app.get('/', (req, res)=>{
    res.redirect('/user/login');
});

// routes paths
const home = require('./router/home');
const upload = require('./router/upload');
const user = require('./router/user');
const files = require('./router/files');
const folders = require('./router/folders');

// Home route
app.use('/home', ensureAuthenticated, home);

// Upload route
app.use('/upload', ensureAuthenticated, upload);

// User route
app.use('/user', user);

// Files route
app.use('/files', ensureAuthenticated, files)

// Folder route
app.use('/folders', ensureAuthenticated, folders);

// Port to start server on
const port = process.env.PORT || 2000;

// Starting server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})