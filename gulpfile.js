const { src, dest, parallel } = require("gulp");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");

function javascript(cb) {
  src(["assets/js/classes/*.js", "assets/js/*.js"])
    .pipe(uglify())
    .pipe(
      rename(function (path) {
        path.basename += "-min";
      })
    )
    .pipe(dest("build/js/"));

  src([
    "assets/js/Cesium-1.75/Build/Cesium/**",
    "!assets/js/Cesium-1.75/Build/Cesium/Cesium.js",
  ]).pipe(dest("build/js/Cesium"));
  src(["assets/js/Cesium-1.75/Build/Cesium/Cesium.js"])
    .pipe(uglify())
    .pipe(dest("build/js/Cesium/"));
  cb();
}

function scss(cb) {
  src("assets/scss/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(concat("styles-min.css"))
    .pipe(cleanCSS())
    .pipe(dest("build/"));
  cb();
}

function imagesAndFonts(cb) {
  src(["assets/favicon.png", "assets/index.html"]).pipe(dest("build/"));
  src("assets/img/**").pipe(dest("build/img/"));
  src("assets/fonts/**").pipe(dest("build/fonts"));
  cb();
}

exports.default = parallel(javascript, scss, imagesAndFonts);
