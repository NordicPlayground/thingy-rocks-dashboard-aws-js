const handleEvent=(e,{el:t,callback:n,useCapture:o=!1}={},i)=>{const r=t||document.documentElement;function s(e){e.preventDefault(),e.stopPropagation(),"function"==typeof n&&n.call(i,e)}return s.destroy=function(){return r.removeEventListener(e,s,o)},r.addEventListener(e,s,o),s};function loadScript(e,t){var n,o,i;o=!1,(n=document.createElement("script")).type="text/javascript",n.src=e,n.onload=n.onreadystatechange=function(){o||this.readyState&&"complete"!=this.readyState||(o=!0,t())},(i=document.getElementsByTagName("script")[0]).parentNode.insertBefore(n,i)}function globeBuild(){let e=[{position:Cesium.Cartesian3.fromDegrees(-122.675,45.5051),properties:{coords:"45.5051° N, 122.6750° W",name:"Portland Or",data:{"first number":48.5051,"string thing":"45°"}}},{position:Cesium.Cartesian3.fromDegrees(-122.675,48.5051),properties:{coords:"48.5051° N, 122.6750° W",name:"Paris France",data:{"first thing":2138.5555,"second thing":"72%"}}}];new Globe(e)}document.addEventListener("DOMContentLoaded",(function(){console.log("DOMContentLoaded"),loadScript("https://cesium.com/downloads/cesiumjs/releases/1.73/Build/Cesium/Cesium.js",globeBuild),window.setTimeout((function(){document.querySelector("body").classList.add("loaded"),document.querySelector(".sidebar").classList.add("open")}),800),document.querySelector(".intro-container").addEventListener("click",(function(){this.classList.add("hidden"),window.setTimeout((function(){document.querySelector(".intro-container").remove()}),800)}))}));