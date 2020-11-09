class Globe {
    constructor(data) {

        this.sidebar = new Sidebar();

        this.viewer = this.initViewer();
        this.configScene(this.viewer);
        this.getDevices();
        this.clickAction(this.viewer, this.sidebar);


    }

    configScene(viewer) {
        // scene settings
        viewer.scene.screenSpaceCameraController.enableTilt = false;

        // zoom control buttons
        document.querySelector('#zoom-out').addEventListener('click', function() {
            var ellipsoid = viewer.scene.globe.ellipsoid;
            var cameraHeight = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
            var moveRate = cameraHeight < 300000 ? cameraHeight / 15.0 : cameraHeight / 5.0;
            console.log(cameraHeight);
            viewer.camera.moveBackward(moveRate);
        });
        document.querySelector('#zoom-in').addEventListener('click', function() {
            var ellipsoid = viewer.scene.globe.ellipsoid;
            var cameraHeight = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
            var moveRate = cameraHeight < 300000 ? cameraHeight / 15.0 : cameraHeight / 5.0;
            console.log(cameraHeight);
            viewer.camera.moveForward(moveRate);
        });
        return viewer;
    }

    initViewer() {
        var imagery = Cesium.createDefaultImageryProviderViewModels();
        var viewer = new Cesium.Viewer("cesiumContainer", {
            imageryProviderViewModels: imagery,
            selectedImageryProviderViewModel: imagery[1]

        });
        viewer.scene.postRender.addEventListener(function(rendered) {
            if (viewer.scene.globe.tilesLoaded == true && document.querySelector('.intro-container') && !document.querySelector('.intro-container').classList.contains('globe-rendered')) {
                document.querySelector('.intro-container').classList.add('globe-rendered');
                document.querySelector('.message').innerHTML = 'Click Anywhere to Begin.';
            }

        });
        return viewer;
    }

    getDevices() {
        var deviceList = document.querySelector('.device-list');
        var viewer = this.viewer;
        var sidebar = this.sidebar;
        var globe = this;
        var call = getAjaxSettings("https://api.nrfcloud.com/v1/devices?includeState=true&includeStateMeta=true&pageSort=desc");

        $.ajax(call).done(function(response) {
            var devices = response.items;
            var deviceArray = [];

            for (let i = 0; i < devices.length; i++) {

                deviceArray[devices[i].id] = new Device(devices[i]);
            }
            globe.addPoints(deviceArray);
        });
    }

    addPoints(dataPoints) {
        var deviceList = document.querySelector('.device-list');
        var viewer = this.viewer;
        var sidebar = this.sidebar;
        var globe = this;

        if (Object.keys(dataPoints).length > 1) {
            console.log(dataPoints);
            for (const device in dataPoints) {
                console.log(dataPoints[device]);
                globe.addPoint(viewer, dataPoints[device], deviceList, sidebar);
            }
        }
    }


    addPoint(viewer, data, deviceList, sidebar) {
        console.log(data);
        let showEntity = data.position == undefined ? false : true;
        let position = showEntity == true ? Cesium.Cartesian3.fromDegrees(data.position[1], data.position[0]) : null;
        let listEntry = this.createListEntry(viewer, data, deviceList);
        let entity = viewer.entities.add({
            position: position,
            properties: {
                id: data.id,
                name: data.properties.name,
                coords: data.gps.readable,
                list_entry: listEntry,
                data: data.properties.data,
            },
            billboard: {
                height: 32,
                width: 32,
                image: 'assets/img/nordic-icon-g.svg',
                show: showEntity,
            }
        });
        listEntry.addEventListener('click', function() {
            viewer.selectedEntity = entity;
            if (window.innerWidth < 771) {
                sidebar.closeSidebar();
            }
        })
    }

    createListEntry(viewer, data, deviceList) {
        let listEntry = document.createElement('li');
        listEntry.innerHTML = '<a href="#" class="' + data.properties.connected + '">' + data.properties.name + '</a>';
        deviceList.appendChild(listEntry);

        return listEntry;
    }

    clickAction(viewer, sidebar) {
        viewer.selectedEntityChanged.addEventListener(function() {
            if (document.querySelector('.infobox')) {
                document.querySelector('.infobox').remove();
            }
            console.log(viewer.selectedEntity._properties.id._value);
            Globe.resetIcons(viewer);
            if (undefined !== viewer.selectedEntity) {
                Globe.getMessagesForDevice(viewer.selectedEntity._properties._id._value);
                Globe.populateSidebar(viewer.selectedEntity);
                Globe.populateMobileData(viewer.selectedEntity);
                viewer.selectedEntity.billboard.image = 'assets/img/nordic-icon-y.svg';
                var listEntry = viewer.selectedEntity._properties._list_entry._value;
                if (undefined !== listEntry) {
                    null !== document.querySelector('.device-list li.active') ? document.querySelector('.device-list li.active').classList.remove('active') : false;
                    listEntry.classList.add('active');
                }
                viewer.flyTo(viewer.selectedEntity, {
                    offset: new Cesium.HeadingPitchRange(0, -90, 5000)
                });

                if (window.innerWidth > 770) {
                    sidebar.openSidebar();
                } else {
                    document.querySelector('.mobile-sidebar').classList.add('reveal');
                }
            } else {
                sidebar.closeSidebar();
                sidebar.closeMobileSidebar();
            }
        });
    }

    static getMessagesForDevice(deviceID) {

        var call = getAjaxSettings("https://api.nrfcloud.com/v1/messages?inclusiveStart=2018-06-18T19%3A19%3A45.902Z&exclusiveEnd=3000-06-20T19%3A19%3A45.902Z&deviceIdentifiers=" + deviceID + "&pageLimit=100&pageSort=desc");

        $('.device-data__datum.temp .datum-info').html('Loading...');
        $('.device-data__datum.humidity .datum-info').html('Loading...');
        $('.device-data__datum').show();
        $.ajax(call).done(function(response) {
            var device_temp = 0;
            var device_humid = 0;
            var messages = response.items;
            var messageResponse = {

                'Temperature': {
                    'data': null,
                    'timestamp': null
                },
                'Humidity': {
                    'data': null,
                    'timestamp': null
                },

            }
            for (let i = 0; i < messages.length; i++) {
                if (messages[i].message.appId == 'TEMP' && device_temp == 0) {
                    device_temp = 1;
                    messageResponse.Temperature.data = messages[i].message.data;
                    messageResponse.Temperature.timestamp = moment(new Date(Date.parse(messages[i].receivedAt))).format('ddd MMM DD YYYY, kk:mm:ss');
                }
                if (messages[i].message.appId == 'HUMID' && device_temp == 0) {
                    device_humid = 1;
                    messageResponse.Humidity.data = messages[i].message.data;
                    messageResponse.Humidity.timestamp = moment(new Date(Date.parse(messages[i].receivedAt))).format('ddd MMM DD YYYY, kk:mm:ss');
                }
            }
            console.log(messageResponse);
            $('.device-data__datum.temp .datum-info').html(messageResponse['Temperature']['data'] + '°');
            $('.device-data__datum.temp .datum-timestamp').html('updated ' + messageResponse['Temperature']['timestamp']);
            $('.device-data__datum.humidity .datum-info').html(messageResponse['Humidity']['data'] + '%');
            $('.device-data__datum.humidity .datum-timestamp').html('updated ' + messageResponse['Humidity']['timestamp']);
        });
    }

    static populateSidebar(entity) {
        var props = entity._properties;
        var deviceData = document.querySelector('.data-display');
        var name = deviceData.querySelector('.device-location-name-label');
        var coords = deviceData.querySelector('.coordinates');


        name.innerHTML = props._name;
        coords.innerHTML = props._coords._value == null ? 'No GPS Data Available' : props._coords;
    }

    static populateMobileData(entity) {
        var props = entity._properties;
        var deviceData = document.querySelector('.mobile-sidebar .data-display');
        var name = deviceData.querySelector('.device-location-name-label');
        var coords = deviceData.querySelector('.coordinates');
        var datumContainer = deviceData.querySelector('.mobile-sidebar .device-data');

        name.innerHTML = props._name;
        coords.innerHTML = props._coords._value == null ? 'No GPS Data Available' : props._coords;
    }

    static resetIcons(viewer) {
        console.log('resetIcons running');
        var entriesArray = viewer.entities._entities._array;
        console.log(entriesArray);
        if (undefined !== viewer.selectedEntity) {
            for (let i = 0; i < entriesArray.length; i++) {
                if (undefined !== entriesArray[i]._billboard._image) {
                    entriesArray[i].billboard.image = 'assets/img/nordic-icon-g.svg';
                }
            }
        }
    }

}