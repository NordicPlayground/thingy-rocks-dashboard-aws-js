class Sidebar {
  constructor() {
    this.isOpen = true;
    this.DOM = {};
    this.DOM.body = document.querySelector("body");
    this.DOM.sidebar = document.querySelector(".sidebar");
    this.DOM.toggle = document.querySelector(".sidebar-toggle");
    this.DOM.data = this.DOM.sidebar.querySelector(".sidebar-data");
    this.DOM.deviceInfo = this.DOM.sidebar.querySelector(".device-info");
    this.DOM.locationName = this.DOM.deviceInfo.querySelector(
      ".device-location-name"
    );
    this.DOM.coordinates = this.DOM.deviceInfo.querySelector(
      ".device-location-coords .coordinates"
    );
    this.DOM.deviceData = this.DOM.deviceInfo.querySelector(".device-data");
    this.DOM.deviceList = this.DOM.sidebar.querySelector(".device-list");
    this.init();
  }

  init() {
    console.log("init");
    this.isOpenTest();
    this.clickEvents();
  }

  openSidebar() {
    this.DOM.sidebar.classList.add("open");
    this.DOM.body.classList.add("open-sidebar");
  }
  closeSidebar() {
    this.DOM.sidebar.classList.remove("open");
    this.DOM.body.classList.remove("open-sidebar");
  }
  closeMobileSidebar() {
    document.querySelector(".mobile-sidebar").classList.remove("reveal");
  }

  isOpenTest() {
    this.isOpen = this.DOM.sidebar.classList.contains("open") ? true : false;
  }

  toggleOpen() {
    this.isOpenTest();
    if (this.isOpen == true) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  clickEvents() {
    //toggle sidebar 'open'
    handleEvent("click", {
      el: this.DOM.toggle,
      callback: () => {
        this.toggleOpen();
      },
    });

    var devices = this.DOM.deviceList.querySelectorAll("li");
    for (let i = 0; i < devices.length; i++) {
      let el = devices[i];
      handleEvent("click", {
        el: el,
        callback: () => {
          console.log(el);
        },
      });
    }
  }
}
