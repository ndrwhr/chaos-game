SHA=`git log -1 --format="%h"`

yarn build

cp -R ./build/* ../chaos-game-static/.

(
  cd ../chaos-game-static
  git add .
  git commit -m "Bumping to ${SHA}"
  git push
)
