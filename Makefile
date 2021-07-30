all: test/readme/readme.t.js README.md

test/readme/readme.t.js: edify.md
	edify --mode code $< > $@
README.md: edify.md
	edify --mode text $< > $@
