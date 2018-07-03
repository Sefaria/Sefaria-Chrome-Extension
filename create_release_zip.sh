#!/bin/bash
zip -r -FS ../extension.zip * -x '*node_modules*' 'js/*' '*\.DS_Store*'
