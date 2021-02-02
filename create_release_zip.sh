#!/bin/bash
mkdir extension_outputs -p

rm -rf ./bundle
cp -R bundle_prod bundle
zip -r -FS ./extension_outputs/extension.zip * -x '*node_modules*' 'js/*' '*\.DS_Store*' 'create_release_zip.sh' 'bundle_dev/*' 'bundle_prod/*' 'extension_outputs/*'
zip -r -FS ./extension_outputs/extension_unobfuscated.zip * -x '*node_modules*' '*\.DS_Store*' 'create_release_zip.sh' 'bundle_dev/*' 'bundle_prod/*' 'extension_outputs/*'

rm -rf ./bundle
cp -R bundle_dev bundle
zip -r -FS ./extension_outputs/extension.dev.zip * -x '*node_modules*' 'js/*' '*\.DS_Store*' 'create_release_zip.sh' 'bundle_dev/*' 'bundle_prod/*' 'extension_outputs/*'

rm -rf ./bundle