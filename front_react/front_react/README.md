# File Stamp フロントエンド

## run_setup.bat

run_setup.bat をダブルクリックすると node_modules（必要なファイル）をダウンロードして、
React による Webサーバーをローカルで起動します。 内部で npm ci と npm run start を実行します。


## run_start.bat

run_start.bat をダブルクリックすると React による Webサーバーをローカルで起動します。
node_modules がすでにダウンロードしてあるときに使います。
内部で npm run start を実行します。


## run_build.bat

run_build.bat をダブルクリックすると、デプロイする build フォルダーができます。
内部で npm run build を実行します。
build フォルダーをクラウドにデプロイする手順は、[steps.yaml](steps.yaml) の
「Web App for Containers での継続的デプロイ」を参照してください。


## run_clean.bat

リポジトリに入れないファイル（例：node_modules）を削除します。

