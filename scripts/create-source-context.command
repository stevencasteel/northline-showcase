#!/usr/bin/env zsh

set -e

SCRIPT_DIR="${0:A:h}"
cd "${SCRIPT_DIR}/.."

printf '\e]0;Northline Roofing Source Context\a'
exec node scripts/create-source-context.js
