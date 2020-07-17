module.exports = function ({ serializers }) {
    serializers.all.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $_, $i = [], $$ = []

                $$[0] = (function(value){cov_1d8h8zdhpb().f[4]++;const buffer=(cov_1d8h8zdhpb().s[13]++,Buffer.alloc(8));cov_1d8h8zdhpb().s[14]++;buffer.writeDoubleLE(value);cov_1d8h8zdhpb().s[15]++;return buffer;})(object.value)

                $_ = 0
                $$[0].copy($buffer, $start)
                $start += $$[0].length
                $_ += $$[0].length

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
