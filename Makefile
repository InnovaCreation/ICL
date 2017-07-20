# The Makefile (script) for Innova Creation Launcher

NW_PATH = "../nwjs-sdk-v0.23.6-linux-x64"

SRC = "./src"
TARGET = "./ICL.zip"

.PHONY:clean

prepare:
	@echo Preparing Node NPM environment
	cd ./src; npm install unzip

pack: clean
	@echo "Not really supported yet"

clean:
	@echo "Cleaning pervious package"
	rm -f $(TARGET)

run:
	$(NW_PATH)/nw $(SRC)
