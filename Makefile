WASM_SRC_DIR := src/wasm
WASM_PUBLIC_DIR := public/wasm
MODULES := $(notdir $(wildcard $(WASM_SRC_DIR)/*))

.PHONY: all clean

all: $(MODULES)

define read_config
$(shell if [ -f $(WASM_SRC_DIR)/$(1)/module_config ]; then \
    grep -v '^#' $(WASM_SRC_DIR)/$(1)/module_config | \
    sed -e 's/^/-/' -e 's/=\[/="\[/' -e 's/]$$/]"/' | \
    tr '\n' ' '; \
fi)
endef

$(MODULES):
	@mkdir -p $(WASM_PUBLIC_DIR)/$@
	$(eval CONFIG := $(call read_config,$@))
	emcc $(WASM_SRC_DIR)/$@/$@.cpp -o $(WASM_PUBLIC_DIR)/$@/$@.js \
		-sALLOW_MEMORY_GROWTH=1 \
		-sEXPORT_NAME='$@Module' \
		-sMODULARIZE \
		-sENVIRONMENT=web \
		-O3 \
		--closure 1 \
		-flto \
		-sEVAL_CTORS \
		$(CONFIG)

clean:
	rm -rf $(WASM_PUBLIC_DIR)

# Rule to only rebuild if the source file or config is newer than the output
$(WASM_PUBLIC_DIR)/%/%.js: $(WASM_SRC_DIR)/%/%.cpp $(wildcard $(WASM_SRC_DIR)/%/module_config)
	@mkdir -p $(dir $@)
	$(eval CONFIG := $(call read_config,$*))
	emcc $< -o $@ \
		-sALLOW_MEMORY_GROWTH=1 \
		-sEXPORT_NAME='$*Module' \
		-sMODULARIZE \
		-sENVIRONMENT=web \
		-O3 \
		--closure 1 \
		-flto \
		-sEVAL_CTORS \
		$(CONFIG)