
const gulp = require('gulp');
const shell = require('shelljs');
const path = require('path');
const fse = require('fs-extra');
const axios = require('axios');
const { env } = require('process');
const _ = require('lodash')
const build = _.throttle(function build() {
  try {
    const url = `http://localhost:8089/index.bundle?platform=ios&dev=true&time=${Date.now()}`;
    axios.get(url)
    .then(response => {
    })
    .catch(error => {
      build()
    });
  } catch (error) {
  }
}, 300)

gulp.task('watch-all-files', function(done) {
  build();
  return gulp.watch('./src/**', function(done) {
    build();
    done();
  })
});

// 默认任务
gulp.task('default', gulp.series('watch-all-files'));