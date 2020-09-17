class Globe {
    constructor(data) {

        var sidebar = new Sidebar();


        var viewer = this.initViewer();
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 200000;
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 200000;
        viewer.scene.screenSpaceCameraController._minimumZoomRate = 300;
        var controls = this.initControls();

        this.addPoints(viewer, data);
        this.clickAction(viewer, sidebar);
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
        var deviceList = document.querySelector('.device-list');

        if (dataPoints.length > 1) {
            for (let i = 0; i < dataPoints.length; i++) {
                this.addPoint(viewer, dataPoints[i], deviceList);
            }
            //populate sidebar and auto-click first of last thingy?
        }
    }

    addPoint(viewer, data, deviceList) {
        var listEntry = this.createListEntry(viewer, data, deviceList);
        var entity = viewer.entities.add({
            position: data.position,
            properties: {
                name: data.properties.name,
                coords: data.properties.coords,
                list_entry: listEntry,
                data: data.properties.data
            },
            billboard: {
                image: 'assets/img/nordic-icon-b.svg'
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
                viewer.flyTo(viewer.selectedEntity);
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
        coords.innerHTML = props._coords;
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