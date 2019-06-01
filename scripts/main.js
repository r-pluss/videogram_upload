const options = {
    controls: true,
    fluid: false,
    height: 240,
    plugins: {
        record: {
            audio: true,
            debug: true,
            maxLength: 10,
            video: true
        }
    },
    width: 320
};

const player = videojs('message-recorder', options, readyCB);
const qrContainer = document.getElementById('qr-code-container');
const qrURLroot = 'https://r-pluss.github.io/videogram_upload/?msg=';
const uploadURL = 'https://file.io/?expires=1d';

function createQRCode(uri){
    let qr = document.createElement('div');
    new QRCode(qr, uri);
    qrContainer.appendChild(qr);
}

function loadApp(){
    if(window.location.search.length > 0){
        qrContainer.classList.remove('hidden');
    }else{
        player.el().classList.remove('hidden');
    }
}

function readyCB(){
    let msg = `Using video.js ${videojs.VERSION} with videojs-record ${videojs.getPluginVersion('record')} and recordrtc ${RecordRTC.version}`;
    videojs.log(msg);
}

function simulateUpload(blob){
    let data = new FormData();
    data.append('file', blob, blob.name);
    console.log(`uploading recording ${blob.name} to ${uploadURL}.`);
    console.log(blob);
    console.log(data);
}

function upload(blob){
    let data = new FormData();
    data.append('file', blob, blob.name);
    window.fetch(uploadURL, {method: 'POST', body: data}).then(
        function(response){
            return response.json();
        }
    ).then(
        function(json){
            console.log(JSON.stringify(json));
            if(json.success){
                console.log(`video available @ ${json.link}`);
                qrContainer.classList.remove('hidden');
                createQRCode(`${qrURLroot}json.key`);
            }
        }
    ).catch(
        function(err){
            console.log(`An error occurred with the Fetch API: ${err}`);
        }
    )
}
// error handling
player.on('deviceError', function() {
    console.log('device error:', player.deviceErrorCode);
});
player.on('error', function(element, error) {
    console.error(error);
});
// user clicked the record button and started recording
player.on('startRecord', function() {
    console.log('started recording!');
});
// user completed recording and stream is available
player.on('finishRecord', function() {
    // the blob object contains the recorded data that
    // can be downloaded by the user, stored on server etc.
    upload(player.recordedData);
});

loadApp();
