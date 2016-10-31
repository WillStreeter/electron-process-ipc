"use strict";
var gulp = require('gulp');
var babel = require('gulp-babel');
var clean = require('gulp-clean');
var spawn = require('child_process').spawn;
var mocha = require('gulp-mocha');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var merge = require('merge2');
var tsSrcProject = ts.createProject('tsconfig.json', {
    sourceMap: true,
    declaration: true
});
var tsTestProject = ts.createProject('tsconfig.json', {
    sourceMap: true
});
var node;
gulp.task('clean', function () {
    return gulp.src('dist/**/*.*', { read: false })
        .pipe(clean());
});
gulp.task('build:ts', function () {
    var tsResult = gulp.src(['./src/**/*.ts', './typings/index.d.ts'])
        .pipe(sourcemaps.init())
        .pipe(ts(tsSrcProject));
    return merge([
        tsResult.js.pipe(sourcemaps.write('.', { sourceRoot: './src' }))
            .pipe(gulp.dest('./dist/src')),
        tsResult.dts.pipe(gulp.dest('./dist/typings'))
    ]);
});
gulp.task('build:test', function () {
    var tsResult = gulp.src(['./test/**/*.ts', './typings/index.d.ts'])
        .pipe(sourcemaps.init())
        .pipe(ts(tsTestProject));
    return tsResult.js.pipe(sourcemaps.write('.', { sourceRoot: './test' }))
        .pipe(gulp.dest('./dist/test'));
});
gulp.task('watch-and-build:ts', ['build:ts'], function () {
    return gulp.watch('src/**/*.ts', ['build:ts']);
});
gulp.task('test', ['build:src', 'build:test'], function () {
    return gulp.src(['./dist/test/**/*.js'])
        .pipe(mocha({ timeout: 20000 }));
});
gulp.task('build:src', ['build:ts']);
gulp.task('dev', ['watch-and-build:ts']);
//# sourceMappingURL=gulpfile.js.map