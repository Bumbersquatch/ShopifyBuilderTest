var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var bower = require('gulp-bower');
var mainBowerFiles = require('main-bower-files');


// Development Tasks 
// -----------------

gulp.task('bowerscripts', function() {
    gulp.src('bower_components/handlebars/handlebars.min.js')
        .pipe(gulp.dest('app/js/lib'))
    gulp.src('bower_components/bootstrap/dist/js/*.js')
        .pipe(gulp.dest('app/js/lib'))
    gulp.src('bower_components/jquery/dist/*.js')
        .pipe(gulp.dest('app/js/lib'))
    gulp.src('bower_components/masonry/dist/*.js')
        .pipe(gulp.dest('app/js/lib'))
    gulp.src('bower_components/imagesloaded/*.js')
        .pipe(gulp.dest('app/js/lib'))
    gulp.src('bower_components/KineticJS/kinetic.js')
        .pipe(gulp.dest('app/js/lib'))
    gulp.src('bower_components/tether/dist/js/tether.js')
        .pipe(gulp.dest('app/js/lib'))
});

gulp.task('bowercss', function() {
    gulp.src('bower_components/bootstrap/dist/css/*.css')
        .pipe(gulp.dest('app/css/lib'))
    gulp.src('bower_components/font-awesome/css/*.css')
        .pipe(gulp.dest('app/css/lib'))
    gulp.src('bower_components/tether/dist/css/tether.css')
        .pipe(gulp.dest('app/css/lib'))
});

gulp.task('bowerfonts', function() {
    gulp.src('bower_components/font-awesome/fonts/*')
        .pipe(gulp.dest('app/css/fonts'))
});
// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  })
})

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass()) // Passes it through a gulp-sass
    .pipe(gulp.dest('app/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})

// Watchers
gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
})

// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', function() {

  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

// Optimizing Images 
gulp.task('images', function() {
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/images'))
});

// Copying fonts 
gulp.task('fonts', function() {
  return gulp.src('app/css/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})

// Copying data 
gulp.task('data', function() {
  return gulp.src('app/data/*.json')
    .pipe(gulp.dest('dist/data'))
})

// Cleaning 
gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// Build Sequences
// ---------------

gulp.task('default', function(callback) {
  runSequence([
      'bowerscripts', 
      'bowercss', 
      'bowerfonts', 
      'sass', 
      'browserSync', 
      'watch'
      ],
    callback
  )
})

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    [
    'bowerscripts', 
    'bowercss', 
    'bowerfonts', 
    'sass', 
    'useref', 
    'images', 
    'fonts',
    'data'
    ],
    callback
  )
})
