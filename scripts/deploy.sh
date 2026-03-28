#!/bin/bash
set -e

SERVER="debian@perkycrow.com"
REMOTE_DIR="/data/games"

usage() {
  echo "Usage:"
  echo "  ./scripts/deploy.sh <game> <version>              Deploy and set as current"
  echo "  ./scripts/deploy.sh <game> <version> --no-current  Deploy without changing current"
  echo "  ./scripts/deploy.sh playtest <game> <version> <code>  Create a playtest link"
  echo "  ./scripts/deploy.sh playtest rm <code>                Remove a playtest link"
  echo ""
  echo "Examples:"
  echo "  ./scripts/deploy.sh den v0.1.0           Build, deploy, set as current"
  echo "  ./scripts/deploy.sh den v0.2.0-beta --no-current"
  echo "  ./scripts/deploy.sh playtest den v0.2.0-beta h3ll0"
  echo "  ./scripts/deploy.sh playtest rm h3ll0"
  exit 1
}

deploy() {
  local game=$1
  local version=$2
  local set_current=${3:-true}

  echo "Building ${game}..."
  yarn ${game}:build

  echo "Deploying ${game} ${version}..."
  ssh ${SERVER} "mkdir -p ${REMOTE_DIR}/${game}/builds/${version}"
  rsync -az --delete dist/${game}/ ${SERVER}:${REMOTE_DIR}/${game}/builds/${version}/

  if [ "${set_current}" = true ]; then
    ssh ${SERVER} "ln -sfn ${REMOTE_DIR}/${game}/builds/${version} ${REMOTE_DIR}/${game}/current"
    echo "✓ ${game} ${version} → games.perkycrow.com/${game}/"
  else
    echo "✓ ${game} ${version} deployed (not set as current)"
  fi

  echo "  Direct: games.perkycrow.com/${game}/${version}/"
}

playtest() {
  if [ "$1" = "rm" ]; then
    local code=$2
    ssh ${SERVER} "rm -f ${REMOTE_DIR}/playtest/${code}"
    echo "✓ Playtest ${code} removed"
    return
  fi

  local game=$1
  local version=$2
  local code=$3

  ssh ${SERVER} "mkdir -p ${REMOTE_DIR}/playtest && ln -sfn ${REMOTE_DIR}/${game}/builds/${version} ${REMOTE_DIR}/playtest/${code}"
  echo "✓ Playtest: games.perkycrow.com/playtest/${code}/"
}

case $1 in
  playtest)
    shift
    [ $# -lt 2 ] && usage
    playtest "$@"
    ;;
  -h|--help|"")
    usage
    ;;
  *)
    game=$1
    version=${2:-$(date +%Y%m%d-%H%M%S)}
    no_current=false
    [ "$3" = "--no-current" ] && no_current=true
    if [ "${no_current}" = true ]; then
      deploy "${game}" "${version}" false
    else
      deploy "${game}" "${version}" true
    fi
    ;;
esac
