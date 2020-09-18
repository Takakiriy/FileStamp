#!/bin/bash
#// Character Encoding: "WHITE SQUARE" U+25A1 is □.
set -eE
#// -eE option breaks execution, when an error was occurred.

#********************************************************************
#* File: install_VisualStudioCode.sh
#    Type "./install_VisualStudioCode.sh" in Windows git bash.
#********************************************************************
export  True=0
export  False=1


#// Setting
#//==================================================================

export  g_DependenciesTitle="bashlib_cypress"
export  g_Dependencies=( "Node.js" )

export  g_Node_js_Version="12.18.3"

export  g_ProgramFiles_of_Node_js="/c/Program Files/nodejs"
#//==================================================================


#********************************************************************
# Function: Main_func
#********************************************************************
function  Main_func()
{
	if [ "$1" == ""  -o  "$1" == "setup"  -o  "$1" == "open" ]; then
		SetUp_func
	elif [ "$1" == "clean"  -o  "$1" == "cleanup" ]; then
		CleanUp_func
	elif [ "$1" == "uninstall" ]; then
		Uninstall_func
	else
		echo  "Unknown command name."
	fi
	return  0
}


#********************************************************************
# Function: SetUp_func
#********************************************************************
function  SetUp_func()
{
	SetUpVariables_func

	#// Skip
if false; then #// "Skipped"
echo "Skipped"  ;fi


	#// Install Node.js

	Install_Node_js_func
	EchoNextCommand_func

	"${g_ProgramFiles_of_Node_js}/node" --version
	EchoNextCommand_func

	"${g_ProgramFiles_of_Node_js}/npm" --version

	AddDependencies_func  "${g_DependenciesTitle}"  "${g_Dependencies[@]}"


	#// Install cypress
	if [ ! -e "node_modules/.bin/cypress.cmd" ]; then
		EchoNextCommand_func

		"${g_ProgramFiles_of_Node_js}/npm" ci
		EchoNextCommand_func

		./node_modules/.bin/cypress.cmd  install  #// 5分
	fi


	#// ...
	echo  ""
	ColorEcho_func  "Start cypress ...\n"  "Green"
	EchoNextCommand_func

	npx cypress open
}


#********************************************************************
# Function: CleanUp_func
#********************************************************************
function  CleanUp_func()
{
	EchoNextCommand_func

	rm -rf  "node_modules"
	EchoNextCommand_func

	rm -f   "_logInCookie.json"
	EchoNextCommand_func

	rm -f   "_logInLocalStorage.json"
}


#********************************************************************
# Function: Uninstall_func
#********************************************************************
function  Uninstall_func()
{
	SetUpVariables_func
	GetSharedDependencies_func  "${g_DependenciesTitle}"  "${g_Dependencies[@]}"  #// g_SharedDependencies = .


	#// Clean this project
	local  paths=(
		"node_modules" )
	for  path  in  "${paths[@]}" ;do
		echo  "${path}"
	done  #// ; done_func $?
	Pause_func
	for  path  in  "${paths[@]}" ;do
		EchoNextCommand_func

		rm -rf  "${path}"
	done  #// ; done_func $?


	#// ...
	if IsWindows_func; then
		echo  ""
		ColorEcho_func  "Uninstall up Node.js and node_modules folder ...\n"  "Green"
		if [ -v g_SharedDependencies["Node.js"] ]; then
			echo  "Skipped"
		fi
		Pause_func
		if [ ! -v g_SharedDependencies["Node.js"] ]; then

			Uninstall_Node_js_func
		fi
	fi

	RemoveDependencies_func  "${g_DependenciesTitle}"
}


#********************************************************************
# Function: Install_Node_js_func
#    Install Node.js
#
# Description:
#    This was synchronized with "Snippets\for-bash\installer\Node_js\install_Node_js.sh" in 2020-07-24 commit next to ddcd4da.
#********************************************************************
function  Install_Node_js_func()
{
	if [ ! -e "${NODE_HOME}/npm" ]; then

		#// Guard
		if [ ! -e "${g_Node_js_Installer}" ]; then
			echo  ""
			echo  "Download Node.js installer and copy it to this folder."
			echo  "https://nodejs.org/ja/download/releases/ or https://nodejs.org/en/download/"
			echo  "Node.js ${g_Node_js_Version} \"${g_Node_js_Installer}\""
			echo  ""
			Error_func  "Not found Node.js ${g_Node_js_Version} installer at ./${g_Node_js_Installer}"
		fi


		#// Install Node.js
		echo  ""
		ColorEcho_func  "Install Node.js ...\n"  "Green"
		if IsWindows_func; then

			Clear_Node_js_func
			EchoNextCommand_func

			echo  "prefix=${g_NodePrefixForWindows}" > "${HOME}/.npmrc"  #// npm set prefix
			EchoNextCommand_func

			msiexec.exe -i "${g_Node_js_Installer}" -qr
			EchoNextCommand_func

			npm config set script-shell  "C:\\Program Files\\Git\\usr\\bin\\bash.exe"
		else
			EchoNextCommand_func

			tar Jxfv  "${g_Node_js_Installer}" > /dev/null
		fi
	fi
}


#********************************************************************
# Function: Uninstall_Node_js_func
#********************************************************************
function  Uninstall_Node_js_func()
{
	if [ -e "${NODE_HOME}/npm" ]; then
		EchoNextCommand_func

		msiexec.exe -x  "${g_Node_js_Installer}" -qr
	fi

	Clear_Node_js_func
}


#********************************************************************
# Function: Clear_Node_js_func
#********************************************************************
function  Clear_Node_js_func()
{
	EchoNextCommand_func

	rm -rf  "${HOME}\AppData\Roaming\npm-cache"  #// npm cache clean --force
	EchoNextCommand_func

	rm -rf  "${HOME}\AppData\Roaming\npm"
	EchoNextCommand_func

	rm -f  "${HOME}\.npmrc"  #// npm set prefix
}


#********************************************************************
# Function: SetUpVariables_func
#********************************************************************
function  SetUpVariables_func()
{
	export  g_ParentPathOfThisScript="$( pwd )"

	#// Set Node.js variables
	if IsWindows_func; then
		export  g_Node_js_Installer="${USERPROFILE}\Downloads\node-v${g_Node_js_Version}-x64.msi"
	else
		export  g_Node_js_Installer="${HOME}\Downloads\node-v${g_Node_js_Version}-linux-x64.tar.xz"
		export g_Node_js_FolderName="${HOME}\Downloads\node-v${g_Node_js_Version}-linux-x64"
	fi
	if IsWindows_func; then
		export  HOME=$( cygpath --unix "${USERPROFILE}" )
		export  NODE_HOME="/c/Program Files/nodejs"
		export  NODE_PATH="${NODE_HOME}/node_modules/npm/node_modules"
		export  g_NodePrefix="${HOME}/AppData/Roaming/npm"
		export  g_NodePrefixForWindows="${USERPROFILE}\AppData\Roaming\npm"
	else
		export  NODE_HOME="${g_ParentPathOfThisScript}/${g_Node_js_FolderName}"
		export  NODE_PATH="${NODE_HOME}/lib/node_modules"
		export  g_NodePrefix="${NODE_HOME}/lib"
	fi

	#// Set PATH variable
	if IsWindows_func; then
		export  PATH="$PATH:${g_NodePrefix}:/c/Program Files/nodejs:${NODE_HOME}/node_modules/npm/bin"
	else
		export  PATH="$PATH:${NODE_HOME}/bin:${NODE_PATH}/.bin"
	fi

	#// Show variables
	ShowVariables_func
	echo  "g_NodePrefix = ${g_NodePrefix}"
}


#********************************************************************
# Function: ShowVariables_func
#********************************************************************
function  ShowVariables_func()
{
	echo  ""
	echo  "Copy and execute these commands to set variables."
	echo  "-------------------------------------------------"
	echo  "    export NODE_HOME=\"${NODE_HOME}\""
	echo  "    export NODE_PATH=\"${NODE_PATH}\""
	echo  "    export PATH=\"${PATH}\""
	echo  "-------------------------------------------------"
}


#********************************************************************
# Function: SetVariables_func
#********************************************************************
function  SetVariables_func()
{
	SetUpVariables_func
	ShowVariables_func
	pushd  "${g_StartInPath}" > /dev/null

	export s_file_path=".s"
	cat  > "${s_file_path}"  <<- __HERE_DOCUMENT__
		export NODE_HOME="${NODE_HOME}"
		export NODE_PATH="${NODE_PATH}"
		export PATH="${PATH}"
		rm "${s_file_path}"
		__HERE_DOCUMENT__
	echo "To set environment variables, type: source ${s_file_path}"
	popd > /dev/null
}


#********************************************************************
# Section: bashlib
#********************************************************************

#********************************************************************
# Function: Error_func
#    Occurrs an error
#
# Arguments:
#    Error messages
#
# Return Value:
#    None
#********************************************************************
function  Error_func()
{
	ErrClass.getErrStr_method  "$@" ; g_Err_Desc="$g_ReturnValue"
	return_func  1
}


#*********************************************************************
# Function: return_func
#*********************************************************************
function  return_func()
{
	if [ "$g_Err_LineNo" == "???" ];then  g_Err_LineNo=${BASH_LINENO[0]}  ;fi
	return  "$1"
}


#*********************************************************************
# Function: IsWindows_func
#
# Example:
#    if IsWindows_func; then
#        echo  "in Windows"
#    else
#        echo  "in Linux or others"
#    fi
#    if ! IsWindows_func; then  #// If not Windows
#*********************************************************************
function  IsWindows_func()
{
	if [ -e "/c/Windows/" ]; then
		return  ${True}
	else
		return  ${False}
	fi
}


#********************************************************************
# Function: EchoNextCommand_func
#    Enables to show the next executing command
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  EchoNextCommand_func()
{
	g_DebugTrapFunc="EchoNextTrap_func"
	echo  ""

	trap 'DebugTrap_func  "$LINENO"  "$BASH_COMMAND"  "${PIPESTATUS[@]}"
		#// resume ${PIPESTATUS[@]}
		case "${#g_PipeStatus[@]}" in
			"2")
				return ${g_PipeStatus[0]} | true;;
			"3")
				return ${g_PipeStatus[0]} | return ${g_PipeStatus[1]} | true;;
		esac' DEBUG
}

function  EchoNextTrap_func()
{
	local  line_num="$1"
	local  command="$2"
	shift  2
	g_PipeStatus=( "$@" )

	echo "${line_num}: \$ ${command}" >&2
	case ${command} in *\$*)
		echo  "$(eval echo ${line_num}: \$ ${command})" >&2;;
	esac

	g_DebugTrapFunc=""
}


#********************************************************************
# Function: EchoOn_func
#    Enables to show the executing commands
#
# Arguments:
#    None
#
# Return Value:
#    None
#
# Description:
#    Commands in calling functions are not shown.
#********************************************************************
function  EchoOn_func()
{
	g_DebugTrapFunc="EchoOnTrap_func"

	trap 'DebugTrap_func  "$LINENO"  "$BASH_COMMAND"  "${PIPESTATUS[@]}"
		#// resume ${PIPESTATUS[@]}
		case "${#g_PipeStatus[@]}" in
			"2")
				return ${g_PipeStatus[0]} | true;;
			"3")
				return ${g_PipeStatus[0]} | return ${g_PipeStatus[1]} | true;;
		esac' DEBUG
}

function  EchoOnTrap_func()
{
	local  LineNo="$1"
	local  Command="$2"
	shift  2
	g_PipeStatus=( "$@" )

	echo "$LineNo: $Command" >&2
}


 
#********************************************************************
# Function: EchoOff_func
#    Disables to show the executing commands
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  EchoOff_func()
{
	g_DebugTrapFunc=""
}


 
#********************************************************************
# Function: ColorEcho_func
#    Echos colored text
#
# Arguments:
#    in_Text      - .
#    in_ColorName - .
#
# Return Value:
#    None
#
# Example:
#    > ColorEcho_func  "Pass."  "Green"
#********************************************************************
function  ColorEcho_func()
{
	local  in_Text="$1"
	local  in_ColorName="$2"

	ColorText_func  "${in_Text}"  "${in_ColorName}"
	echo -e -n  "$g_ReturnValue"
}


#********************************************************************
# Function: echo_line_func
#    Echos a line
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  echo_line_func()
{
	echo "-------------------------------------------------------------------------------"
}


#********************************************************************
# Function: Pause_func
#    Waits until user confirmation
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  Pause_func()
{
	local  key

	if [ "${LANG}" == "ja_JP.UTF-8" ]; then
		read -p "続行するには Enter キーを押してください . . . "  key
	else
		read -p "Press Enter key to continue ..."  key
	fi
}


#********************************************************************
# Function: ColorText_func
#    Adds the color to the specified text
#
# Arguments:
#    in_Text      - A text
#    in_ColorName - Color name or background color name or bold (1)
#    in_ColorName - Color name or background color name or bold (2)
#         :
#
# Return Value:
#    g_ReturnValue - The color attached text that will be used with echo command
#
# Example:
#    > ColorText_func  "Pass."  "Green"  "Bold"
#    > echo_e_func  "$g_ReturnValue"
#********************************************************************
function  ColorText_func()
{
	local  in_Text="$1"
	shift  1
	local  in_ColorNames=("$@")
	local  i
	local  n
	local  str

	#//=== initialize  g_ColorText_Codes
	if [ "${g_ColorText_Codes["Black"]}" == "" ];then

		#//=== set escape sequence
		g_ColorText_Codes["Black"]=30
		g_ColorText_Codes["Red"]=31
		g_ColorText_Codes["Green"]=32
		g_ColorText_Codes["Yellow"]=33
		g_ColorText_Codes["Blue"]=34
		g_ColorText_Codes["Magenta"]=35
		g_ColorText_Codes["Cyan"]=36
		g_ColorText_Codes["White"]=37

		g_ColorText_Codes["BlackBack"]=40
		g_ColorText_Codes["RedBack"]=41
		g_ColorText_Codes["GreenBack"]=42
		g_ColorText_Codes["YellowBack"]=43
		g_ColorText_Codes["BlueBack"]=44
		g_ColorText_Codes["MagentaBack"]=45
		g_ColorText_Codes["CyanBack"]=46
		g_ColorText_Codes["WhiteBack"]=47

		g_ColorText_Codes["Bold"]=1
	fi

	sequence="\e["
	n=$(( ${#in_ColorNames[@]} - 1 ))
	for (( i = 0;  i <= n;  i++ )) ;do
		local  color_code="${g_ColorText_Codes[${in_ColorNames[$i]}]}"
		if [ "$i" == "$n" ];then
			sequence="${sequence}${color_code}m"
		else
			sequence="${sequence}${color_code};"
		fi
	done ; done_func $?

	g_ReturnValue="${sequence}${in_Text}\e[m"
}

declare -A  g_ColorText_Codes


#********************************************************************
# Function: echo_e_func
#    Echos texts including escape. This is as same as "echo -e"
#
# Arguments:
#    in_Text - Echo texts
#
# Return Value:
#    None
#********************************************************************
function  echo_e_func()
{
	local  in_Text="$@"
	eval echo '$'"'$in_Text'"
}


#********************************************************************
# Function: ErrTrap_func
#    The function called from the error trap
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************

g_ExitStatus=0
g_ReturnValue=""
g_Ret2=""
g_Ret3=""
g_Err_IsDone=0
g_Err_IsOverwrite=0
g_Err_NestLevel=0
g_Err_ErrID=0
g_Err_Desc=""
g_Err_Desc1st=""
g_Err_LineNo="???"
g_PipeStatus=""
g_DebugTrapFunc=""

function  ErrTrap_func()
{
	local  a1

	if [ "$g_Err_IsDone" == "1" ];then
		g_Err_IsDone=0
	elif [ "$g_Err_IsOverwrite" == "1" ];then
		g_Err_IsOverwrite=0
	else

		g_Err_ErrID=$(( $g_Err_ErrID + 1 ))

		if [ "$g_ExitStatus" == "0" ];then
			if [ "$g_Err_LineNo" == "???" ];then  g_Err_LineNo=$1  ;fi
			if [ "$g_Err_LineNo" == "???" ]; then
				a1="${a1}（ヒント）現在の行番号は、${FUNCNAME[1]} 関数の最初で \"EchoOn_func\" を呼ぶと表示されます。${LF}"
			fi
			a1="${a1}（開発者向けヒント）ステップ実行したいときは、開始するところから \"debugger\" 関数を呼び出してください。 "
			a1="${a1}下記コールツリーの最も下の関数が、\` \` を使って echo 出力を取得しているときは、取得しないようにすると、更にコール先の関数が表示されます。${LF}"
			ErrClass.getCallTree_method  "$g_Err_LineNo"  2  1
			#// g_Err_ErrCallStack="$a1$g_ReturnValue$LF"
			g_Err_ErrCallStack="$g_ReturnValue$LF"
		else
			echo  "<ERROR msg=\"エラー処理中に別のエラーが発生しました。\"/>" >&2

			ErrClass.getErrStr_method  "$g_Err_Desc"
			if [ "$g_ReturnValue" == "" ];then  g_ReturnValue="<ERROR/>"  ;fi
			ColorText_func  "$g_ReturnValue"  "Red" "Bold"
			echo_e_func  "$g_ReturnValue"

			ErrClass.getCallTree_method  "${BASH_LINENO[0]}"  2  1
			echo  "$g_ReturnValue"  >&2
			g_Err_Desc="$g_Err_Desc1st"
		fi


		if [ "$g_Err_Desc" == "" ];then
			ColorText_func  "<ERROR/>"  "Red" "Bold"
		else
			ColorText_func  "$g_Err_Desc"  "Red" "Bold"
		fi
		echo_e_func  "$g_ReturnValue" >&2
		echo "Exit Status = $g_ExitStatus"  >&2
		echo_line_func
		echo -n "$g_Err_ErrCallStack"  >&2
		if [ "$g_Err_Desc" == "" ];then
			echo  "<ERROR/>"  >&2
		else
			echo  "$g_Err_Desc"  >&2
		fi
		if [ "$is_not_err_handled" == "1" ];then
			echo  "エラー処理がされていません。ErrClass.clear_method または ErrClass.raiseOverwrite_method を呼び出してください"
		fi
		trap ':' EXIT
		if [ "${g_IsSourceCommand}" == "${False}" ]; then

			exit  "$g_ExitStatus"
		else
			cd  "${g_StartInPath}"
			while true; do
				read -p "This script was terminated. Please press Ctrl+C"  dummy_variable
			done
			#// "set -eE; return 1" is same as exit command.
		fi
	fi
}


#********************************************************************
# Function: done_func
#    Raises a raising exception at the end of loop
#
# Arguments:
#    None
#
# Return Value:
#    None
#
# Example:
#    > while true; do
#    >     :
#    > done ; done_func $?
#********************************************************************
function  done_func()
{
	CheckArgCount_func  1 "$@"
	if [ "$1" != "0" ];then  g_Err_IsDone=1  ;fi
	return  "$1"  #// if not 0, throw again
}


 
#********************************************************************
# Function: CheckArgCount_func
#    Checks the count of arguments at the called function
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  CheckArgCount_func()
{
	local  RequestArgumentCount="$1"
	shift  1
	local  Arguments=( "$@" )
	local  str

	if [ "${#Arguments[@]}" -ne "$RequestArgumentCount" ];then
		str="パラメーターの数が合っていません。 指定=${#Arguments[@]}, 要求=$RequestArgumentCount,"
		str="$str コマンドライン: ${FUNCNAME[1]} ${Arguments[@]}"
		Error_func  "$str"
	fi
}


#*********************************************************************
# Function: AddDependencies_func
#
# Arguments:
#    in_Title        - The name of the owner module
#    in_Dependencies - An array of target module names without spaces
#
# Return Value:
#    None
#
# Example:
#    > AddDependencies_func  "${g_DependenciesTitle}"  "${g_Dependencies[@]}"
#*********************************************************************
function  AddDependencies_func()
{
	local  in_Title="$1"
	shift
	local  in_Dependencies=( $* )
	if [ ! -e "${HOME}/.dependencies" ]; then
		mkdir  "${HOME}/.dependencies"
	fi
	rm -f  "${HOME}/.dependencies/${in_Title}.txt"

	for  module  in  "${in_Dependencies[@]}" ;do
		echo  "${module}" >> "${HOME}/.dependencies/${in_Title}.txt"
	done
}


#*********************************************************************
# Function: GetSharedDependencies_func
#
# Arguments:
#    in_Title        - The name of the owner module
#    in_Dependencies - An array of target module names
#
# Return Value:
#    g_SharedDependencies - An associative array of target module names shared with others
#
# Example:
#    > GetSharedDependencies_func  "${g_DependenciesTitle}"  "${g_Dependencies[@]}"  #// g_SharedDependencies = .
#    > if [ -v g_SharedDependencies["Node.js"] ]; then
#*********************************************************************
function  GetSharedDependencies_func()
{
	local  in_Title="$1"
	shift
	local  in_Dependencies=( $* )
	local -A  dependencies
	for  module  in  "${in_Dependencies[@]}"; do
		dependencies[${module}]="dummy"
	done
	g_SharedDependencies=()

	#// Set the key of "g_SharedDependencies" associative array to the name of the module in the file
	#// "${HOME}/.dependencies" folder of the elements of "in_Dependencies" array.
	#jp:// in_Dependencies 配列の要素のうち、${HOME}/.dependencies フォルダーにあるファイルの中に書かれている
	#jp:// モジュール名を g_SharedDependencies 連想配列のキーに設定します。
	if [ -e "${HOME}/.dependencies" ]; then
		local  file_paths=( $(find  "${HOME}/.dependencies") )

		for  file_path  in  "${file_paths[@]}"; do
			local  is_other_file=${False}
			if [ -f "${file_path}" ]; then  #// Because file_paths has a folder path
				if [ "${file_path}" != "${HOME}/.dependencies/${in_Title}.txt" ]; then
					is_other_file=${True}
				fi
			fi
			if [ ${is_other_file} == ${True} ]; then
				local  line
				local  modules_in_other_files=()
				while read  line; do
					modules_in_other_files=("${modules_in_other_files[@]}" "${line}")
				done < <( cat "${file_path}" )

				for  module  in  "${modules_in_other_files[@]}" ;do
					local  dependencies_has_the_module=${False}
					if [ -v dependencies[${module}] ];then
						dependencies_has_the_module=${True}
					fi
					local  is_shared=${dependencies_has_the_module}

					if [ ${is_shared} == ${True} ]; then
						g_SharedDependencies[${module}]="dummy"
					fi
				done
			fi
		done
	fi
}
declare -A  g_SharedDependencies


#*********************************************************************
# Function: RemoveDependencies_func
#
# Arguments:
#    in_Title - The name of the owner module
#
# Return Value:
#    None
#
# Example:
#    > RemoveDependencies_func  "${g_DependenciesTitle}"
#*********************************************************************
function  RemoveDependencies_func()
{
	local  in_Title="$1"

	rm -f  "${HOME}/.dependencies/${in_Title}.txt"
}


#********************************************************************
# Function: Get_POSIX_Path_func
#    Changes Windows path to POSIX path
#
# Arguments:
#    in_InputPath - POSIX path or Windows path
#
# Return Value:
#    g_ReturnValue - POSIX path
#********************************************************************
function  Get_POSIX_Path_func()
{
	local  in_InputPath="$1"
	local  path_="${in_InputPath}"


	#// is_full_path = ...
	local  is_full_path="${False}"
	if [ "${path_:1:2}" == ":\\" ]; then
		is_full_path="${True}"
	fi


	#// path_ = ...
	if [ "${is_full_path}" == "${True}" ]; then
		local  drive_name="${path_:0:1}"
		local  lower_drive_name="${drive_name,,}"

		path_="/${lower_drive_name}/${path_:3}"
	fi
	path_="$( echo "$path_" | sed -e "s,\\\\,/,g" )"  #// Replace "\" to "/"

	g_ReturnValue=${path_}
}


#********************************************************************
# Function: GetWindowsPath_func
#    Changes POSIX path to Windows path
#
# Arguments:
#    in_InputPath - POSIX path or Windows path
#
# Return Value:
#    g_ReturnValue - Windows path
#********************************************************************
function  GetWindowsPath_func()
{
	local  in_InputPath="$1"
	local  path_="${in_InputPath}"


	#// is_full_path = ...
	local  is_full_path="${False}"
	if [ "${path_:0:1}" == "/" ]; then
		if [ "${path_:2:1}" == "/" ]; then
			is_full_path="${True}"
		fi
	fi


	#// path_ = ...
	if [ "${is_full_path}" == "${True}" ]; then
		path_="${path_:1:1}:${path_:2}"
	fi
	path_="$( echo "$path_" | sed -e "s,/,\\\\,g" )"  #// Replace "/" to "\"

	g_ReturnValue=${path_}
}


#*********************************************************************
# Function: GetFullPath_func
#
# Arguments:
#    in_RelativePath - in_RelativePath
#    in_BasePath - in_BasePath
#
# Return Value:
#    g_ReturnValue - Full path
#*********************************************************************
function  GetFullPath_func()
{
	local  in_RelativePath="$1"
	local  in_BasePath="$2"

	local  full_path
	local  str

	LeftOfStr_func "$in_RelativePath" "/" ; str="$g_ReturnValue"  #// if full path, str=""
	if [ "$str" == "" ]; then
		g_ReturnValue="$in_RelativePath"
	elif [ "$str" == "~" ]; then
		StringClass.substring_method  "$in_RelativePath"  1
		g_ReturnValue="$HOME$g_ReturnValue"
	else
		if [ "$in_BasePath" == "" ];then  in_BasePath="$PWD"  ;fi

		full_path="$in_BasePath/$in_RelativePath"

		while true; do   #//  "*/../" -> ""
			echo  "$full_path" | grep  "[^/]*/\.\./" > /dev/null  || break
			full_path=`echo "$full_path" | sed -e "s%[^/]*/\.\./%%"`
		done ; done_func $?

		while true; do   #//  "/*/.." -> ""
			echo  "$full_path" | grep  "[^/]*/[^/]*/\.\." > /dev/null  || break
			full_path=`echo "$full_path" | sed -e "s%/[^/]*/\.\.$%%"`
		done ; done_func $?

		while true; do  #//  "/./" -> "/"
			echo  "$full_path" | grep  "/\./" > /dev/null  || break
			StringClass.replace_method  "$full_path"  "/./"  "/" ; full_path="$g_ReturnValue"
		done ; done_func $?

		while true; do  #//  "/." -> ""
			StringClass.right_method  "$full_path"  2
			if [ "$g_ReturnValue" != "/." ];then  break  ;fi
			StringClass.replace_method  "$full_path"  "/./"  "/" ; full_path="$g_ReturnValue"
			full_path=`echo "$full_path" | sed -e "s%/\.$%%"`
		done ; done_func $?

		g_ReturnValue="$full_path"
	fi
}


#*********************************************************************
# Function: LeftOfStr_func
#    Returns the substring to the left of the specified keyword
#
# Arguments:
#    in_String - in_String
#    in_Key    - in_BasePath
#
# Return Value:
#    g_ReturnValue - Full path
#*********************************************************************
function  LeftOfStr_func()
{
	local  in_String="$1"
	local  in_Key="$2"

	StringClass.replace_method  "$in_Key"         '\'  '\\'
	StringClass.replace_method  "$g_ReturnValue"  '*'  '\*'

	g_ReturnValue="${in_String%%$g_ReturnValue*}"
}


#*********************************************************************
# Class: ErrClass
#*********************************************************************

#********************************************************************
# Method: ErrClass.raiseOverwrite_method
#    Overwrite the raising error object
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  ErrClass.raiseOverwrite_method()
{
	local  message ; ErrClass.getErrStr_method  "$@" ; message="$g_ReturnValue"
	local  exit_status="$g_ExitStatus"

	if [ "$message" != "" ];then
		g_Err_Desc="$message"
	fi

	if [ "$exit_status" == "0" ];then
		exit_status=1
	fi

	g_Err_IsOverwrite=1
	return  $exit_status
}


 
#********************************************************************
# Method: ErrClass.clear_method
#    Clears error status
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  ErrClass.clear_method()
{
	g_ExitStatus=0
	g_Err_Desc=""
	g_Err_Desc1st=""
	g_Err_LineNo="???"
	g_PipeStatus=""
}


 
#********************************************************************
# Method: ErrClass.getErrStr_method
#    Returns the error message
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  ErrClass.getErrStr_method()
{
	local  Message="$@"

	if [ "$Message" != "" ]; then
		if [ "${Message%%<ERROR *}" == "" ]; then
			g_ReturnValue="$Message"
		else
			StringClass.replace_method  "$Message"  "&"  "&amp;"
			StringClass.replace_method  "$g_ReturnValue"  "<"  "&lt;"
			StringClass.replace_method  "$g_ReturnValue"  "\""  "&quot;"
			g_ReturnValue="<ERROR msg=\"$g_ReturnValue\"/>"
		fi
	else
		g_ReturnValue=""
	fi
}


 
#********************************************************************
# Method: ErrClass.getCallTree_method
#    Returns the call tree text
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  ErrClass.getCallTree_method()
{
	local  LineNo="$1"
	local  TopIndex="$2"
	local  IsAbleLastCut="$3"
	local  indent=" "
	local  s

	if [ "${LANG}" == "ja_JP.UTF-8" ]; then
		s="コールツリー："
	else
		s="Call tree:"
	fi
	i=$(( ${#FUNCNAME[@]} - 1 ))
	s="$s${LF}""(global) ${BASH_SOURCE[$i]}:${BASH_LINENO[$i-1]}"
	for(( i=${#FUNCNAME[@]} - 2; i > $TopIndex; i-- ));do
		s="$s${LF}${indent}${FUNCNAME[$i]}() ${BASH_SOURCE[$i]}:${BASH_LINENO[$i-1]}"
		indent="${indent} "
	done ; done_func $?

	case  "${FUNCNAME[$TopIndex]}"  in
		"Error_func" | "DebugTrap_func" ) ;;
		*)  IsAbleLastCut=0 ;;
	esac
	if [ "$IsAbleLastCut" != "1" ];then
		if [ "$g_DebugTrapFunc" == "EchoOnTrap_func" ];then
			s="$s${LF}${indent}${FUNCNAME[$TopIndex]}() ${BASH_SOURCE[$TopIndex]}:$LineNo ?(->EchoOn_func)"
		elif [ "$g_DebugTrapFunc" == "EchoNextTrap_func" ];then
			s="$s${LF}${indent}${FUNCNAME[$TopIndex]}() ${BASH_SOURCE[$TopIndex]}:$LineNo ?(->EchoNext_func)"
		else
			s="$s${LF}${indent}${FUNCNAME[$TopIndex]}() ${BASH_SOURCE[$TopIndex]}:$LineNo"
		fi
	fi
	g_ReturnValue="$s"
}


#*********************************************************************
# Class: StringClass
#*********************************************************************

#*********************************************************************
# Method: StringClass.replace_method
#*********************************************************************
function  StringClass.replace_method()
{
	local  string="$1"
	local  from="$2"

	StringEscapeUtilsClass.escapeBashReplace_method  "$from"
	g_ReturnValue="${string//$g_ReturnValue/$3}"
}


#*********************************************************************
# Method: StringClass.right_method
#*********************************************************************
function  StringClass.right_method()
{
  local  in_String="$1"
  local  in_Length="$2"

  g_ReturnValue="${in_String:$(( ${#in_String} - $in_Length ))}"
}


#*********************************************************************
# Class: StringEscapeUtilsClass
#*********************************************************************

#*********************************************************************
# Method: StringEscapeUtilsClass.escapeGrep_method
#*********************************************************************
function  StringEscapeUtilsClass.escapeGrep_method()
{
	local  string="$1"
		string="${string//\\/\\\\}"
		string="${string//-/\-}"
		string="${string//./\.}"
		string="${string//$/\\$}"
		string="${string//^/\^}"
		string="${string//{/\{}"
		string="${string//\}/\}}"
		string="${string//[/\[}"
		string="${string//]/\]}"
		string="${string//\*/\*}"
		string="${string//+/\+}"
	g_ReturnValue="${string//\?/\?}"
}


#*********************************************************************
# Method: StringEscapeUtilsClass.escapeBashReplace_method
#*********************************************************************
function  StringEscapeUtilsClass.escapeBashReplace_method()
{
	local  string="$1"
		string="${string//\\/\\\\}"
		string="${string//\}/\}}"
		string="${string//\(/\\(}"
		string="${string//\)/\\)}"
		string="${string//\*/\\*}"
		string="${string//\?/\\?}"
	g_ReturnValue="${string//\//\\/}"
}


#********************************************************************
# Function: Exit_func
#    Exit the running shell script
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  Exit_func()
{
	g_DebugTrapFunc=""
	trap ':' EXIT
	exit $ret
}


 
#********************************************************************
# Function: DebugTrap_func
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  DebugTrap_func()
{
	if [ "$g_DebugTrapFunc" == "" ];then
		shift  2
		g_PipeStatus=( "$@" )
	else
		$g_DebugTrapFunc  "$@"
	fi
}


#********************************************************************
# Function: debugger
#    Starts step running
#
# Arguments:
#    None
#
# Return Value:
#    None
#********************************************************************
function  de()
{
	debugger
}

function  debugger()
{
	g_DebugTrapFunc="StepRunning_func"

	trap 'DebugTrap_func  "$LINENO"  "$BASH_COMMAND"  "${PIPESTATUS[@]}"
		#// resume ${PIPESTATUS[@]}
		case "${#g_PipeStatus[@]}" in
			"2")
				return ${g_PipeStatus[0]} | true;;
			"3")
				return ${g_PipeStatus[0]} | return ${g_PipeStatus[1]} | true;;
		esac' DEBUG
}

function  StepRunning_func()
{
	local  LineNo__="$1"
	local  Command__="$2"
	shift  2
	g_PipeStatus=( "$@" )

	local  key__
	local  a1__

	if [ "$step_running_guided" == "" ]; then
		ErrClass.getCallTree_method  "$LINENO"  2  1
		echo  "$g_ReturnValue"  >&2
		echo  "--- デバッガ情報 -------------------------"  >&2
		echo  "ステップ実行 … Enter キーを押してください"  >&2
		echo  "変数の値を表示 … 変数名を入力"              >&2
		echo  "------------------------------------------"  >&2
	fi

	echo  "${FUNCNAME[2]}() ${BASH_SOURCE[2]}:${BASH_LINENO[1]}"  >&2
	key__="goto_in_while"
	while [ "$key__" != "" ]; do
		read -p "$LineNo__: $Command__ " key__  #// break at the line

		#// inspect variable's value
		if [ "$key__" != "" ]; then

			case "$key__" in
			 "LineNo__" | "Command__" | "key__" | "a1__" )
				echo  "変数 $key__ の値の表示はサポートしていません。";;

			 *)
				CheckOutParamIsConflictToLocal_func  key__  

				key__=${key__/$/}  #// cut first $, if exists
				es  $key__  #// call es function
				;;
			esac
		fi
	done ; done_func $?

	step_running_guided=1
}


#********************************************************************
# Function: CallMain_func
#    Calls "Main_func"
#
# Arguments:
#    $* at starting
#
# Return Value:
#    None
#********************************************************************
function  CallMain_func()
{
	cd  "${g_ThisScriptPath%/*}"  #// parent of "${g_ThisScriptPath}"

	trap 'set +x ; ErrTrap_func' EXIT  #// Enable the exit trap
	trap 'set +x ; ErrTrap_func $LINENO ;  break' ERR  #// In function, it is necessary to bash -E option
	trap 'DebugTrap_func  "$LINENO"  "$BASH_COMMAND"  "${PIPESTATUS[@]}"
		#// resume ${PIPESTATUS[@]}
		case "${#g_PipeStatus[@]}" in
			"2")
				return ${g_PipeStatus[0]} | true;;
			"3")
				return ${g_PipeStatus[0]} | return ${g_PipeStatus[1]} | true;;
		esac' DEBUG
	set +e


	Main_func  "$1"  "AppKey4293"


	trap EXIT  #// Disable the exit trap
	if [ "${g_IsSourceCommand}" == "${True}" ]; then
		cd  "${g_StartInPath}"
	fi
}


#********************************************************************
# Variable: g_ThisScriptPath
#********************************************************************
export  g_StartInPath="$( pwd )"
export  g_ThisScriptRelativePath="${BASH_SOURCE}"
GetFullPath_func  "${g_ThisScriptRelativePath}"
g_ThisScriptPath="${g_ReturnValue}"
g_ParentOfThisScriptPath="${g_ThisScriptPath%/*}"
if [ "$0" == "${BASH_SOURCE}" ]; then
	export  g_IsSourceCommand="${False}"
else
	export  g_IsSourceCommand="${True}"
fi


#********************************************************************
# Variable: True
#********************************************************************
export  True=0  #// 0 is same as the specifiation of Linux bash "test" command


#********************************************************************
# Variable: False
#********************************************************************
export  False=1  #// Not 0 is same as the specifiation of Linux bash "test" command


#********************************************************************
# Variable: LF
#    Line feed
#********************************************************************
export  LF=`echo_e_func "\nx"`; LF="${LF:0:1}"


#********************************************************************
# Variable: Tab
#********************************************************************
export  Tab=`echo_e_func "\t"`


#********************************************************************
# Calling "CallMain_func"
#********************************************************************
CallMain_func  $*
