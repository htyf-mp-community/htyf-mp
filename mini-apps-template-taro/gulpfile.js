
const gulp = require('gulp');
const shell = require('shelljs');
const path = require('path');
const fse = require('fs-extra');
const { env } = require('process');

function build() {
  try {
    console.log('=====  =====')
    // shell.exec(`npm run build:dgz`, (err) => {
    //   console.log(err)
    // })
  } catch (error) {
    console.error(error)
  }
}

gulp.task('watch-all-files', function(done) {
  build();
  if (env._BUILD_TYPE_ === 'watch') {
    // 监听指定目录内所有文件的变化
    return gulp.watch('./src/**', function(done) {
      build();
      done();
    })
  } else {
    done();
  }
});

// 默认任务
gulp.task('default', gulp.series('watch-all-files'));