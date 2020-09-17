class DeviceDatum {
    constructor(name, info) {
        console.log('name + info = ' + name + info);
        this.deviceDatum = document.createElement('div');
        this.deviceDatum.classList.add('device-data__datum');

        this.deviceDatumName = document.createElement('h3');
        this.deviceDatumName.classList.add('datum-name');
        this.deviceDatumName.innerHTML = name;

        this.deviceDatumInfo = document.createElement('p');
        this.deviceDatumInfo.classList.add('datum-info');
        this.deviceDatumInfo.innerHTML = info;

        this.deviceDatum.appendChild(this.deviceDatumName);
        this.deviceDatum.appendChild(this.deviceDatumInfo);
    }

    returnNode() {
        return this.deviceDatum;
    }
}