# Get absolute directory of script
# https://stackoverflow.com/a/246128
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR

# Relative dir, currently hardcoded
dir="addons/"

side=$1

s=""
json=""
# Iterate over addon folders
for file in `ls -d -- */`; do

    # Add JSON line
    json+="\"${file%%/}\", "

    includeserver="false"

    # Add filenames for returning to Makefile

    # Configuration for what files to load
    addonfile="${file}addon.txt"

    # If config file exists
    if test -f "$addonfile"; then
        # Note https://stackoverflow.com/questions/12916352/shell-script-read-missing-last-line
        while read line || [ -n "$line" ]; do
            # Ignore if starts with # symbol
            # https://www.cyberciti.biz/faq/bash-check-if-string-starts-with-character-such-as/
            [[ $line =~ ^#.* ]] && continue
            if [ "$line" == "@includeserver true" ]; then
                if [ $side == "server" ]; then
                    includeserver="true"
                fi
                continue
            fi
            if [ "$line" == "@includeserver false" ]; then
                if [ $side == "server" ]; then
                    includeserver="false"
                fi
                continue
            fi
            [ $side == "server" ] && [ $includeserver == "false" ] && continue
            # For each matching file, to allow wildcards
            for linefile in `ls -- ${file}${line}`; do
                # Add file to file list
                s+="${dir}${linefile} "
            done;
        done < "${addonfile}"
    else
        [ $side == "server" ] && continue
        #For every js file in the addon folder
        for subfile in `ls -- ${file}*.js`; do
            # Add file to file list
            s+="${dir}${subfile} "
        done;
    fi

done;

# Output json
json=${json%%, }
echo "{ \"addons\": [${json}] }" > addons.json

# Output addon.js filenames
s=${s%% }
echo $s