#!/bin/bash
OUTPUTDIR=build
VERSIONDIR=src/versions
IPFSLOCAL="http://localhost:8080/ipfs/"
IPFSGATEWAY="https://ipfs.io/ipfs/"
ipfs add -r -q $OUTPUTDIR | tail -n1 > $VERSIONDIR/current
cat $VERSIONDIR/current >> $VERSIONDIR/history
HASH=`cat $VERSIONDIR/current`
echo "{\"current\": \"$HASH\"}" > $VERSIONDIR/current.json
echo "⭐ Site publicado IPFS ⭐"
echo ""
echo "✔️  $IPFSLOCAL$HASH"; \
echo "✔️  $IPFSGATEWAY$HASH"; \
echo ""
