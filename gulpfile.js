const { src, dest, parallel, watch } = require('gulp');
const nunjucks = require('gulp-nunjucks');
const sass = require("gulp-sass");
const minify = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const pretty = require('gulp-pretty-html');
const uglify = require('gulp-uglify');
const browsersync = require('browser-sync').create();
const image = require('gulp-image');

function css() {
    return src("./src/assets/scss/app.scss")
    .pipe(sass()).on("error", sass.logError)
    .pipe(autoprefixer())
    .pipe(concat('app.min.css'))
    .pipe(minify())
    .pipe(dest('dist/assets/css'))
    .pipe(browsersync.stream());
}

function js() {
    return src([
        './src/assets/js/*.js',
        './node_modules/uikit/dist/js/uikit.js', 
        './node_modules/uikit/dist/js/uikit-icons.js'
    ], { sourcemaps: true })
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(dest('dist/assets/js', { sourcemaps: true }))
}

const data = {
    name: 'Starter'
}

function html() {
    return src("./src/views/*.njk")
    .pipe(nunjucks.compile(data))
    .pipe(pretty())
    .pipe(dest('dist'))
}

function img() {
    return src('./src/assets/images/*')
    .pipe(image({
        pngquant: true,
        optipng: false,
        zopflipng: true,
        jpegRecompress: false,
        mozjpeg: true,
        gifsicle: true,
        svgo: true,
        concurrent: 10,
        quiet: true // defaults to false
    }))
    .pipe(dest('dist/assets/images'));
}

// Developement
exports.watch = function () {
    browsersync.init({
        server: {
           baseDir: "./dist",
           index: "/index.html"
        }
    });
    watch('./src/assets/js/**/*.js', { events: 'all', ignoreInitial: false }, js).on('change', browsersync.reload);
    watch('./src/views/**/*.njk', { events: 'all', ignoreInitial: false }, html).on('change', browsersync.reload);
    watch('./src/assets/scss/**/*.scss', { events: 'all', ignoreInitial: false }, css);
    watch('./src/assets/images/*', { events: 'all', ignoreInitial: false }, img).on('change', browsersync.reload);
}

// Production 
exports.build = parallel(html, css, js, img);