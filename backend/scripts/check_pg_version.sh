#!/usr/bin/env bash
set -e
PGDATA=/var/lib/postgresql/data
EXPECTED=16
if [ -f "$PGDATA/PG_VERSION" ]; then
  ACTUAL=$(cat $PGDATA/PG_VERSION)
  if [ "$ACTUAL" != "$EXPECTED" ]; then
    echo "Incompatible PG_VERSION $ACTUAL – wiping volume"
    rm -rf $PGDATA/*
  fi
fi
exec "$@"

