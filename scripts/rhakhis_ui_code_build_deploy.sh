# FOR USE ON STAGING SERVER

# This will use node to build and deploy the code to the ui director
# This should be copied to /var/wfo-list directory so we have a single control point
# for safety the paths are fully qualified - don't want this run from the wrong director!
cd /var/wfo-list/rhakhis/ui-src/wfo
npm run build
rm -rf /var/wfo-list/rhakhis/ui/*  # remove all the existing live artifacts
cp -r /var/wfo-list/rhakhis/ui-src/wfo/build/* /var/wfo-list/rhakhis/ui # just copy everything over.


