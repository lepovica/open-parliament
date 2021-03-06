#!/bin/bash
BASEDIR=$(cd "$(dirname "$0")"; pwd)

npmToInstall=(
	$BASEDIR/apps/mp-votes
	$BASEDIR/apps/laws
	$BASEDIR/apps/government-procurement
	$BASEDIR/apps/brra.bg-inquirer
	$BASEDIR/common/node/csv-util
	$BASEDIR/common/node/downloader
	$BASEDIR/common/node/logger
	$BASEDIR/common/node/decaptcha
	$BASEDIR/common/node/spreadsheet2csv-node
	$BASEDIR/common/phantom/decaptcha-auto-node
	$BASEDIR/common/phantom/decaptcha-manual
)

composerToInstall=(
	$BASEDIR/apps/spreadsheet2csv
)

for path in "${npmToInstall[@]}"
do
	cd $path
	echo $path
	npm install
done

for path in "${composerToInstall[@]}"
do
	cd $path
	echo $path
	composer install
done