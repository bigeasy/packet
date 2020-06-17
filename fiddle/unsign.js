function unsign (name, bits) {
    const mask = `0x${((1n << BigInt(bits)) - 1n).toString(16)}`
    const test = `0x${(1n << BigInt(bits) - 1n).toString(16)}`
    const cast = bits > 32
        ? { to: 'Number', from: 'BigInt', suffix: 'n' }
        : { to: '', from: '', suffix: '' }
    return `${name} & ${test}${cast.suffix} ` +
        `? (${mask}${cast.suffix} - ${name} + 1${cast.suffix}) * -1${cast.suffix} ` +
        `: ${name}`
}

module.exports = unsign
