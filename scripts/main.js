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

function readyCB(){
    let msg = `Using video.js ${videojs.VERSION} with videojs-record ${videojs.getPluginVersion('record')} and recordrtc ${RecordRTC.version}`;
    videojs.log(msg);
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
    console.log('finished recording: ', player.recordedData);
});
