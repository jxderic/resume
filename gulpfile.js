var gulp = require('gulp');
// 引入一个服务模块
var webserver = require('gulp-webserver');
// url,fs
var url = require('url');
var fs = require('fs');
// sass
var sass = require('gulp-sass');
// gulp-minify-css
var minifyCss = require('gulp-minify-css');
// js
var uglify = require('gulp-uglify');
var webpack = require('gulp-webpack');

// version
var named = require('vinyl-named'); // 重命名模块
var rev = require('gulp-rev'); //版本生成操作
var revCollector = require('gulp-rev-collector') //版本选择
var watch = require('gulp-watch'); //监控
var sequence = require('gulp-watch-sequence');
// var minifyHTML = require('gulp-minify-html');


gulp.task('webserver', function () {
    gulp.src('www').
    pipe(webserver({
        livereload: true, // 热加载，代码的自动刷新
        open: true,

        middleware: function (req, res, next) {
            var urlObj = url.parse(req.url, true),
                method = req.method;
            switch (urlObj.pathname) {
                case '/api/skill.php':
                    res.setHeader('Content-Type', 'application/json');
                    fs.readFile('mock/skill.json', 'utf-8', function (err, data) {
                        res.end(data);
                    })
                    return;


                case '/api/project.php':
                    res.setHeader('Content-Type', 'application/json');
                    fs.readFile('mock/project.json', 'utf-8', function (err, data) {
                        res.end(data);
                    })
                    return;


                case '/api/work.php':
                    res.setHeader('Content-Type', 'application/json');
                    fs.readFile('mock/work.json', 'utf-8', function (err, data) {
                        res.end(data);
                    })
                    return;


                case '/api/me.php':
                    res.setHeader('Content-Type', 'application/json');
                    fs.readFile('mock/me.json', 'utf-8', function (err, data) {
                        res.end(data);
                    })
                    return;

                default:
                    ;
            }
            next();
        }
    }))
})
// www,dist
// 复制首页文件
gulp.task('copy-index', function () {
    return gulp.src('./src/index.html')
        .pipe(gulp.dest('./www'));
})

// 复制图片文件，静态资源文件
gulp.task('copy-images', function () {
    return gulp.src('./src/images/**')
        .pipe(gulp.dest('./www/images'))
})

// 复制图片文件，静态资源文件
gulp.task('copy-font', function () {
    return gulp.src('./src/font/**')
        .pipe(gulp.dest('./www/font'))
})


// 复制资源文件
gulp.task('copy-resources', function () {
    return gulp.src('./src/resources/**')
        .pipe(gulp.dest('./www/resources'))
})


// sass转化
gulp.task('sass', function () {
    return gulp.src('./src/css/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./www/css'))
})

// 模块化开发，重点内容 
var jsFiles = ['src/js/index.js'];

gulp.task('packjs', function () {
    return gulp.src(jsFiles)
        .pipe(named())
        .pipe(webpack())
        .pipe(uglify())
        .pipe(gulp.dest('./www/js'))
})

// 版本控制，注意，这个版本控制是css、js的代码的版本控制，不是和svn/git一样的代码控制概念
var cssDistFiles = ['./www/css/index.css'];
var jsDistFiles = ['./www/js/index.js'];

// css ver控制
gulp.task('verCss', function () {
    return gulp.src(cssDistFiles)
        .pipe(rev())
        .pipe(gulp.dest('./www/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./www/ver/css'))
})

// js ver控制
gulp.task('verJs', function () {
    return gulp.src(jsDistFiles)
        .pipe(rev())
        .pipe(gulp.dest('./www/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./www/ver/js'))
})

// html版本字符串的替换操作
gulp.task('html', function () {
    return gulp.src(['./www/ver/**/*.json', './www/*.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest('./www/'))
})

gulp.task('watch', function () {
    gulp.watch('./src/index.html', ['copy-index']);
    gulp.watch('./src/images/**', ['copy-images']);
    gulp.watch('./src/resources/**', ['copy-resources']);
    gulp.watch('./src/font/**', ['copy-font']);

    // 队列
    var queue = sequence(300);
    watch('./src/js/**/*.js', {
        name: "JS",
        emitOnGlob: false
    }, queue.getHandler('packjs', 'verJs', 'html'))


    watch('./src/css/**', {
        name: "CSS",
        emitOnGlob: false
    }, queue.getHandler('sass', 'verCss', 'html'))


})

gulp.task('default', ['webserver', 'watch']);