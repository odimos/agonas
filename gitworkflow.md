git checkout main
git pull origin main
git checkout -b my-branch

# work
git add .
git commit -m "msg"
git push -u origin my-branch

git checkout main
git merge my-branch
git push origin main