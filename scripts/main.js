const recordMode = 0;
const playbackMode = 1;
const appMode = getAppMode();
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

const appElements = {
    confirmBtn: document.getElementById('confirm-upload-btn'),
    playback: appMode === playbackMode ? videojs(
        'message-playback', options, readyCB
    ) : undefined,
    preRecordElements: document.getElementById('pre-record'),
    qrContainer: document.getElementById('qr-container'),
    recorder: appMode === recordMode ? videojs(
        'message-recorder', options, readyCB
    ) : undefined,
    postRecordElements: document.getElementById('post-record'),
    nanaLink: document.getElementById('nana-link')
};
const playbackURL = appMode === playbackMode ?
    `https://file.io/${getMessageId()}` : undefined;
const qrURLroot = 'https://r-pluss.github.io/videogram_upload/?msg=';
let userRecording = undefined;
const uploadURL = 'https://file.io/?expires=1d';

function createQRCode(uri){
    let qr = document.createElement('div');
    new QRCode(qr, uri);
    qr.addEventListener('click', function(ev){
        window.location = uri;
    });
    appElements.qrContainer.appendChild(qr);
}

function getAppMode(){
    return window.location.search.length > 0 ? playbackMode : recordMode;
}

function getMessageId(){
    return window.location.search.split('?msg=')[1];
}

function loadApp(){
    if(appMode === recordMode){
        // error handling
        appElements.recorder.on('deviceError', function() {
            console.log('device error:', appElements.recorder.deviceErrorCode);
        });
        appElements.recorder.on('error', function(element, error) {
            console.error(error);
        });
        // user clicked the record button and started recording
        appElements.recorder.on('startRecord', function() {
            console.log('started recording!');
        });
        // user completed recording and stream is available
        appElements.recorder.on('finishRecord', function() {
            // the blob object contains the recorded data that
            // can be downloaded by the user, stored on server etc.
            userRecording = appElements.recorder.recordedData;
            appElements.confirmBtn.classList.remove('hidden');
        });
        appElements.confirmBtn.addEventListener(
            'click', upload, {passive: true}
        );
    }else{
        appElements.playback.src({src: playbackURL,type: 'video/webm'});
        appElements.preRecordElements.classList.add('hidden');
        appElements.playback.el().classList.remove('hidden');
        // error handling
        appElements.playback.on('deviceError', function() {
            console.log('device error:', appElements.playback.deviceErrorCode);
        });
        appElements.playback.on('error', function(element, error) {
            console.error(error);
        });
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

function upload(){
    if(!appElements.confirmBtn.classList.contains('hidden')){
        let data = new FormData();
        data.append('file', userRecording, userRecording.name);
        window.fetch(uploadURL, {method: 'POST', body: data}).then(
            function(response){
                return response.json();
            }
        ).then(
            function(json){
                console.log(JSON.stringify(json));
                if(json.success){
                    console.log(`video available @ ${json.link}`);
                    appElements.nanaLink.appendChild(
                        document.createTextNode(
                            `${qrURLroot}${json.key}`
                        )
                    );
                    appElements.preRecordElements.classList.add('hidden');
                    appElements.postRecordElements.classList.remove('hidden');
                    createQRCode(`${qrURLroot}${json.key}`);
                }
            }
        ).catch(
            function(err){
                console.log(`An error occurred with the Fetch API: ${err}`);
            }
        )
    }else{
        console.log('Failed to execute due to confirm button being hidden.');
    }
}


loadApp();
