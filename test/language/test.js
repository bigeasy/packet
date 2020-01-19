module.exports = async function test (name, definition) {
        const actual = simplified(definition)
        const expected = JSON.parse(await fs.readFile(path.resolve(__dirname, 'compiled', `${name}.json`)))
        okay(actual, expected, name)
    }
