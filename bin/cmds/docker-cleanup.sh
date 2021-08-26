#!/bin/bash

if [ -z "$1" ]; then
  echo "The image URI should be passed as first argument"
  exit 1
else
  IMAGE=$1
fi

if [ -z "$2" ]; then
  echo "Origin server need to be passed as second argument"
  exit 2
else
  HSOURCE="$2"
fi
if [ -z "$3" ]; then
  echo "Target server need to be passed as third argument"
  exit 3
else
  HTARGET="$3"
fi

TAG="$(echo "$IMAGE" | sed "s~${HSOURCE}~${HTARGET}~")"

#echo "Source: $HSOURCE"
#echo "Target: $HTARGET"
#echo "Image: $IMAGE"
#echo "Tag: $TAG"

docker rmi "$IMAGE"
docker rmi "$TAG"
