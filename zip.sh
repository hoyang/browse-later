#!/bin/bash

rm ./browse-later.zip
zip -x "*.DS_Store" -r browse-later.zip _locales icons LICENSE README.md background.js common.js manifest.json styles photon pages tabs.js options.js content_helper.js
