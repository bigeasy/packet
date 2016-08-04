streamer.on('readable', function () {
    var record
    while ((record = streamer.read()) != null) {
        switch (record.type) {
        case 'header':
            streamer.parser = parsers.body
            break
        }
    }
})
