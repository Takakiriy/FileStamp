Character Encoding: "WHITE SQUARE" U+25A1 is □.

[ [英語](README.md) | 日本語 ]

## インストール方法 (Windows)

1. Git bash をインストールします。
    - https://git-scm.com/downloads
	- ダウンロードするインストーラーのファイル名の例： `Git-2.27.0-64-bit.exe`
	- bash のインストールは必須です。 それ以外の設定は任意です
2. Node.js のパッケージを ダウンロード フォルダー `${USERPROFILE}\Downloads` の直下に配置します。
	- https://nodejs.org/ja/download/
	- ダウンロードするインストーラーのファイル名の例： `node-v12.18.3-x64.msi`
	- Node.js のバージョンは、後で実行する シェル スクリプト の中の `g_Node_js_Version` 変数の値です
3. `cypress.env.js` ファイルを作成します。`cypress.example.env.js` を参考。
	- `LogInToken` はログインのトークンがある場所。 値は、`"InCookie"` または `"InLocalStorage"`
		- aws Amplify 環境なら、Amplify.configure に渡す引数の Auth/cookieStorage の有無に合わせます
	- `LogInAccount` と `LogInPassword` にはサインアップしたアカウントを設定してください
4. bash を開いて、シェル スクリプト を実行します。
	- 拡張子が .sh のファイルが シェル スクリプト です
	- フォルダーを右クリックして **Git Bash Here** を選ぶと bash が起動します
	- `./scripts.sh  setup` (Enter) と入力すると cypress をインストールして開く シェル スクリプト を実行します
	- `./scripts.sh  clean` (Enter) と入力すると、クリーンする シェル スクリプト を実行します
	- `run_*.bat` ファイルをダブルクリックして実行することもできます
5. FileStamp を認証しないモードにします。
	- https://portal.azure.com/ >> App Service >> （フロント エンドのアプリ名） >> 認証/承認
		>> 要求が認証されていない場合に実行するアクション >> 匿名要求を許可する
	- バックエンドも同じ設定にします
6. `cypress/integration` に テスト スクリプトがあります。
	- `1_typical_test.js`: 典型的なケースのテスト
	- `cypress_fiddle_*.js`: デバッグ用、テストでは使わない
7. FileStamp を認証するモードに戻します。
	- https://portal.azure.com/ >> App Service >> （フロント エンドのアプリ名） >> 認証/承認
		>> 要求が認証されていない場合に実行するアクション >> Azure Active Directory でのログイン
	- バックエンドも同じ設定にします
