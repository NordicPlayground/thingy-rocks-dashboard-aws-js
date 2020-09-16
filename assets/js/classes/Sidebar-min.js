class Sidebar{constructor(){this.isOpen=!0,this.DOM={},this.DOM.sidebar=document.querySelector(".sidebar"),this.DOM.toggle=document.querySelector(".sidebar-toggle"),this.DOM.data=this.DOM.sidebar.querySelector(".sidebar-data"),this.DOM.deviceInfo=this.DOM.sidebar.querySelector(".device-info"),this.DOM.locationName=this.DOM.deviceInfo.querySelector(".device-location-name"),this.DOM.coordinates=this.DOM.deviceInfo.querySelector(".device-location-coords .coordinates"),this.DOM.deviceData=this.DOM.deviceInfo.querySelector(".device-data"),this.DOM.deviceList=this.DOM.sidebar.querySelector(".device-list"),this.init()}init(){console.log("init"),this.isOpenTest(),this.populateData(),this.clickEvents()}openSidebar(){this.DOM.sidebar.classList.add("open")}closeSidebar(){this.DOM.sidebar.classList.remove("open")}isOpenTest(){this.isOpen=!!this.DOM.sidebar.classList.contains("open"),console.log("open test")}populateData(e=null){if(null!==e){this.DOM.locationName=e.locationName,this.DOM.coordinates=e.coordinates;for(let t=0;t<e.datapoints.length;t++)this.addDatumBlock(e.datapoints[t])}}addDatumBlock(e){let t=document.createElement("div");t.classList.add("data-display__datum");let i=null!==e.name&&document.createElement("h3");i&&(i.classList.add("datum-name"),i.innerText(e.name),t.appendChild(i));let s=null!==e.info&&document.createElement("p");s&&(s.classList.add("datum-info"),s.innerText(e.info),t.appendChild(s)),this.DOM.deviceData.append(t)}clickEvents(){handleEvent("click",{el:this.DOM.toggle,callback:()=>{this.isOpenTest(),1==this.isOpen?this.closeSidebar():this.openSidebar()}});var e=this.DOM.deviceList.querySelectorAll("li");for(let t=0;t<e.length;t++){let i=e[t];handleEvent("click",{el:i,callback:()=>{console.log(i)}})}}}