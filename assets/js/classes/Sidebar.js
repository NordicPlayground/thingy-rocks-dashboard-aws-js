class Sidebar {
    constructor() {
        this.isOpen = true;
        this.DOM = {};
        this.DOM.body = document.querySelector('body');
        this.DOM.sidebar = document.querySelector('.sidebar');
        this.DOM.toggle = document.querySelector('.sidebar-toggle');
        this.DOM.data = this.DOM.sidebar.querySelector('.sidebar-data');
        this.DOM.deviceInfo = this.DOM.sidebar.querySelector('.device-info');
        this.DOM.locationName = this.DOM.deviceInfo.querySelector('.device-location-name');
        this.DOM.coordinates = this.DOM.deviceInfo.querySelector('.device-location-coords .coordinates');
        this.DOM.deviceData = this.DOM.deviceInfo.querySelector('.device-data');
        this.DOM.deviceList = this.DOM.sidebar.querySelector('.device-list');
        this.init();
    }

    init() {
        console.log('init');
        this.isOpenTest();
        this.populateData();
        this.clickEvents();
    }

    openSidebar() {
        this.DOM.sidebar.classList.add('open');
        this.DOM.body.classList.add('open-sidebar');
    }
    closeSidebar() {
        this.DOM.sidebar.classList.remove('open');
        this.DOM.body.classList.remove('open-sidebar');
    }
    closeMobileSidebar() {
        document.querySelector('.mobile-sidebar').classList.remove('reveal');
    }

    isOpenTest() {
        this.isOpen = this.DOM.sidebar.classList.contains('open') ? true : false;
    }

    populateData(data = null) {
        if (null !== data) {
            this.DOM.locationName = data.locationName;
            this.DOM.coordinates = data.coordinates;

            for (let i = 0; i < data.datapoints.length; i++) {
                this.addDatumBlock(data.datapoints[i]);
            }
        }
    }

    addDatumBlock(datum) {
        let datumBlock = document.createElement('div');
        datumBlock.classList.add('data-display__datum');

        let datumName = datum.name !== null ? document.createElement('h3') : false;
        if (datumName) {
            datumName.classList.add('datum-name');
            datumName.innerText(datum.name);
            datumBlock.appendChild(datumName);
        }
        let datumInfo = datum.info !== null ? document.createElement('p') : false;
        if (datumInfo) {
            datumInfo.classList.add('datum-info');
            datumInfo.innerText(datum.info);
            datumBlock.appendChild(datumInfo);
        }
        this.DOM.deviceData.append(datumBlock);
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
        handleEvent('click', {
            el: this.DOM.toggle,
            callback: () => {
                this.toggleOpen();
            }
        });

        var devices = this.DOM.deviceList.querySelectorAll('li');
        for (let i = 0; i < devices.length; i++) {
            let el = devices[i];
            handleEvent('click', {
                el: el,
                callback: () => {
                    console.log(el);
                }
            });
        }
    }
}
