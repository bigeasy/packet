var pushed = cadence(function (async) {
    async(function () {
        pusher.parse(definition.header, async())
    }, function (header) {
        switch (header.type) {
        case 'dolphin':
            async(function () {
                pusher.parse(definition.doplhin, async())
            }, function (dolphin) {
                doSomethingDolphinRelated(dolphin)
            })
            break
        case 'elephant':
            break
        }
    })
})
