sources = css/packet.css index.html

all: $(sources)

watch: all
	fswatch pages/*.html | (while read -r line; do make < /dev/null; done)

css/%.css: css/%.less
	node_modules/.bin/lessc $< > $@ || rm -f $@

%.html: pages/%.html
	node node_modules/edify/edify.bin.js $< $@

clean:
	rm $(sources)

serve:
	node_modules/.bin/serve -p 4000
