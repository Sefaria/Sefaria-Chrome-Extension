#!/bin/bash
zip -r -FS ../extension.zip * -x '*node_modules*' 'js/*' '*\.DS_Store*' 'create_release_zip.sh'
zip -r -FS ../extension_unobfuscated.zip * -x '*node_modules*' '*\.DS_Store*' 'create_release_zip.sh'
