// const gulp = require('gulp');
// const exec = require('child_process').exec;

// gulp.task('compile',function(cb){
//     exec('node ./public/script/compile.js', function (err, stdout, stderr) {
//         console.log(stdout);
//         console.log(stderr);
//         cb(err);
//     });
// });

// gulp.task('watch',function(){
//     gulp.watch('./src/**',['compile']);
// });

// gulp.task('redux', ['compile','watch']);
var gulp = require('gulp');
var bs = require('browser-sync').create(); 

gulp.task('browser-sync', function() {
    bs.init({
       port : 5000,
        proxy: {
          target : "localhost:3000"
        }
    });
});

gulp.task('watch', ['browser-sync'], function () {
    gulp.watch("*.html").on('change', bs.reload);
});