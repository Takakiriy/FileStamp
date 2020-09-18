pushd  "back_azure\back_azure"
call  "run_clean.bat"
popd

pushd  "back_azure\test_xUnit"
call  "run_clean.bat"
popd

pushd  "front_react\front_react"
call  "run_clean.bat"
popd

pushd  "front_react\test_cypress"
call  "run_clean.bat"
popd
