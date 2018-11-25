#!/bin/bash

git pull
GIT_PULL_EXIT=$?
if [[ $GIT_PULL_EXIT != 0 ]]; then
    echo "failed git pull: ${GIT_PULL_EXIT}"
    exit 1
fi

LATEST_HASH=`git log -n 1 --pretty=format:"%H"`

if [[ -d "build" && -f "last-build-hash" ]]; then
#    echo "---- latest hash = ${last-build-hash}"
    echo $LATEST_HASH | diff -q -w "last-build-hash" -
    DIFF=$?
    if [[ $DIFF == 0 ]]; then
	SHOULD_BUILD=false
    else
	SHOULD_BUILD=true
    fi
#    echo "---- DIFF = $DIFF"
else
    SHOULD_BUILD=true
fi

#echo  "---- SHOULD_BUILD = $SHOULD_BUILD"

if [ $SHOULD_BUILD == true ]; then
    CI=true yarn test
    PASS=$?

    if [[ $PASS == 0 ]]; then
	yarn build
	BUILD_EXIT=$?
	if [[ $BUILD_EXIT == 0 ]]; then
	    echo $LATEST_HASH > "last-build-hash"
	fi
    fi
else
    echo "No changes -- current git hash is $LATEST_HASH."
    echo 'Delete "last-build-hash" or "build" to force a rebuild.'
fi
