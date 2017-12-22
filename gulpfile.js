'use strict'

const gulp = require('gulp')
const browserify = require('browserify')
const filter = require('gulp-filter')
const rename = require('gulp-rename')
const concat = require('gulp-concat')
const sass = require('gulp-sass')
const source = require('vinyl-source-stream')
const babelify = require('babelify')

const destFolder = 'dist'

gulp.task('rtc', function() {
  return browserify(`./static/rtc/simplewebrtc.js`)
  .bundle({standalone: 'SimpleWebRTC'})
  .pipe(source('rtc.js'))
  .pipe(gulp.dest(`${destFolder}/js`))
})

gulp.task('js', function() {
  browserify('./static/views/prepare.js')
    .transform(babelify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(`${destFolder}/js`))

  browserify('./static/views/chat/chat.js')
    .transform(babelify)
    .bundle()
    .pipe(source('chat.js'))
    .pipe(gulp.dest(`${destFolder}/js`))
})

gulp.task('sass', function() {
  gulp.src([
    './node_modules/bootstrap/dist/css/bootstrap.css',
    'static/**/*.scss',
  ])
  .pipe(sass())
  .pipe(concat('style.css'))
  .pipe(gulp.dest(`${destFolder}/css/`))
})

gulp.task('static', function() {
  gulp.src([
    './node_modules/bootstrap/**/fonts/*',
    './node_modules/font-awesome/fonts/*',
  ])
  .pipe(filter([
    '**/*.eot', '**/*.woff', '**/*.woff2', '**/*.svg', '**/*.tt'
  ]))
  .pipe(rename({dirname: ''}))
  .pipe(gulp.dest(`${destFolder}/fonts`))

  // images
  gulp.src('./static/images/*')
  .pipe(gulp.dest(`${destFolder}/images`))
})

gulp.task('views', function() {
  gulp.src([
    'static/views/**/*.html'
  ])
    .pipe(gulp.dest('views'))
})

gulp.task('watch', function() {
  gulp.start('base')
  gulp.watch('./static/**/*', ['base'])
})

gulp.task('base', ['sass', 'js', 'static', 'views'])
gulp.task('build', ['rtc', 'sass', 'js', 'static'])
gulp.task('default', ['watch'])
