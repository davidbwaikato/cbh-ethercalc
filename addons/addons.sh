# Get absolute directory of script
# https://stackoverflow.com/a/246128
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR

# Relative dir, currently hardcoded
dir="addons/"

# Iterate over addon folders
s=""
json=""
echo "{" > addons.json
for file in `ls -d -- */`; do
    # Add filename for returning to Makefile
    s+="${dir}${file}addon.js ";
    # Add JSON line
    json+="\"${file%%/}\", "
done;

# Output json
json=${json%%, }
echo "{ \"addons\": [${json}] }" > addons.json

# Output addon.js filenames
s=${s%% }
echo $s