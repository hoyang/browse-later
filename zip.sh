#!/bin/bash

rm ./browse-later.zip
zip -x "*.DS_Store" -r browse-later.zip _locales icons LICENSE README.md background.js common.js manifest.json popup.js styles photon pages tabs.js options.js tabs_list.html content_helper.js
