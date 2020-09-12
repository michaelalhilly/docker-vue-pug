#!/bin/bash

# Vodka Tonic for Node.js
# This script simplifies commonly used Docker commands for development with Node.js.
# 
# @see https://bitbucket.org/michaelalhilly/vodka-tonic
# @usage vt <vt command | npm script>

# Exits if no arguments are passed.

if [ "$1" = "" ]; then

	echo "Specify a command.";
fi

if [ "$1" = "help" ]; then

	echo "";
	echo "Usage: vt <command>";
	echo "";
	echo "Commands:";
	echo "";
	echo "<npm script>: Runs the requested npm script."
	echo "build: Builds app image.";
	echo "cli: Starts app container command line.";
	echo "exec: Executes command on app container.";
	echo "install: Installs Node.js modules.";
	echo "rebuild: Removes and rebuilds app image.";
	echo "restart: Restarts app container.";
	echo "rm: Removes app continer.";
	echo "rmi: Removes app image.";
	echo "run: Runs app container.";
	echo "script: Runs custom script defined in package.json.";
	echo "start: Runs app container and runs npm start script.";
	echo "stop: Stops app container.";
	echo "update: Updates package Node.js modules.";
	exit 0
fi

# Exits if package.json does not exist.

if [ $(find . -maxdepth 1 -name 'package.json') = "" ]; then

	echo "package.json is missing."
	exit 10
fi

# Grabs project name and container's options from package.js.

NAME=$(grep -Eo '"name": ".*",' package.json | awk '{print $2}' | sed 's/"//g' | sed 's/,//g');
OPTIONS=$(grep -Eo '"vt": ".*"' package.json | awk '{for (i=2; i<NF; i++) printf $i " "; print $NF}' | sed 's/"//g' | sed 's/,//g');

# Exits if name is blank.

if [ $NAME = "" ]; then

	echo "App name is missing from package.json."
	exit 10
fi

# Uses specified container name if one is passed.

if [ "$#" -gt 1 ]; then

	NAME="$2"
fi

# Starts container and optionally runs a command.

run_container() {

	if [ "$1" = "" ]; then

		eval docker run -d $OPTIONS --name $NAME $NAME /usr/bin/supervisord

	else

		eval docker run -d $OPTIONS --name $NAME $NAME $@
	fi

	exit 0
}

# Shortcuts

if [ "$1" = "build" ]; then

	docker build -t $NAME .
	exit 0
fi

if [ "$1" = "install" ]; then

	docker exec $NAME npm install
	exit 0
fi

if [ "$1" = "update" ]; then

	docker exec $NAME npm update
	exit 0
fi

if [ "$1" = "run" ]; then

	run_container
fi

if [ "$1" = "start" ]; then

	run_container npm start
	exit 0
fi

if [ "$1" = "stop" ]; then

	docker stop $NAME
	exit 0
fi

if [ "$1" = "exec" ]; then

	docker exec $NAME "${@:2}"
	exit 0
fi

if [ "$1" = "cli" ]; then

	docker exec -it $NAME /bin/bash
	exit 0
fi

if [ "$1" = "rm" ]; then

	if [ "$2" = "all" ]; then

		docker stop $(docker ps -aq)
		docker rm $(docker ps -aq)
		exit 0

	fi

	docker stop $NAME
	docker rm $NAME
	exit 0
fi

if [ "$1" = "rmi" ]; then

	if [ "$2" = "none" ]; then

		docker rmi $(docker images -f "dangling=true" -q)
		exit 0
	fi

	docker rmi $NAME
	exit 0
fi

if [ "$1" = "restart" ]; then

	docker stop $NAME
	docker restart $NAME
	exit 0
fi

if [ "$1" = "rebuild" ]; then

	docker rmi $NAME
	docker build -t $NAME .
	exit 0
fi

# Executes NPM script since first argument did not match
# a VT command..

npm run $1
exit 0