var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var sassGlob = require('gulp-sass-glob');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var nodeSassGlobbing = require('node-sass-globbing');
var inject = require('gulp-inject');
var sort = require('sort-stream');
var browsersync = require("browser-sync").create();

gulp.task('sass', function () {
  return gulp.src('source/scss/**/[^_]*.scss')
  .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass({outputStyle: 'expanded', includePaths: ['./node_modules', './source/scss'],errLogToConsole: true, importer: nodeSassGlobbing }))
      .on('error', function (errorInfo) {
        console.log(errorInfo.toString());
        this.emit('end');
      })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('css'));
});

gulp.task('scripts', function() {
  return gulp.src('source/js/**/[^_]*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(gulp.dest('js'));
});

gulp.task('inject', function () {
  var target = gulp.src('./index.html');
  var sources = gulp.src(['./js/**/*.js', './css/**/*.css'], { read: false });

  return target.pipe(inject(sources.pipe(sort(function (a, b) {
      console.log(a,b,a.path.localeCompare(b.path));
      return a.path.localeCompare(b.path);
    }))))

    .pipe(gulp.dest('./'));
});

gulp.task('serve', function (cb) {
  browsersync.init({
    server: {
      baseDir: '.'
    }
  });
  cb();
});

gulp.task('reload', function (cb) {
  browsersync.reload();
  cb();
});

gulp.task('watch', function(){
  gulp.watch(['source/scss/**/*.scss','source/js/**/*.js'], gulp.series('sass','scripts', 'inject', 'reload'));
});

gulp.task('watchhtml', function(){
  gulp.watch(['index.html'], gulp.series('sass','scripts', 'reload'));
});

gulp.task('watchall', gulp.parallel('watch', 'watchhtml'));

gulp.task('start', gulp.series('sass', 'scripts' , 'serve', 'watchall'));