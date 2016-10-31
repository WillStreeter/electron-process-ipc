"use strict";

const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const spawn = require('child_process').spawn;
const mocha = require('gulp-mocha');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const merge = require('merge2');

var tsSrcProject = ts.createProject('tsconfig.json', {
  sourceMap: true,
  declaration: true
});
var tsTestProject = ts.createProject('tsconfig.json', {
  sourceMap: true
});
let node;

gulp.task('clean',()=>
  gulp.src('dist/**/*.*', {read: false})
      .pipe(clean())
);

gulp.task('build:ts',()=> {
  var tsResult = gulp.src(['./src/**/*.ts', './typings/index.d.ts'])
      .pipe(sourcemaps.init())
      .pipe(ts(tsSrcProject));

  return merge([
          tsResult.js.pipe(sourcemaps.write('.', {sourceRoot: './src'}))
          .pipe(gulp.dest('./dist/src')),
          tsResult.dts.pipe(gulp.dest('./dist/typings'))
        ]);
});

gulp.task('build:test',()=> {
  var tsResult = gulp.src(['./test/**/*.ts', './typings/index.d.ts'])
      .pipe(sourcemaps.init())
      .pipe(ts(tsTestProject));

  return tsResult.js.pipe(sourcemaps.write('.', {sourceRoot: './test'}))
      .pipe(gulp.dest('./dist/test'));
});

gulp.task('watch-and-build:ts',['build:ts'],()=>
  gulp.watch('src/**/*.ts',['build:ts'])
);

gulp.task('test',['build:src','build:test'],()=>{
  return  gulp.src(['./dist/test/**/*.js'])
              .pipe(mocha({timeout:20000}));
});

gulp.task('build:src',['build:ts']);
gulp.task('dev',['watch-and-build:ts']);