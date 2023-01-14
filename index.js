const SimplePeer = require("simple-peer");
var myPlayer;
const connectionModal = new bootstrap.Modal('#connectionModal')
const player = new Plyr('#player');
let receiving = false
var peer;
var timer
function createPeer() {
    peer = new SimplePeer({ initiator: $('#initiator').val() == 'me', trickle: false });

    player.on('playing', function (data) {
        console.log('playing', data);
        if (receiving == false)
            peer.send(JSON.stringify({ type: 'control', data: { status: 'playing', timestamp: player.currentTime } }))
    })
    player.on('play', function (data) {
        if (receiving == false)
            peer.send(JSON.stringify({ type: 'control', data: { status: 'play', timestamp: player.currentTime } }))

        console.log('play', data);
    })
    player.on('pause', function (data) {
        if (receiving == false)
            peer.send(JSON.stringify({ type: 'control', data: { status: 'pause', timestamp: player.currentTime } }))

        console.log('pause', data);
    })
    player.on('timeupdate', function (data) {
        console.log('timeupdate', data);
        // peer.send(JSON.stringify({ type: 'pause', data: 'play' })

    })
    player.on('seeking', function (data) {
        if (receiving == false)
            console.log('seeking', { status: 'seeking', timestamp: player.currentTime });
        peer.send(JSON.stringify({ type: 'control', data: { status: 'seeking', timestamp: player.currentTime } }))
    })
    player.on('seeked', function (data) {
        if (receiving == false)
            peer.send(JSON.stringify({ type: 'control', data: { status: 'seeked', timestamp: player.currentTime } }))

    })
    player.on('stalled', function (data) {
        if (receiving == false)
            peer.send(JSON.stringify({ type: 'control', data: { status: 'pause', timestamp: player.currentTime } }))

    })
    player.on('waiting', function (data) {
        if (receiving == false)
            peer.send(JSON.stringify({ type: 'control', data: { status: 'pause', timestamp: player.currentTime } }))

    })

    $('#mysecretcode').val('')
    $('#theirsecretcode').val('')
    peer.on('signal', function (data) {
        let buf = Buffer.from(JSON.stringify(data))
        $('#mysecretcode').val(buf.toString('base64'))
    })
    peer.on('connect', () => {
        connectionModal.hide()
        setStatus('Connected')
    })

    peer.on('data', data => {
        console.log('' + data.toString());
        try {
            let event = JSON.parse(data)

            if (event.type == 'link') {
                $('#videLink').val(event.data.link)
                $('#play').click()
            }
            if (event.type == 'control') {
                switch (event.data.status) {
                    case 'pause':
                        player.pause()

                        break;
                    case 'play':
                        player.play()

                        break;
                    case 'playing':
                        player.play()

                        break;
                    case 'seeked':
                        player.play()
                        player.currentTime = parseInt(event.data.timestamp)

                        break;

                }
            }

        } catch (error) {

        }
        receiving = true;
        clearTimeout(timer)
        timer = setTimeout(function () {
            receiving = false
        }, 1000)
    })

    peer.on('close', () => {
        setStatus('Disconnected')

    })

    peer.on('end', data => {
        setStatus('Disconnected')

    })
    peer.on('pause', () => {
        setStatus('Disconnected')

    })

    peer.on('resume', data => {
        // connectionModal.hide()
        // setStatus('Connected')

    })
}

$('#initiator').change(function () {
    createPeer()
})
function setStatus(status) {
    $('#status').text(status)
}
$('#connect').click(function () {
    console.log($('#theirsecretcode').val());
    peer.signal(Buffer.from($('#theirsecretcode').val(), 'base64').toString('ascii'))
})
$('#play').click(function () {
    console.log(player);
    try {
        if (receiving == false){
            peer.send(JSON.stringify({ type: 'link', data: { link: $('#videLink').val() } }))
    
        }
    
    } catch (error) {
        
    }
  
    player.source = {
        type: 'video',

        sources: [
            {
                src: $('#videLink').val(),
            }
        ],
        poster: '/path/to/poster.jpg'
    };

    // peer.send(JSON.stringify( $('#videLink').val())
})