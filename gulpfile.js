const gulp = require('gulp');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const gcmq = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const pug = require('gulp-pug');
const htmlMin = require('gulp-htmlmin');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

const srcFolder = 'src/';
const distFolder = 'dist/';

const htmlIn = `${srcFolder}**/*.html`;
const htmlOut = distFolder;

const pugIn = `${srcFolder}pug/*.pug`;
const pugOut = distFolder;

const scssIn = `${srcFolder}scss/main.scss`;
const scssOut = `${distFolder}assets/css/`;

const jsIn = `${srcFolder}js/**/*.js`;
const jsOut = `${distFolder}assets/js/`;
const jsOutName = 'app.js';

const imgIn = `${srcFolder}img/**/*.+(png|jpg|jpeg|gif|svg|ico)`;
const imgOut = `${distFolder}assets/img/`;

function customPlumber(errTitle) {
  return plumber({
    errorHandler: notify.onError({
      title: errTitle || 'Error running Gulp',
      message: 'Error: <%= error.message %>',
      sound: true,
    }),
  });
}

gulp.task('clear', () => del([distFolder]));

gulp.task('html', () => {
  const task = gulp
    .src([htmlIn])
    .pipe(
      htmlMin({
        sortAttributes: true,
        sortClassName: true,
        collapseWhitespace: true,
      }),
    )
    .pipe(gulp.dest(htmlOut))
    .pipe(browserSync.stream());
  return task;
});

gulp.task('pug', () => {
  const task = gulp
    .src([pugIn])
    .pipe(customPlumber())
    .pipe(pug())
    .pipe(
      htmlMin({
        sortAttributes: true,
        sortClassName: true,
        collapseWhitespace: true,
      }),
    )
    .pipe(gulp.dest(pugOut))
    .pipe(browserSync.stream());
  return task;
});

gulp.task('sass', () => {
  const task = gulp
    .src([scssIn])
    .pipe(sourcemaps.init())
    .pipe(customPlumber())
    .pipe(sass({ precision: 10 }))
    .pipe(autoprefixer())
    .pipe(gcmq())
    .pipe(cssnano())
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(scssOut))
    .pipe(browserSync.stream());
  return task;
});

gulp.task('js', () => {
  const task = gulp
    .src([jsIn])
    .pipe(customPlumber())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat(jsOutName))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(jsOut))
    .pipe(browserSync.stream());
  return task;
});

gulp.task('images', () => {
  const task = gulp
    .src([imgIn])
    .pipe(customPlumber())
    .pipe(imagemin())
    .pipe(gulp.dest(imgOut))
    .pipe(browserSync.stream());
  return task;
});

gulp.task('build', gulp.series('clear', 'html', 'pug', 'sass', 'js', 'images'));

gulp.task('dev', gulp.series('html', 'pug', 'sass', 'js'));

gulp.task('serve', () => {
  const task = browserSync.init({
    server: {
      baseDir: [distFolder],
      port: 3000,
    },
  });
  return task;
});

gulp.task('watch', () => {
  const watchImages = `${srcFolder}img/**/*.+(png|jpg|jpeg|gif|svg|ico)`;

  const watch = [
    `${srcFolder}**/*.html`,
    `${srcFolder}pug/**/*.pug`,
    `${srcFolder}scss/**/*.scss`,
    `${srcFolder}js/**/*.js`,
  ];

  gulp.watch(watch, gulp.series('dev')).on('change', browserSync.reload);
  gulp.watch(watchImages, gulp.series('images')).on('change', browserSync.reload);
});

gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')));
