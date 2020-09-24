class Globe {
    constructor(data) {

        var sidebar = new Sidebar();


        var viewer = this.initViewer();
        var scene = this.configScene(viewer);
        var controls = this.initControls();
        // console.log(data);
        this.addPoints(viewer, data);
        this.clickAction(viewer, sidebar);
    }

    configScene(viewer) {
        //TODO the camera isn't right... need to control it more striclty and stop it from going off tilt or losing the globe

        // viewer.scene.screenSpaceCameraController.minimumZoomDistance = 500000;
        // viewer.scene.screenSpaceCameraController.maximumZoomDistance = 90000000;
        // viewer.scene.screenSpaceCameraController._minimumZoomRate = 300;
        // viewer.scene.screenSpaceCameraController.enableTilt = false;

        // var canvas = viewer.canvas;
        // canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
        // canvas.onclick = function() {
        //     canvas.focus();
        // };
        // var ellipsoid = viewer.scene.globe.ellipsoid;

        // // disable the default event handlers
        // viewer.scene.screenSpaceCameraController.enableRotate = false;
        // viewer.scene.screenSpaceCameraController.enableTranslate = false;
        // viewer.scene.screenSpaceCameraController.enableZoom = true;
        // viewer.scene.screenSpaceCameraController.enableTilt = false;
        // viewer.scene.screenSpaceCameraController.enableLook = true;


    }

    initViewer() {
        return new Cesium.Viewer("cesiumContainer", {
            animation: true,
            timeline: false,
            selectionIndicator: true
        });
    }

    initControls() {
        return new Cesium.CesiumWidget('toolbar', {
            scene3DOnly: true,
            requestRenderMode: true
        })
    }



    addPoints(viewer, dataPoints) {
        // console.log(dataPoints);
        // console.log(typeof(dataPoints));
        var deviceList = document.querySelector('.device-list');
        //// The globe stopped rendering after changing to real data, and this specific loop...
        if (Object.keys(dataPoints).length > 1) {
            for (const device in dataPoints) {
                console.log(typeof(dataPoints[device]))
                this.addPoint(viewer, dataPoints[device], deviceList);
            }
            //populate sidebar and auto-click first of last thingy?
        }
    }


    addPoint(viewer, data, deviceList) {
        console.log(data.position);

        // console.log(viewer);
        // console.log(deviceList);
        let listEntry = this.createListEntry(viewer, data, deviceList);
        let entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(data.position[1], data.position[0]),
            properties: {
                name: data.properties.name,
                coords: data.properties.coords,
                list_entry: listEntry,
                data: data.properties.data
            },
            viewFrom: new Cesium.Cartesian3(0, 0, 500000), // THIS DOESNT WORK...
            // TODO: fix the icons and the sizing and clickable space
            billboard: {
                rotation: 0,
                image: 'assets/img/nordic-icon-b.svg',
            }
        });
        listEntry.addEventListener('click', function() {
            viewer.selectedEntity = entity;
        })
    }

    createListEntry(viewer, data, deviceList) {
        let listEntry = document.createElement('li');
        listEntry.innerHTML = '<a href="#">' + data.properties.name + '</a>';
        listEntry.addEventListener('click', function() {

            })
            // new Cesium.ScreenSpaceEventHandler(viewer.canvas)
        deviceList.appendChild(listEntry);

        return listEntry;
    }

    clickAction(viewer, sidebar) {

        viewer.selectedEntityChanged.addEventListener(function() {
            console.log(viewer.entities);
            Globe.resetIcons(viewer);
            if (undefined !== viewer.selectedEntity) {
                console.log(viewer.selectedEntity);
                Globe.populateSidebar(viewer.selectedEntity);
                viewer.selectedEntity.billboard.image = 'assets/img/nordic-icon-y.svg';
                var listEntry = viewer.selectedEntity._properties._list_entry._value;
                if (undefined !== listEntry) {
                    null !== document.querySelector('.device-list li.active') ? document.querySelector('.device-list li.active').classList.remove('active') : false;

                    listEntry.classList.add('active');
                }
                console.log(viewer.selectedEntity._position._value);
                viewer.flyTo(viewer.selectedEntity);
                // viewer.camera.setView({
                //     // destination: { x: viewer.selectedEntity._position._value.x, y: viewer.selectedEntity._position._value.y, z: (viewer.selectedEntity._position._value.z + 500000) },
                //     destination: Cesium.Cartesian3.fromDegrees(data.position[1], data.position[0])
                //     orientation: {
                //         heading: 0.0,
                //         pitch: -Cesium.Math.PI_OVER_TWO,
                //         roll: 0.0
                //     }
                // });
                sidebar.openSidebar();
            } else {
                sidebar.closeSidebar();
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
            for (const name in props._data._value) {
                var dataBlock = new DeviceDatum(name, props._data._value[name]).returnNode();
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
                    entriesArray[i].billboard.image = 'assets/img/nordic-icon-b.svg';
                }
            }
        }
    }

}