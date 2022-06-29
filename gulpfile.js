const { src, dest, parallel, series } = require("gulp");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const replace = require("gulp-replace");
require("dotenv").config();

function checkToken(cb) {
  const cesiumToken = process.env.CESIUM_ION_ACCESS_TOKEN;
  if (cesiumToken === "") {
    console.error("\nCesium Token must be defined\n");
    process.exit(0);
  }
  console.log("CESIUM_ION_ACCESS_TOKEN: ", cesiumToken);
  cb();
}

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
    // insert the Cesium token inline
    .pipe(
      replace("CESIUM_ION_ACCESS_TOKEN", process.env.CESIUM_ION_ACCESS_TOKEN)
    )
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

exports.default = series(
  checkToken,
  parallel(javascript, scss, imagesAndFonts)
);
