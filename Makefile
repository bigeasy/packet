all: css/packet.css index.html

watch: all
	@inotifywait -q -m -e modify packet/docs css | while read line; \
		do \
		if echo $$line | grep '.\(less\|html\)$$'; then \
			make --no-print-directory all; \
	fi \
	done;

css/%.css: css/%.less
	node_modules/.bin/lessc $< > $@ || rm -f $@

%.html: packet/docs/%.html
	node node_modules/edify/edify.bin.js $< $@
