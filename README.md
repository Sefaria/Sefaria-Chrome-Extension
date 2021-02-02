to bundle the extension for submission to Chrome/Firefox store run in terminal:

- `cd /to/root/of/extension`
- install npm if you don't have it
- `npm install` (first time only)
- `npm run build`
- `./create_release_zip.sh`

This will output `extension.zip`, `extension_unobfuscated.zip` and `extension.dev.zip` to the `extension_outpus` folder. Upload `extension.zip` to the Chrome and Firefox stores. Firefox additionally requires that we upload `extension_unobfuscated.zip` so that they can review our unobfuscated code. `extension.dev.zip` includes a development build that can be used for local development.
