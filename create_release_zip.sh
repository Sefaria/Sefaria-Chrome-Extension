#!/bin/bash
zip -r -FS ../extension.zip * -x '*node_modules*' 'js/*' '*\.DS_Store*'
zip -r -FS ../extension_unobfuscated.zip * -x '*node_modules*'
