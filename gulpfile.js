var gulp = require('gulp');
watch = require('gulp-watch');

var appDir = "./wab/server/apps/2";

gulp.task('watch', function () {
    // Watch entire src directory.  When something changes copy it to the apps dir.
    return watch('./src/**/*.*', { ignoreInitial: false })
        .pipe(gulp.dest(appDir));
});

gulp.task('default', ['watch']);
