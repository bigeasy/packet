require('proof')(1, async (okay) => {
    const simplified = require('../../simplified')
    const path = require('path')
    const fs = require('fs').promises
    async function test (name, definition) {
        const actual = simplified(definition)
        const expected = JSON.parse(await fs.readFile(path.resolve(__dirname, 'compiled', `${name}.json`)))
        okay(actual, expected, name)
    }
    await test('minimal', { value: 16 })
})
