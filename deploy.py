import os

try:
    print("Deplying to github")
    os.system('git init')
    os.system('git add .')
    os.system('git commit -m "Deploy"')
    os.system('git push origin master')
    print('succeeded')

except:
    print('deploy')