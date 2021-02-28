ETHERCALC_FILES=\
	third-party/class-js/lib/Class.js \
	third-party/wikiwyg/lib/Document/Emitter.js \
	third-party/wikiwyg/lib/Document/Emitter/HTML.js \
	third-party/wikiwyg/lib/Document/Parser.js \
	third-party/wikiwyg/lib/Document/Parser/Wikitext.js \
	static/jquery.js \
	static/vex.combined.min.js

ADDON_FILES=$(shell bash addons/addons.sh client)
ADDON_NODE_FILES=$(shell bash addons/addons.sh server)

LS_FILES=$(wildcard src/*.ls)

JS_FILES=$(LS_FILES:src/%.ls=%.js)

ifneq ("$(wildcard static/jquery-ui.min.js)","")
	ETHERCALC_FILES += static/jquery-ui.min.js
endif

UGLIFYJS_ARGS = -c -m
ifdef DEBUG
  UGLIFYJS_ARGS += -b
endif

run: all
	node app.js --cors $(ETHERCALC_ARGS)

vm: all
	node app.js --vm $(ETHERCALC_ARGS)

expire: all
	node app.js --expire 10 $(ETHERCALC_ARGS)

all: depends $(JS_FILES)

$(JS_FILES): %.js: src/%.ls
	env PATH="$$PATH:./node_modules/livescript/bin" lsc -c -o . $<

manifest ::
	perl -pi -e 's/# [A-Z].*\n/# @{[`date`]}/m' manifest.appcache

./node_modules/streamline/bin/_node \
./node_modules/terser/bin/terser :
	npm i --dev

static/multi.js :: multi/main.ls multi/styles.styl
	webpack --optimize-minimize

depends: app.js static/ethercalc.js static/start.css static/multi.js

./node_modules/socialcalc/dist/SocialCalc.js : FORCE
	mkdir -p ./node_modules/socialcalc/
	rm -r ./node_modules/socialcalc/dist/
	cp -r ../socialcalc/dist/ ./node_modules/socialcalc/

./addons/addons.js : FORCE
	@echo "Addon files"
	@echo $(ADDON_FILES)
	@echo "Node addon files"
	@echo $(ADDON_NODE_FILES)
	node_modules/.bin/browserify -p esmify $(ADDON_FILES) > addons/addons.js
	node_modules/.bin/browserify --node -p esmify $(ADDON_NODE_FILES) > addons/addons-node.js

static/ethercalc.js: $(ETHERCALC_FILES) \
	 ./node_modules/socialcalc/dist/SocialCalc.js \
	 ./node_modules/terser/bin/terser \
	 ./addons/addons.js \
	 FORCE
	@-mkdir -p .git
	@echo '// Auto-generated from "make depends"; ALL CHANGES HERE WILL BE LOST!' > $@
	node node_modules/terser/bin/terser node_modules/socialcalc/dist/SocialCalc.js addons/addons.js $(ETHERCALC_FILES) $(UGLIFYJS_ARGS) >> $@

.PHONY: FORCE
FORCE:

COFFEE := $(shell command -v coffee 2> /dev/null)
.coffee.js:
ifndef COFFEE
	$(error "coffee is not available please install sass")
endif
	coffee -c $<

SASS := $(shell command -v sass 2> /dev/null)
.sass.css:
ifndef SASS
	$(error "sass is not available please install sass")
endif
	sass -t compressed $< > $@

clean ::
	@-rm $(JS_FILES)

.SUFFIXES: .js .css .sass .ls
.PHONY: run vm expire all clean depends
