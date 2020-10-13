class DeviceDatum {
    constructor(name, info, timestamp) {
        console.log('name + info + timestamp = ' + name + info + timestamp);
        this.deviceDatum = document.createElement('div');
        this.deviceDatum.classList.add('device-data__datum');

        this.deviceDatumName = document.createElement('h3');
        this.deviceDatumName.classList.add('datum-name');
        this.deviceDatumName.innerHTML = name;

        this.deviceDatumInfo = document.createElement('p');
        this.deviceDatumInfo.classList.add('datum-info');
        this.deviceDatumInfo.innerHTML = info;

        this.deviceDatumTimestamp = document.createElement('p');
        this.deviceDatumTimestamp.classList.add('datum-timestamp');
        this.deviceDatumTimestamp.innerHTML = 'updated ' + timestamp;

        this.deviceDatum.appendChild(this.deviceDatumName);
        this.deviceDatum.appendChild(this.deviceDatumInfo);
        this.deviceDatum.appendChild(this.deviceDatumTimestamp);
    }

    returnNode() {
        return this.deviceDatum;
    }
}