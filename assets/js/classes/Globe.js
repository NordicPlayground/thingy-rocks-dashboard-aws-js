class Globe {
    constructor(data) {

        var sidebar = new Sidebar();


        var viewer = this.initViewer();
        var scene = this.configScene(viewer);
        var controls = this.initControls();
        // console.log(data);
        this.addPoints(viewer, data, sidebar);
        this.clickAction(viewer, sidebar);

        viewer.scene.postRender.addEventListener(function(rendered) {
            if (viewer.scene.globe.tilesLoaded == true && document.querySelector('.intro-container') && !document.querySelector('.intro-container').classList.contains('globe-rendered')) {
                document.querySelector('.intro-container').classList.add('globe-rendered');
                document.querySelector('.message').innerHTML = 'Click Anywhere to Begin.';
            }

        });
    }

    configScene(viewer) {

        viewer.scene.screenSpaceCameraController.enableTilt = false;



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


    }

    initViewer() {
        var imagery = Cesium.createDefaultImageryProviderViewModels();
        return new Cesium.Viewer("cesiumContainer", {
            imageryProviderViewModels: imagery,
            selectedImageryProviderViewModel: imagery[1]
                //     // animation: true,
                //     // timeline: false,
                //     // selectionIndicator: true,
                //     // requestRenderMode: true
        });
    }

    initControls() {

        // return new Cesium.CesiumWidget('toolbar', {
        //     scene3DOnly: true,
        //     requestRenderMode: true
        // })
    }



    addPoints(viewer, dataPoints, sidebar) {
        // console.log(dataPoints);
        // console.log(typeof(dataPoints));
        var deviceList = document.querySelector('.device-list');
        //// The globe stopped rendering after changing to real data, and this specific loop...
        if (Object.keys(dataPoints).length > 1) {
            for (const device in dataPoints) {
                console.log(typeof(dataPoints[device]))
                this.addPoint(viewer, dataPoints[device], deviceList, sidebar);
            }
            //populate sidebar and auto-click first of last thingy?
        }
    }


    addPoint(viewer, data, deviceList, sidebar) {
        console.log(data.position);
        let showEntity = data.properties.coords == null ? false : true;
        // console.log('DDDDD:' + data.properties.coords);
        // console.log(viewer);
        // console.log(deviceList);
        let listEntry = this.createListEntry(viewer, data, deviceList);
        let entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(data.position[1], data.position[0]),
            properties: {
                name: data.properties.name,
                coords: data.properties.coords,
                list_entry: listEntry,
                data: data.properties.data,
                timestamps: data.properties.timestamp
            },
            // box: {
            //     dimensions: new Cesium.Cartesian3(10000.0, 10000.0, 0.0),
            //     // distanceDisplayCondition: (0.0, 1.0),
            //     show: true,
            //     fill: false,
            //     outline: false

            // },
            // TODO: fix the icons and the sizing and clickable space
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
        // listEntry.addEventListener('click', function() {

        //     })
        // new Cesium.ScreenSpaceEventHandler(viewer.canvas)
        deviceList.appendChild(listEntry);

        return listEntry;
    }

    clickAction(viewer, sidebar) {

        viewer.selectedEntityChanged.addEventListener(function() {
            if (document.querySelector('.infobox')) {
                document.querySelector('.infobox').remove();
            }
            console.log(viewer);
            Globe.resetIcons(viewer);
            if (undefined !== viewer.selectedEntity) {
                console.log(viewer.selectedEntity);
                Globe.populateSidebar(viewer.selectedEntity);
                Globe.populateMobileData(viewer.selectedEntity);
                viewer.selectedEntity.billboard.image = 'assets/img/nordic-icon-y.svg';
                var listEntry = viewer.selectedEntity._properties._list_entry._value;
                if (undefined !== listEntry) {
                    null !== document.querySelector('.device-list li.active') ? document.querySelector('.device-list li.active').classList.remove('active') : false;

                    listEntry.classList.add('active');
                }
                console.log(viewer.selectedEntity._position._value);
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
    static populateSidebar(entity) {
        var props = entity._properties;

        var deviceData = document.querySelector('.data-display');
        var name = deviceData.querySelector('.device-location-name-label');
        var coords = deviceData.querySelector('.coordinates');
        var datumContainer = deviceData.querySelector('.device-data');

        name.innerHTML = props._name;
        coords.innerHTML = props._coords._value == null ? 'No GPS Data Available' : props._coords;
        // create datum blocks
        if (undefined !== props._data._value) {
            // clear out the data blocks in the sidebar
            while (document.querySelector('.device-data').firstChild) {
                datumContainer.removeChild(document.querySelector('.device-data').firstChild);
            }
            console.log(props._data._value);
            console.log(props._timestamps._value);
            for (const name in props._data._value) {
                var dataBlock = new DeviceDatum(name, props._data._value[name], props._timestamps._value[name]).returnNode();
                datumContainer.appendChild(dataBlock);
            }
        }
    }
    static populateMobileData(entity) {
        var props = entity._properties;

        var deviceData = document.querySelector('.mobile-sidebar .data-display');
        var name = deviceData.querySelector('.device-location-name-label');
        var coords = deviceData.querySelector('.coordinates');
        var datumContainer = deviceData.querySelector('.mobile-sidebar .device-data');

        name.innerHTML = props._name;
        coords.innerHTML = props._coords._value == null ? 'No GPS Data Available' : props._coords;
        // create datum blocks
        if (undefined !== props._data._value) {
            // clear out the data blocks in the sidebar
            while (document.querySelector('.mobile-sidebar .device-data').firstChild) {
                datumContainer.removeChild(document.querySelector('.mobile-sidebar .device-data').firstChild);
            }
            console.log(props._data._value);
            for (const name in props._data._value) {
                var dataBlock = new DeviceDatum(name, props._data._value[name], props._timestamps._value[name]).returnNode();
                datumContainer.appendChild(dataBlock);
            }
        }
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