# Dadosfera Metabase

- This Repository is a fork of [metabase/metabase](https://github.com/metabase/metabase)

## Update fork

Because we have introduced a few changes to the code, updating it should cause a lot of conflicts with the upstream.

To avoid unnecessary time consuming conflicts resolution, we can use the following strategy:

1. Add metabase remote to the repository

```bash
git remote add metabase git@github.com:metabase/metabase.git
```

2. Fetch the metabase remote

```bash
git fetch metabase
```

3. Checkout to the tag we want to update to (ex: v0.48.5)

```bash
git checkout v0.48.5
```

4. Create a new branch based on that tag

```bash
git checkout -b update/v0.48.5_dadosfera
```

5. Cherry-pick the commit [[Dadosfera] FEAT: Dadosfera changes](https://github.com/dadosfera/metabase/commit/e7b55ccd0d707aa8943d0b15d7852f13d3939eb2)

```bash
git cherry-pick e7b55ccd0d707aa8943d0b15d7852f13d3939eb2
```

This commit contains all changes we need to apply to metabase. It's important to keep it updated with every change we make to the code.

6. Resolve the conflicts, paying close attention to the changes we have made to the code.

> Sometimes the file we altered has been deleted in the upstream, but that doesn't mean the changes we made should be discarded. Check for new files that may have been added and that we may need to alter.
>
> ex.: `Header.jsx` was deleted in the upstream, but we have made changes to it. Search for files named `Header.tsx` or similars to see if the changes we made to should be applied to a new file.

7. After resolving the conflicts, run the application to make sure everything is working as expected.

```bash
docker build --no-cache --build-arg="VERSION=latest" -t metabase_local:latest .

docker run -p 3000:3000 --name metabase_local metabase_local:latest
```

8. If everything is working fine, commit the resolved conflicts using the same name as the previous

```bash
git commit -m "[Dadosfera] FEAT: Dadosfera changes"
```

> Remember to commit all the necessary changes into a single commit, to help other updates in the future.

9. **Copy the commit hash and description/title and save it to step 5** on this README, so it's always updated.

10. Push the changes and publish your branch on remote

```bash
git push origin update/v0.48.5_dadosfera
```

## Launching changes to Staging and production branches

After updating the fork, we need to launch the changes to the staging and production branches. The pull request is the best way to do so, but it shold rise a lot of conflicts, since our new branch is based on **metabase/metabase** not **dadosfera/metabase**. To avoid that, we can use the following strategy:

1. Reset stg branch to the new branch and force push

```bash
git checkout stg
git reset --hard update/v0.48.5_dadosfera
git push origin stg --force
```

> This is a dangerous command, and is intended to be used by advanced git users. It will overwrite the remote branch with your local changes. If you are not sure about what you are doing, please ask for help.

2. Run the deploy to stg using [metabase-deploy](https://github.com/dadosfera/metabase-deploy/actions/workflows/deploy-manually.yml) github action

3. Repeat steps for the production branch when all is validated on the staging environment
